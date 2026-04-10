import { useEffect, useState } from "react";

function SharedDocument({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Ссылка табылмады");
      setLoading(false);
      return;
    }

    loadSharedDocument();

    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [token]);

  const loadSharedDocument = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const url = `${apiBase}/documents/shared/${token}`;

      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setError(data.message || "Қате шықты");
        } catch {
          setError(text || "Қате шықты");
        }
        setLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type") || "application/octet-stream";
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      setMimeType(contentType);
      setFileUrl(objectUrl);
      setLoading(false);
    } catch (err) {
      console.error("SHARED DOCUMENT ERROR:", err);
      setError("Серверге қосылу мүмкін болмады");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Shared Document</h1>
          <p className="mt-2 text-slate-600">
            Уақытша сілтеме арқылы ашылған құжат
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-sky-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              Құжат жүктелуде...
            </h2>
          </div>
        ) : error ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-red-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-600">{error}</h2>
          </div>
        ) : mimeType === "application/pdf" ? (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-4 shadow-sm">
            <iframe
              src={fileUrl}
              title="Shared PDF Viewer"
              className="h-[85vh] w-full rounded-[24px] border border-sky-100"
            />
          </div>
        ) : mimeType?.startsWith("image/") ? (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-4 text-center shadow-sm">
            <img
              src={fileUrl}
              alt="Shared document"
              className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100"
            />
          </div>
        ) : mimeType?.startsWith("text/plain") ? (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-4 shadow-sm">
            <iframe
              src={fileUrl}
              title="Shared Text Viewer"
              className="h-[85vh] w-full rounded-[24px] border border-sky-100"
            />
          </div>
        ) : (
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[32px] border border-sky-100 bg-white/95 p-8 text-center shadow-sm">
            <div className="text-5xl">📄</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              Preview қолжетімсіз
            </h2>
            <p className="mt-2 text-slate-600">
              Бұл файл түрі браузер ішінде көрсетілмейді.
            </p>
            <a
              href={fileUrl}
              download="shared-document"
              className="mt-5 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              Файлды жүктеу
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDocument;