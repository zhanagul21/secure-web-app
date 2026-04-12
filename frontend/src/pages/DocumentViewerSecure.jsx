import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function DocumentViewerSecure({ documentId, setPage, setLoggedIn }) {
  const previewRef = useRef(null);
  const [documentData, setDocumentData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("none");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDuration, setShareDuration] = useState(60);
  const [shareLoading, setShareLoading] = useState(false);

  const clearPreview = () => {
    if (previewRef.current) previewRef.current.innerHTML = "";
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setPreviewType("none");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const loadPreview = async () => {
    try {
      setLoading(true);
      setMessage("");
      setPreviewType("none");

      const metaRes = await API.get(`/documents/view/${documentId}`);
      setDocumentData(metaRes.data.document);

      const res = await API.get(`/documents/preview/${documentId}`, {
        responseType: "blob",
        validateStatus: () => true,
      });

      const contentType = res.headers["content-type"] || "";

      if (res.status >= 400) {
        const text = await res.data.text();
        try {
          const parsed = JSON.parse(text);
          setMessage(parsed.message || "Preview ашылмады.");
        } catch {
          setMessage(text || "Preview ашылмады.");
        }
        return;
      }

      clearPreview();

      if (contentType.includes("application/pdf") || contentType.startsWith("image/")) {
        setPreviewType("media");
        setPreviewUrl(URL.createObjectURL(res.data));
        return;
      }

      if (contentType.includes("text/plain")) {
        setPreviewType("text");
        const text = await res.data.text();
        if (previewRef.current) {
          previewRef.current.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; padding: 16px;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
        }
        return;
      }

      if (contentType.includes("text/html")) {
        setPreviewType("html");
        const html = await res.data.text();
        if (previewRef.current) previewRef.current.innerHTML = html;
        return;
      }

      setPreviewType("unsupported");
      setMessage("Бұл файл түріне preview қолдау көрсетілмейді. Файлды жүктеп алуға болады.");
    } catch (error) {
      setPreviewType("error");
      setMessage(error.response?.data?.message || error.message || "Preview қатесі.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [documentId]);

  const handleDownload = async () => {
    try {
      setMessage("");
      const res = await API.get(`/documents/download/${documentId}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: documentData?.mime_type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = documentData?.original_name || "document";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.response?.data?.message || "Файлды жүктеу кезінде қате шықты.");
    }
  };

  const createShareLink = async () => {
    try {
      setShareLoading(true);
      setMessage("");
      const res = await API.post(`/documents/share/${documentId}`, { durationMinutes: shareDuration });
      const shareUrl = res.data.shareUrl;

      if (!shareUrl) {
        setMessage("Сілтеме жасалмады.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareModalOpen(false);
      alert(`Сілтеме көшірілді:\n\n${shareUrl}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Сілтеме жасау кезінде қате шықты.");
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
              <h1 className="text-2xl font-black text-slate-800">Құжатты қауіпсіз қарау</h1>
              <p className="mt-2 text-sm text-slate-600">Бұл бетте файл серверден дешифрланып көрсетіледі.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("documents")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Артқа</button>
              <button onClick={handleDownload} className="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white">Дешифрлап жүктеу</button>
              <button onClick={() => setShareModalOpen(true)} className="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Уақытша сілтеме</button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {documentData && (
          <div className="mt-6 grid gap-4 rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm md:grid-cols-3">
            <p><b>Файл:</b> {documentData.original_name}</p>
            <p><b>Түрі:</b> {documentData.mime_type}</p>
            <p className="font-semibold text-emerald-700">Статус: дешифрланған preview</p>
          </div>
        )}

        {message && <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-4 text-slate-700">{message}</div>}

        <div className="mt-6 rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-600">Құжат жүктелуде...</div>
          ) : previewUrl ? (
            documentData?.mime_type === "application/pdf" ? (
              <iframe src={previewUrl} title="PDF Preview" className="h-[85vh] w-full rounded-[24px] border border-sky-100" />
            ) : (
              <div className="text-center">
                <img src={previewUrl} alt="preview" className="mx-auto max-h-[85vh] rounded-[24px] border border-sky-100" />
              </div>
            )
          ) : previewType === "unsupported" ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-sky-200 bg-sky-50 p-8 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  Алдын ала қарау бұл файл түрі үшін қолжетімсіз
                </p>
                <p className="mt-2 text-slate-600">
                  Құжат сақталған, оны дәл қазір дешифрлап жүктеп ашуға болады.
                </p>
                <button
                  onClick={handleDownload}
                  className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white"
                >
                  Дешифрлап жүктеу
                </button>
              </div>
            </div>
          ) : (
            <div ref={previewRef} className="min-h-[400px]" />
          )}
        </div>

        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-sky-200 bg-white p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800">Уақытша сілтеме жасау</h3>
              <p className="mt-2 text-sm text-slate-600">Сілтеме мерзімі біткен соң құжат ашылмайды.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[15, 60, 480, 1440].map((duration) => (
                  <button key={duration} onClick={() => setShareDuration(duration)} className={`rounded-2xl px-4 py-3 font-semibold ${shareDuration === duration ? "bg-slate-700 text-white" : "bg-sky-100 text-slate-800"}`}>
                    {duration === 15 ? "15 минут" : duration === 60 ? "1 сағат" : duration === 480 ? "8 сағат" : "1 күн"}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShareModalOpen(false)} className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700">Болдырмау</button>
                <button onClick={createShareLink} disabled={shareLoading} className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white">{shareLoading ? "Жасалуда..." : "Сілтеме жасау"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerSecure;
