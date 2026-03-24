import { useEffect, useState } from "react";
import API from "../services/api";

function DocumentViewer({ documentId, setPage, setLoggedIn }) {
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  const getFileTypeLabel = () => {
    if (mimeType === "application/pdf") return "PDF құжаты";
    if (mimeType?.startsWith("image/")) return "Сурет";
    if (mimeType?.startsWith("text/plain")) return "Мәтіндік файл";
    return "Құжат preview";
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl shadow-sm ring-1 ring-sky-100">
                📄
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Document Viewer
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Құжатты жүйе ішінде қарау және жүктеу бөлімі
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-sky-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
              >
                Құжаттар
              </button>

              <button
                onClick={handleDownload}
                className="rounded-2xl bg-emerald-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-600"
              >
                Жүктеу
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-rose-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-bold text-slate-800">
              Құжат туралы
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Preview түрі мен әрекеттер
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Файл түрі</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {mimeType ? getFileTypeLabel() : "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">MIME type</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {mimeType || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Күйі</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {loading ? "Жүктелуде..." : message ? "Қате" : "Дайын"}
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Файлды жүктеу
              </button>

              <button
                onClick={() => setPage("documents")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Құжаттар тізіміне оралу
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  Preview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Құжатты браузер ішінде қарау
                </p>
              </div>

              <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                Secure Viewer
              </span>
            </div>

            {loading && (
              <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-600">
                Құжат жүктелуде...
              </div>
            )}

            {!loading && message && (
              <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
                {message}
              </div>
            )}

            {!loading && !message && mimeType === "application/pdf" && (
              <iframe
                src={fileUrl}
                title="PDF Viewer"
                width="100%"
                height="900px"
                className="rounded-3xl border border-slate-200 bg-white"
              />
            )}

            {!loading && !message && mimeType?.startsWith("image/") && (
              <div className="flex min-h-[700px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <img
                  src={fileUrl}
                  alt="document preview"
                  className="max-h-[900px] w-auto rounded-2xl bg-white object-contain"
                />
              </div>
            )}

            {!loading && !message && mimeType?.startsWith("text/plain") && (
              <iframe
                src={fileUrl}
                title="Text Viewer"
                width="100%"
                height="900px"
                className="rounded-3xl border border-slate-200 bg-white"
              />
            )}

            {!loading &&
              !message &&
              mimeType !== "application/pdf" &&
              !mimeType?.startsWith("image/") &&
              !mimeType?.startsWith("text/plain") && (
                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="text-5xl">📁</div>
                  <h3 className="mt-4 text-xl font-bold text-slate-800">
                    Бұл файл түріне inline preview жоқ
                  </h3>
                  <p className="mt-2 max-w-md text-slate-600">
                    Файлды көру үшін жүктеп ашуға болады.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-5 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Файлды жүктеу
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;