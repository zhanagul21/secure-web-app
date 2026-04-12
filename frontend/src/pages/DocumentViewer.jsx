import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function DocumentViewer({ documentId, setPage, setLoggedIn }) {
  const previewRef = useRef(null);
  const [documentData, setDocumentData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDuration, setShareDuration] = useState(60);
  const [shareLoading, setShareLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const clearPreview = () => {
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      setMessage("");

      const metaRes = await API.get(`/documents/view/${documentId}`);
      const doc = metaRes.data.document;
      setDocumentData(doc);

      const res = await API.get(`/documents/preview/${documentId}`, {
        responseType: "blob",
        validateStatus: () => true,
      });

      const contentType = res.headers["content-type"] || "";

      if (res.status >= 400) {
        const text = await res.data.text();
        try {
          const parsed = JSON.parse(text);
          setMessage(parsed.message || "Preview ашылмады");
        } catch {
          setMessage(text || "Preview ашылмады");
        }
        return;
      }

      clearPreview();

      if (contentType.includes("application/pdf")) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }

      if (contentType.startsWith("image/")) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }

      if (contentType.includes("text/plain")) {
        const text = await res.data.text();
        if (previewRef.current) {
          previewRef.current.innerHTML = `
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; padding: 16px;">
${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </pre>
          `;
        }
        return;
      }

      if (contentType.includes("text/html")) {
        const html = await res.data.text();
        if (previewRef.current) {
          previewRef.current.innerHTML = html;
        }
        return;
      }

      setMessage("Бұл файл түріне preview қолдау көрсетілмейді");
    } catch (error) {
      console.log("PREVIEW ERROR:", error);
      setMessage(error.response?.data?.message || error.message || "Preview қатесі");
    } finally {
      setLoading(false);
    }
  };

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
      const a = window.document.createElement("a");
      a.href = url;
      a.download = documentData?.original_name || "document";
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("DOWNLOAD ERROR:", error);
      setMessage(
        error.response?.data?.message || "Файлды жүктеу кезінде қате шықты"
      );
    }
  };

  const openShareModal = () => {
    setShareDuration(60);
    setShareModalOpen(true);
    setMessage("");
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareDuration(60);
    setShareLoading(false);
  };

  const createShareLink = async () => {
    try {
      setShareLoading(true);
      setMessage("");

      const res = await API.post(`/documents/share/${documentId}`, {
        durationMinutes: shareDuration,
      });

      const shareUrl = res.data.shareUrl;

      if (!shareUrl) {
        setMessage("Сілтеме жасалмады");
        setShareLoading(false);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);

      const durationLabel =
        shareDuration === 15
          ? "15 минут"
          : shareDuration === 60
          ? "1 сағат"
          : shareDuration === 480
          ? "8 сағат"
          : "1 күн";

      closeShareModal();
      alert(`Сілтеме көшірілді:\n\n${shareUrl}\n\nЖарамдылық уақыты: ${durationLabel}`);
    } catch (error) {
      console.log("SHARE ERROR:", error);
      setMessage(
        error.response?.data?.message || "Сілтеме жасау кезінде қате шықты"
      );
      setShareLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-sky-700">Secure Web Application</p>
              <h1 className="text-2xl font-black text-slate-800">
                Құжатты қауіпсіз қарау
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
              >
                Артқа
              </button>

              <button
                onClick={handleDownload}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white"
              >
                Жүктеу
              </button>

              <button
                onClick={openShareModal}
                className="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white"
              >
                Бөлісу
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        {documentData && (
          <div className="mt-6 rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
            <p><b>Файл:</b> {documentData.original_name}</p>
            <p><b>Тип:</b> {documentData.mime_type}</p>
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-4 text-slate-700">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-600">Жүктелуде...</div>
          ) : previewUrl ? (
            documentData?.mime_type === "application/pdf" ? (
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="h-[85vh] w-full rounded-[24px] border border-sky-100"
              />
            ) : (
              <div className="text-center">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100"
                />
              </div>
            )
          ) : (
            <div ref={previewRef} className="min-h-[400px]" />
          )}
        </div>

        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-sky-200 bg-white p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800">
                Бөлісу сілтемесі
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Сілтеменің жарамдылық уақытын таңдаңыз
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShareDuration(15)}
                  className={`rounded-2xl px-4 py-3 font-semibold transition ${
                    shareDuration === 15
                      ? "bg-slate-700 text-white"
                      : "bg-sky-100 text-slate-800"
                  }`}
                >
                  15 минут
                </button>

                <button
                  onClick={() => setShareDuration(60)}
                  className={`rounded-2xl px-4 py-3 font-semibold transition ${
                    shareDuration === 60
                      ? "bg-slate-700 text-white"
                      : "bg-sky-100 text-slate-800"
                  }`}
                >
                  1 сағат
                </button>

                <button
                  onClick={() => setShareDuration(480)}
                  className={`rounded-2xl px-4 py-3 font-semibold transition ${
                    shareDuration === 480
                      ? "bg-slate-700 text-white"
                      : "bg-sky-100 text-slate-800"
                  }`}
                >
                  8 сағат
                </button>

                <button
                  onClick={() => setShareDuration(1440)}
                  className={`rounded-2xl px-4 py-3 font-semibold transition ${
                    shareDuration === 1440
                      ? "bg-slate-700 text-white"
                      : "bg-sky-100 text-slate-800"
                  }`}
                >
                  1 күн
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeShareModal}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Болдырмау
                </button>

                <button
                  onClick={createShareLink}
                  disabled={shareLoading}
                  className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {shareLoading ? "Жасалуда..." : "Сілтеме жасау"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewer;
