import { useEffect, useState } from "react";
import API from "../services/api";

function DocumentViewer({ documentId, setPage, setLoggedIn }) {
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const loadDocument = async () => {
    try {
      if (!documentId) {
        setMessage("Құжат ID табылмады");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const res = await API.get(`/documents/view/${documentId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType =
        res.headers["content-type"] || "application/octet-stream";

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      setMimeType(contentType);
      setFileUrl(url);
      setLoading(false);
    } catch (error) {
      console.log("VIEW ERROR:", error);
      setMessage("Файл ашылмады");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/documents/download/${documentId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("DOWNLOAD ERROR:", error);
      setMessage("Файлды жүктеу мүмкін болмады");
    }
  };

  useEffect(() => {
    loadDocument();

    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl);
      }
    };
  }, [documentId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AuthGuard Locker</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setPage("documents")}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            Құжаттар
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Жүктеу
          </button>

          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="p-6">
        {loading && <p className="text-slate-700">Құжат жүктелуде...</p>}

        {!loading && message && (
          <p className="text-red-600">{message}</p>
        )}

        {!loading && !message && mimeType === "application/pdf" && (
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="900px"
            className="rounded-xl border bg-white"
          />
        )}

        {!loading && !message && mimeType?.startsWith("image/") && (
          <img
            src={fileUrl}
            alt="document preview"
            className="max-h-[900px] rounded-xl border bg-white"
          />
        )}

        {!loading && !message && mimeType?.startsWith("text/plain") && (
          <iframe
            src={fileUrl}
            title="Text Viewer"
            width="100%"
            height="900px"
            className="rounded-xl border bg-white"
          />
        )}
      </div>
    </div>
  );
}

export default DocumentViewer;