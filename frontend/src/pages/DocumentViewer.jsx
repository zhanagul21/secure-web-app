import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import API from "../services/api";

function DocumentViewer({ documentId, setPage, setLoggedIn }) {
  const previewRef = useRef(null);
  const [documentData, setDocumentData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

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

      const metaRes = await API.get(`/documents/view/${documentId}`);
      const doc = metaRes.data.document;
      setDocumentData(doc);

      const res = await API.get(`/documents/preview/${documentId}`, {
        responseType: "blob",
        validateStatus: (status) => status >= 200 && status < 500,
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

      if (previewRef.current) {
        previewRef.current.innerHTML = "";
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      // PDF
      if (contentType.includes("application/pdf")) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }

      // IMG
      if (contentType.startsWith("image/")) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }

      // DOCX
      if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        const arrayBuffer = await res.data.arrayBuffer();
        await renderAsync(arrayBuffer, previewRef.current);
        return;
      }

      // TEXT
      if (contentType.includes("text/plain")) {
        const text = await res.data.text();
        previewRef.current.innerHTML = `
          <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; padding: 16px;">
${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        `;
        return;
      }

      // HTML
      if (contentType.includes("text/html")) {
        const html = await res.data.text();
        previewRef.current.innerHTML = html;
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
              <p className="text-sm font-medium text-sky-700">AuthGuard Locker</p>
              <h1 className="text-2xl font-black text-slate-800">Document Viewer</h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
              >
                Құжаттар
              </button>

              <button
                onClick={handleDownload}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white"
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
          <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-4 text-slate-700 shadow-sm">
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
                  {documentData?.title || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Файл</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {documentData?.original_name || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Түрі</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {documentData?.mime_type || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-800">Preview</h2>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-600">
                Құжат жүктелуде...
              </div>
            ) : previewUrl ? (
              documentData?.mime_type === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="h-[80vh] w-full rounded-[24px] border border-sky-100"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-[80vh] rounded-[24px] border border-sky-100"
                />
              )
            ) : (
              <div
                ref={previewRef}
                className="min-h-[80vh] overflow-auto rounded-[24px] border border-sky-100 bg-white p-4"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;