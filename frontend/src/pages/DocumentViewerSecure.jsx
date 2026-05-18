import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import API from "../services/api";
import { apiBaseUrl } from "../services/apiConfig";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const OFFICE_MIME_TYPES = new Set([
  "application/msword",
  DOCX_MIME_TYPE,
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const OFFICE_EXTENSIONS = new Set([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]);

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function getFileExtension(name = "") {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
}

function isOfficeDocument(doc) {
  return (
    OFFICE_MIME_TYPES.has(doc?.mime_type) ||
    OFFICE_EXTENSIONS.has(getFileExtension(doc?.original_name || doc?.filename || ""))
  );
}

function getOfficeEmbedUrl(fileUrl) {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
}

function getViewerLabel() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.email || user.full_name || localStorage.getItem("tempUserEmail") || "verified user";
  } catch {
    return localStorage.getItem("tempUserEmail") || "verified user";
  }
}

function DocumentViewerSecure({ documentId, setPage, setLoggedIn, logoutEverywhere }) {
  const docxPreviewRef = useRef(null);
  const [documentData, setDocumentData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [officeEmbedUrl, setOfficeEmbedUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [docxData, setDocxData] = useState(null);
  const [encryptionProof, setEncryptionProof] = useState(null);
  const [previewType, setPreviewType] = useState("none");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDuration, setShareDuration] = useState(60);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [watermarkTime, setWatermarkTime] = useState(() => new Date());
  const watermarkText = `AuthGuard • ${getViewerLabel()} • ${watermarkTime.toLocaleString("kk-KZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })} • DOC-${documentId}`;

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setPreviewMimeType("");
    setOfficeEmbedUrl("");
    setHtmlContent("");
    setDocxData(null);
    setPreviewType("none");
    if (docxPreviewRef.current) {
      docxPreviewRef.current.innerHTML = "";
    }
  };

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const loadOfficeViewerFallback = async (currentDocument) => {
    const shareRes = await API.post(`/documents/share/${documentId}`, {
      durationMinutes: 15,
    });
    const token =
      shareRes.data.token ||
      shareRes.data.shareUrl?.split("/").filter(Boolean).pop();

    if (!token) {
      throw new Error("Office preview сілтемесі жасалмады.");
    }

    const filename = encodeURIComponent(
      currentDocument.original_name || currentDocument.filename || "document"
    );
    const rawOfficeUrl = `${apiBaseUrl}/documents/shared/${token}/office/${filename}`;
    setPreviewType("office");
    setOfficeEmbedUrl(getOfficeEmbedUrl(rawOfficeUrl));
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      setMessage("");
      setPreviewType("none");

      const metaRes = await API.get(`/documents/view/${documentId}`);
      const currentDocument = metaRes.data.document;
      setDocumentData(currentDocument);
      clearPreview();

      API.get(`/documents/encryption-proof/${documentId}`)
        .then((proofRes) => setEncryptionProof(proofRes.data))
        .catch(() => setEncryptionProof(null));

      if (isOfficeDocument(currentDocument)) {
        await loadOfficeViewerFallback(currentDocument);
        return;
      }

      if (currentDocument?.mime_type === DOCX_MIME_TYPE) {
        const convertedRes = await API.get(`/documents/preview/${documentId}`, {
          responseType: "blob",
          validateStatus: () => true,
        });
        const convertedContentType = convertedRes.headers["content-type"] || "";

        if (
          convertedRes.status < 400 &&
          convertedContentType.includes("application/pdf")
        ) {
          setPreviewType("media");
          setPreviewMimeType(convertedContentType);
          setPreviewUrl(URL.createObjectURL(convertedRes.data));
          return;
        }

        if (
          convertedRes.status < 400 &&
          convertedContentType.includes("text/html")
        ) {
          setPreviewType("html");
          const html = await convertedRes.data.text();
          setHtmlContent(html);
          return;
        }

        const rawDocxRes = await API.get(`/documents/preview/${documentId}?raw=1`, {
          responseType: "arraybuffer",
          validateStatus: () => true,
        });

        if (rawDocxRes.status >= 400) {
          const text = new TextDecoder("utf-8").decode(rawDocxRes.data);
          try {
            const parsed = JSON.parse(text);
            setMessage(parsed.message || "DOCX preview ашылмады.");
          } catch {
            setMessage(text || "DOCX preview ашылмады.");
          }
          return;
        }

        setPreviewType("docx");
        setDocxData(rawDocxRes.data);
        return;
      }

      const res = await API.get(`/documents/preview/${documentId}`, {
        responseType: "blob",
        validateStatus: () => true,
      });

      const contentType = res.headers["content-type"] || "";

      if (res.status >= 400) {
        const text = await res.data.text();
        try {
          const parsed = JSON.parse(text);
          if (isOfficeDocument(currentDocument)) {
            await loadOfficeViewerFallback(currentDocument);
            return;
          }
          setMessage(parsed.message || "Preview ашылмады.");
        } catch {
          if (isOfficeDocument(currentDocument)) {
            await loadOfficeViewerFallback(currentDocument);
            return;
          }
          setMessage(text || "Preview ашылмады.");
        }
        return;
      }

      if (
        contentType.includes("application/pdf") ||
        contentType.startsWith("image/")
      ) {
        setPreviewType("media");
        setPreviewMimeType(contentType);
        setPreviewUrl(URL.createObjectURL(res.data));
        return;
      }

      if (contentType.includes("text/plain")) {
        setPreviewType("html");
        const text = await res.data.text();
        setHtmlContent(
          `<!doctype html><html><body style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a;"><pre style="white-space: pre-wrap; word-wrap: break-word;">${text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre></body></html>`
        );
        return;
      }

      if (contentType.includes("text/html")) {
        setPreviewType("html");
        const html = await res.data.text();
        setHtmlContent(html);
        return;
      }

      setPreviewType("unsupported");
      setMessage(
        "Бұл файл түріне сайт ішінде preview жоқ. Бірақ оны жүктеп ашуға болады."
      );
    } catch (error) {
      setPreviewType("error");
      setMessage(
        error.response?.data?.message || error.message || "Preview қатесі."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [documentId]);

  useEffect(() => {
    const timer = window.setInterval(() => setWatermarkTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previewType !== "docx" || !docxData || !docxPreviewRef.current) {
      return undefined;
    }

    const container = docxPreviewRef.current;
    let cancelled = false;
    container.innerHTML = "";

    renderAsync(docxData, container, container, {
      className: "docx",
      inWrapper: true,
      hideWrapperOnPrint: false,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
      experimental: true,
      trimXmlDeclaration: true,
      useBase64URL: true,
      renderChanges: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      renderComments: false,
      renderAltChunks: true,
      debug: false,
    }).catch((error) => {
      if (!cancelled) {
        setPreviewType("unsupported");
        setMessage(error?.message || "DOCX preview ашылмады. Файлды жүктеп ашыңыз.");
      }
    });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [previewType, docxData]);

  const handleDownload = async () => {
    try {
      setMessage("");
      const res = await API.get(`/documents/download/${documentId}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: documentData?.mime_type || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = documentData?.original_name || "document";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Файлды жүктеу кезінде қате шықты."
      );
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Сілтемені көшіру мүмкін болмады.");
    }
  };

  const createShareLink = async () => {
    try {
      setShareLoading(true);
      setMessage("");
      setCopied(false);
      const res = await API.post(`/documents/share/${documentId}`, {
        durationMinutes: shareDuration,
      });
      if (!res.data.shareUrl) {
        setMessage("Сілтеме жасалмады.");
        return;
      }
      setShareUrl(res.data.shareUrl);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Сілтеме жасау кезінде қате шықты."
      );
    } finally {
      setShareLoading(false);
    }
  };

  const renderPreview = () => {
    if (previewUrl) {
      if (previewMimeType.includes("application/pdf")) {
        return (
          <iframe
            src={previewUrl}
            title="PDF Preview"
            className="h-[82vh] w-full rounded-[24px] border border-sky-100"
          />
        );
      }

      return (
        <div className="text-center">
          <img
            src={previewUrl}
            alt="preview"
            className="mx-auto max-h-[82vh] rounded-[24px] border border-sky-100"
          />
        </div>
      );
    }

    if (previewType === "html" && htmlContent) {
      return (
        <iframe
          title="Document HTML Preview"
          srcDoc={htmlContent}
          className="h-[82vh] w-full rounded-[24px] border border-sky-100 bg-white"
        />
      );
    }

    if (previewType === "office" && officeEmbedUrl) {
      return (
        <iframe
          src={officeEmbedUrl}
          title="Office Preview"
          className="h-[82vh] w-full rounded-[24px] border border-sky-100 bg-white"
          allowFullScreen
        />
      );
    }

    if (previewType === "docx") {
      return (
        <div className="h-[82vh] w-full overflow-auto rounded-[24px] border border-sky-100 bg-slate-100 p-4">
          <div
            ref={docxPreviewRef}
            className="[&_.docx-wrapper]:!bg-slate-100 [&_.docx-wrapper]:!p-0 [&_.docx]:!mx-auto [&_.docx]:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          />
        </div>
      );
    }

    if (previewType === "unsupported") {
      return (
        <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-sky-200 bg-sky-50 p-8 text-center">
          <div>
            <p className="text-lg font-semibold text-slate-800">
              Бұл файл түрі үшін сайт ішінде тікелей preview жоқ
            </p>
            <p className="mt-2 text-slate-600">
              Құжат сақталған. Оны дәл қазір жүктеп ашуға болады.
            </p>
            <button
              onClick={handleDownload}
              className="mt-5 rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white"
            >
              Жүктеу
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[500px] rounded-[24px] border border-sky-100 bg-white" />
    );
  };

  const renderWatermarkOverlay = () => (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[24px] opacity-[0.13]">
      <div className="grid h-full w-full -rotate-12 grid-cols-2 gap-x-16 gap-y-12 p-10 text-center text-sm font-black uppercase tracking-[0.28em] text-slate-900 md:grid-cols-3">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className="whitespace-nowrap">
            {watermarkText}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_38%,#dbeafe_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                Құжатты қауіпсіз қарау
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Құжат серверде дешифрланып, қорғалған арнамен көрсетіледі.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white"
              >
                Артқа
              </button>
              <button
                onClick={handleDownload}
                className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white"
              >
                Жүктеу
              </button>
              <button
                onClick={() => {
                  setShareModalOpen(true);
                  setShareUrl("");
                  setCopied(false);
                }}
                className="rounded-2xl bg-sky-600 px-4 py-2.5 font-semibold text-white"
              >
                Уақытша сілтеме
              </button>
              <button
                onClick={logout}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Құжат метадерегі
              </h2>
              {documentData ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Атауы
                    </div>
                    <div className="mt-2 text-lg font-bold text-slate-900">
                      {documentData.title}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Категория
                    </div>
                    <div className="mt-2 text-sm font-semibold text-sky-700">
                      {documentData.category || "-"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Файл
                    </div>
                    <div className="mt-2 break-all text-sm text-slate-700">
                      {documentData.original_name || "-"}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        MIME type
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        {documentData.mime_type || "-"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Көлем
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        {formatFileSize(Number(documentData.file_size || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 text-sm text-slate-500">
                  Метадерек жүктелуде...
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <h2 className="text-xl font-black text-emerald-900">
                Қауіпсіздік статусы
              </h2>
              <p className="mt-3 text-sm leading-6 text-emerald-900">
                Бұл preview сервер жағында уақытша дешифрланып беріледі.
                Құжаттың негізгі сақталу күйі шифрланған.
              </p>
              {encryptionProof && (
                <div className="mt-4 space-y-2 text-sm text-emerald-950">
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
                    Алгоритм: <b>{encryptionProof.algorithm}</b>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
                    Marker: <b>{encryptionProof.marker}</b> ({encryptionProof.storedHeaderText})
                  </div>
                  <div className="break-all rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
                    Ciphertext SHA-256: {encryptionProof.ciphertextSha256}
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
                    Stored: {formatFileSize(encryptionProof.storedSizeBytes)} /
                    Decrypted: {formatFileSize(encryptionProof.originalSizeBytes)}
                  </div>
                </div>
              )}
            </div>

            {message && (
              <div className="rounded-[24px] border border-rose-100 bg-white/95 p-4 text-slate-700 shadow-sm">
                <div>{message}</div>
                {!loading && (
                  <button
                    onClick={handleDownload}
                    className="mt-4 rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white"
                  >
                    Файлды жүктеп ашу
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            {loading ? (
              <div className="py-16 text-center text-slate-600">
                Құжат жүктелуде...
              </div>
            ) : (
              <div className="relative">
                {renderPreview()}
                {previewType !== "unsupported" && renderWatermarkOverlay()}
              </div>
            )}
          </div>
        </div>

        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
            <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900">
                Уақытша сілтеме
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Пайдаланушы осы сілтеме арқылы құжатты шектеулі уақыт ішінде аша
                алады.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[15, 60, 480, 1440].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setShareDuration(duration)}
                    className={`rounded-2xl px-4 py-3 font-semibold ${
                      shareDuration === duration
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {duration === 15
                      ? "15 минут"
                      : duration === 60
                      ? "1 сағат"
                      : duration === 480
                      ? "8 сағат"
                      : "1 күн"}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  Жабу
                </button>
                <button
                  onClick={createShareLink}
                  disabled={shareLoading}
                  className="w-full rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white"
                >
                  {shareLoading ? "Жасалуда..." : "Сілтеме жасау"}
                </button>
              </div>
              {shareUrl && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Дайын сілтеме
                  </label>
                  <div className="flex gap-3">
                    <input
                      readOnly
                      value={shareUrl}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="shrink-0 rounded-2xl bg-slate-800 px-4 py-3 font-semibold text-white"
                    >
                      {copied ? "Көшірілді" : "Көшіру"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerSecure;
