import { useEffect, useMemo, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import {
  apiBaseUrl,
  getFetchErrorMessage,
} from "../services/apiConfig";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function SharedDocumentSecure({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [docxBlob, setDocxBlob] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [now, setNow] = useState(Date.now());
  const docxContainerRef = useRef(null);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    const loadSharedDocument = async () => {
      if (!token) {
        setError("Сілтеме табылмады.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/documents/shared/${token}?raw=1`);
        const contentType =
          res.headers.get("content-type") || "application/octet-stream";
        const expiresHeader = res.headers.get("x-expires-at");

        if (expiresHeader) {
          setExpiresAt(expiresHeader);
          setNow(Date.now());
        }

        if (!res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setError(data.message || "Қате шықты.");
          } catch {
            setError(text || "Қате шықты.");
          }
          return;
        }

        if (cancelled) return;

        setMimeType(contentType);
        setFileUrl("");
        setHtmlContent("");
        setDocxBlob(null);

        if (contentType.includes(DOCX_MIME_TYPE)) {
          const blob = await res.blob();
          setDocxBlob(blob);
          return;
        }

        if (contentType.includes("text/html")) {
          const html = await res.text();
          setHtmlContent(html);
          return;
        }

        if (contentType.includes("text/plain")) {
          const text = await res.text();
          setHtmlContent(
            `<!doctype html><html><body style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a;"><pre style="white-space: pre-wrap; word-wrap: break-word;">${text
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</pre></body></html>`
          );
          return;
        }

        const blob = await res.blob();
        objectUrl = window.URL.createObjectURL(blob);
        if (!cancelled) {
          setFileUrl(objectUrl);
        }
      } catch (fetchError) {
        setError(
          getFetchErrorMessage(fetchError, "Серверге қосылу мүмкін болмады.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadSharedDocument();

    return () => {
      cancelled = true;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [token]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!docxBlob || !docxContainerRef.current) return undefined;

    let cancelled = false;
    const container = docxContainerRef.current;
    container.innerHTML = "";

    renderAsync(docxBlob, container, undefined, {
      className: "docx-preview",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      useBase64URL: true,
    }).catch((renderError) => {
      if (!cancelled) {
        setError(renderError.message || "Word preview көрсету кезінде қате шықты.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [docxBlob]);

  const remainingTime = useMemo(() => {
    if (!expiresAt) return "00:00:00";

    const diff = new Date(expiresAt).getTime() - now;
    if (!Number.isFinite(diff)) return "00:00:00";
    if (diff <= 0) return "00:00:00";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(
      Math.floor((totalSeconds % 3600) / 60)
    ).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [expiresAt, now]);

  const downloadShared = () => {
    window.open(`${apiBaseUrl}/documents/shared/${token}/download`, "_blank");
  };

  const renderPreview = () => {
    if (fileUrl && mimeType.includes("application/pdf")) {
      return (
        <iframe
          src={fileUrl}
          title="Shared PDF Viewer"
          className="h-[85vh] w-full rounded-[24px] border border-sky-100"
        />
      );
    }

    if (fileUrl && mimeType?.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt="Shared document"
          className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100"
        />
      );
    }

    if (htmlContent) {
      return (
        <iframe
          title="Shared HTML Preview"
          srcDoc={htmlContent}
          className="h-[85vh] w-full rounded-[24px] border border-sky-100 bg-white"
        />
      );
    }

    if (docxBlob) {
      return (
        <div className="max-h-[85vh] overflow-auto rounded-[24px] border border-sky-100 bg-slate-100 p-4">
          <div ref={docxContainerRef} className="docx-preview-host" />
        </div>
      );
    }

    return (
      <div className="min-h-[500px] rounded-[24px] border border-sky-100 bg-white" />
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_38%,#dbeafe_100%)] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Ортақ қорғалған құжат
              </h1>
              <p className="mt-2 text-slate-600">
                Құжат уақытша сілтеме арқылы ашылды және қауіпсіз түрде
                көрсетіледі.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                Қалған уақыт
              </div>
              <div className="mt-2 text-2xl font-black">{remainingTime}</div>
              <div className="mt-2 text-sm text-slate-300">
                {expiresAt ? new Date(expiresAt).toLocaleString() : "Уақыты алынуда"}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-white/70 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              Құжат жүктелуде...
            </h2>
          </div>
        ) : error ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-rose-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-rose-600">{error}</h2>
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-emerald-700">
                Статус: дешифрланған preview
              </p>
              <button
                onClick={downloadShared}
                className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white"
              >
                Жүктеу
              </button>
            </div>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDocumentSecure;
