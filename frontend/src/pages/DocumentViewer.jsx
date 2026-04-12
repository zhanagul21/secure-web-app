import { useEffect, useState } from "react";
import API from "../services/api";

function DocumentViewer({ documentId, setPage, setLoggedIn }) {
  const [document, setDocument] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const loadDocument = async () => {
    try {
      if (!documentId) {
        setMessage("Құжат ID табылмады");
        setLoading(false);
        return;
      }

      const res = await API.get(`/documents/view/${documentId}`);
      const doc = res.data.document;

      if (!doc) {
        setMessage("Құжат табылмады");
        setLoading(false);
        return;
      }

      setDocument(doc);
      setMimeType(doc.mime_type || "");
      setMessage("");
    } catch (error) {
      console.log("VIEW ERROR:", error);
      setMessage(error.response?.data?.message || "Құжат ашылмады");
    }
  };

  const loadPreview = async () => {
    try {
      const res = await API.get(`/documents/preview/${documentId}`, {
        responseType: "blob",
      });

      const blobType =
        res.data.type || document?.mime_type || "application/octet-stream";

      const blob = new Blob([res.data], { type: blobType });
      const objectUrl = window.URL.createObjectURL(blob);

      setPreviewBlobUrl(objectUrl);
      setMessage("");
    } catch (error) {
      console.log("PREVIEW ERROR:", error);
      setMessage(error.response?.data?.message || "Preview ашылмады");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await API.get(`/documents/download/${documentId}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: document?.mime_type || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = document?.original_name || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      setMessage("");
    } catch (error) {
      console.log("DOWNLOAD ERROR:", error);
      setMessage(error.response?.data?.message || "Файлды жүктеу кезінде қате шықты");
    }
  };

  const createShareLink = async () => {
    try {
      setShareLoading(true);
      setShareMessage("");
      setShareUrl("");

      const res = await API.post(`/documents/share/${documentId}`, {
        durationMinutes,
      });

      if (!res.data.shareUrl) {
        setShareMessage("Сілтеме жасалмады");
        return;
      }

      setShareUrl(res.data.shareUrl);
      setShareMessage("Сілтеме дайын");
    } catch (error) {
      console.log("SHARE ERROR:", error);
      setShareMessage(
        error.response?.data?.message || "Сілтеме жасау кезінде қате шықты"
      );
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      if (!shareUrl) return;
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Сілтеме көшірілді");
    } catch {
      setShareMessage("Сілтемені көшіру мүмкін болмады");
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      await loadDocument();
      if (mounted) {
        await loadPreview();
      }
      if (mounted) {
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [documentId]);

  const renderPreview = () => {
    if (!previewBlobUrl) return null;

    if (mimeType?.startsWith("image/")) {
      return (
        <img
          src={previewBlobUrl}
          alt="Document preview"
          className="mx-auto max-h-[80vh] rounded-[24px] border border-sky-100"
        />
      );
    }

    return (
      <iframe
        src={previewBlobUrl}
        title="Document Preview"
        className="h-[80vh] w-full rounded-[24px] border border-sky-100"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Document Viewer
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Құжатты жүйе ішінде қарау, жүктеу және бөлісу
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
              >
                Құжаттар
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
              >
                Бөлісу
              </button>

              <button
                onClick={handleDownload}
                className="rounded-2xl bg-emerald-500 px-4 py-2.5 font-semibold text-white"
              >
                Жүктеу
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-rose-500 px-4 py-2.5 font-semibold text-white"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-white/95 p-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Құжат туралы</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Атауы</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {document?.title || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Файл</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {document?.original_name || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">MIME type</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {mimeType || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Категория</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {document?.category || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-xl font-bold text-slate-800 sm:text-2xl">
              Preview
            </h2>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-600">
                Құжат жүктелуде...
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </div>

        {shareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800">Құжатты бөлісу</h3>
              <p className="mt-2 text-sm text-slate-600">Уақытша сілтеме жасаңыз</p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Сілтеме мерзімі
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
                >
                  <option value={15}>15 минут</option>
                  <option value={60}>1 сағат</option>
                  <option value={480}>8 сағат</option>
                  <option value={1440}>24 сағат</option>
                </select>
              </div>

              {shareUrl && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="mb-2 text-sm text-slate-500">Сілтеме</p>
                  <p className="break-all text-sm text-slate-800">{shareUrl}</p>
                </div>
              )}

              {shareMessage && (
                <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-slate-700">
                  {shareMessage}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={createShareLink}
                  disabled={shareLoading}
                  className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
                >
                  {shareLoading ? "Жасалуда..." : "Сілтеме жасау"}
                </button>

                <button
                  onClick={copyShareLink}
                  disabled={!shareUrl}
                  className="rounded-2xl bg-emerald-500 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  Көшіру
                </button>

                <button
                  onClick={() => {
                    setShareOpen(false);
                    setShareUrl("");
                    setShareMessage("");
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700"
                >
                  Жабу
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