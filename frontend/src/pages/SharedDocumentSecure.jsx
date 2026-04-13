import { useEffect, useMemo, useState } from "react";

function SharedDocumentSecure({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadSharedDocument = async () => {
      if (!token) {
        setError("Сілтеме табылмады.");
        setLoading(false);
        return;
      }

      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/documents/shared/${token}`);
        const contentType = res.headers.get("content-type") || "application/octet-stream";
        const expiresHeader = res.headers.get("x-expires-at");

        if (expiresHeader) {
          setExpiresAt(expiresHeader);
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

        setMimeType(contentType);
        setFileUrl("");
        setHtmlContent("");

        if (contentType.includes("text/html")) {
          const html = await res.text();
          setHtmlContent(html);
          return;
        }

        if (contentType.includes("text/plain")) {
          const text = await res.text();
          setHtmlContent(`<!doctype html><html><body style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a;"><pre style="white-space: pre-wrap; word-wrap: break-word;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`);
          return;
        }

        const blob = await res.blob();
        setFileUrl(window.URL.createObjectURL(blob));
      } catch {
        setError("Серверге қосылу мүмкін болмады.");
      } finally {
        setLoading(false);
      }
    };

    loadSharedDocument();

    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [token]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const remainingTime = useMemo(() => {
    if (!expiresAt) return "Есептелуде...";

    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return "00:00:00";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [expiresAt, now]);

  const downloadShared = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    window.open(`${apiBase}/documents/shared/${token}/download`, "_blank");
  };

  const renderPreview = () => {
    if (fileUrl && mimeType === "application/pdf") {
      return <iframe src={fileUrl} title="Shared PDF Viewer" className="h-[85vh] w-full rounded-[24px] border border-sky-100" />;
    }

    if (fileUrl && mimeType?.startsWith("image/")) {
      return <img src={fileUrl} alt="Shared document" className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100" />;
    }

    if (htmlContent) {
      return <iframe title="Shared HTML Preview" srcDoc={htmlContent} className="h-[85vh] w-full rounded-[24px] border border-sky-100 bg-white" />;
    }

    return <div className="min-h-[500px] rounded-[24px] border border-sky-100 bg-white" />;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_38%,#dbeafe_100%)] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">AuthGuard Locker</p>
              <h1 className="text-2xl font-bold text-slate-900">Ортақ қорғалған құжат</h1>
              <p className="mt-2 text-slate-600">Құжат уақытша сілтеме арқылы ашылды және қауіпсіз түрде көрсетіледі.</p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Қалған уақыт</div>
              <div className="mt-2 text-2xl font-black">{remainingTime}</div>
              <div className="mt-2 text-sm text-slate-300">{expiresAt ? new Date(expiresAt).toLocaleString() : "Есептелуде..."}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-white/70 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Құжат жүктелуде...</h2>
          </div>
        ) : error ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-rose-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-rose-600">{error}</h2>
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-emerald-700">Статус: дешифрланған preview</p>
              <button onClick={downloadShared} className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">Жүктеу</button>
            </div>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDocumentSecure;
