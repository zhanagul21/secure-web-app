import { useEffect, useRef, useState } from "react";

function SharedDocument({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const previewRef = useRef(null);

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

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Уақыты аяқталды");
        setError("Сілтеменің уақыты өтіп кетті");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        setTimeLeft(`${days} күн ${hours} сағ ${minutes} мин`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} сағ ${minutes} мин ${seconds} сек`);
      } else {
        setTimeLeft(`${minutes} мин ${seconds} сек`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const clearPreview = () => {
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
    }
    if (fileUrl) {
      window.URL.revokeObjectURL(fileUrl);
      setFileUrl("");
    }
  };

  const loadSharedDocument = async () => {
    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      const url = `${apiBase}/documents/shared/${token}`;

      const res = await fetch(url);

      const contentType =
        res.headers.get("content-type") || "application/octet-stream";
      const expiresHeader = res.headers.get("x-expires-at");

      if (expiresHeader) {
        setExpiresAt(expiresHeader);
      }

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

      clearPreview();
      setMimeType(contentType);

      if (contentType.includes("text/html")) {
        const html = await res.text();
        if (previewRef.current) {
          previewRef.current.innerHTML = html;
        }
        setLoading(false);
        return;
      }

      if (contentType.includes("text/plain")) {
        const text = await res.text();
        if (previewRef.current) {
          previewRef.current.innerHTML = `
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; padding: 16px;">
${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </pre>
          `;
        }
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      setFileUrl(objectUrl);
      setLoading(false);
    } catch (err) {
      console.error("SHARED DOCUMENT ERROR:", err);
      setError("Серверге қосылу мүмкін болмады");
      setLoading(false);
    }
  };

  const downloadShared = () => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    window.open(`${apiBase}/documents/shared/${token}/download`, "_blank");
  };

  const renderPreview = () => {
    if (fileUrl && mimeType === "application/pdf") {
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
        <div className="text-center">
          <img
            src={fileUrl}
            alt="Shared document"
            className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100"
          />
        </div>
      );
    }

    return <div ref={previewRef} className="min-h-[400px]" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Shared Document</h1>
              <p className="mt-2 text-slate-600">
                Уақытша сілтеме арқылы ашылған құжат
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-100">
              <div className="font-semibold text-slate-800">Қалған уақыт</div>
              <div className="mt-1">{timeLeft || "Есептелуде..."}</div>
            </div>
          </div>
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
        ) : (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-4 shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                {expiresAt && (
                  <>
                    Жарамдылық уақыты:
                    {" "}
                    <span className="font-semibold text-slate-800">
                      {new Date(expiresAt).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={downloadShared}
                className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Файлды жүктеу
              </button>
            </div>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDocument;