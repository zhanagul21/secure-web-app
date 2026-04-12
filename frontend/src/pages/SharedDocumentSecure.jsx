import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

function SharedDocumentSecure({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const previewRef = useRef(null);

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
        if (expiresHeader) setExpiresAt(expiresHeader);

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

        if (contentType.includes("text/html")) {
          const html = await res.text();
          if (previewRef.current) previewRef.current.innerHTML = html;
          return;
        }

        if (contentType.includes("text/plain")) {
          const text = await res.text();
          if (previewRef.current) {
            previewRef.current.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; padding: 16px;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
          }
          return;
        }

        if (
          contentType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();

          if (previewRef.current) {
            previewRef.current.innerHTML = "";
            await renderAsync(arrayBuffer, previewRef.current, null, {
              className: "docx-preview",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
            });
          }
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
      if (fileUrl) window.URL.revokeObjectURL(fileUrl);
    };
  }, [token]);

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
    return (
      <div
        ref={previewRef}
        className="min-h-[400px] overflow-auto rounded-[24px] bg-white [&_.docx-wrapper]:!bg-white [&_.docx-wrapper]:!p-0"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
              <h1 className="text-2xl font-bold text-slate-800">Ортақ қорғалған құжат</h1>
              <p className="mt-2 text-slate-600">Уақытша сілтеме арқылы ашылды. Құжат серверде дешифрланып көрсетіледі.</p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-sky-100">
              <div className="font-semibold text-slate-800">Жарамдылық уақыты</div>
              <div className="mt-1">{expiresAt ? new Date(expiresAt).toLocaleString() : "Есептелуде..."}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-sky-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Құжат жүктелуде...</h2>
          </div>
        ) : error ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[32px] border border-red-100 bg-white/95 p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-600">{error}</h2>
          </div>
        ) : (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-emerald-700">Статус: дешифрланған preview</p>
              <button onClick={downloadShared} className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">Дешифрлап жүктеу</button>
            </div>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDocumentSecure;
