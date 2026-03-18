import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function Dashboard({ setLoggedIn, setPage, setSelectedDocumentId }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
      setMessage("Пайдаланушы мәліметін жүктеу кезінде қате шықты");
    }
  };

  const getDocuments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/documents/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error("GET DOCUMENTS ERROR:", error);
      setMessage("Құжаттарды жүктеу кезінде қате шықты");
    }
  };

  const getLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/logs/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(res.data.logs || []);
    } catch (error) {
      console.error("GET LOGS ERROR:", error);
    }
  };

  useEffect(() => {
    getProfile();
    getDocuments();
    getLogs();
  }, []);

  const recentDocuments = useMemo(() => {
    return [...documents].slice(0, 5);
  }, [documents]);

  const recentLogs = useMemo(() => {
    return [...logs].slice(0, 5);
  }, [logs]);

  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const totalViews = logs.filter((log) => log.action_type === "DOCUMENT_VIEW").length;
    const totalDownloads = logs.filter(
      (log) => log.action_type === "DOCUMENT_DOWNLOAD"
    ).length;
    const totalDeletes = logs.filter((log) => log.action_type === "DOCUMENT_DELETE").length;

    return {
      totalDocuments,
      totalViews,
      totalDownloads,
      totalDeletes,
    };
  }, [documents, logs]);

  const getFileTypeLabel = (mimeType) => {
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType?.startsWith("image/")) return "Сурет";
    if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "Word";
    }
    if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "PowerPoint";
    }
    if (mimeType === "text/plain") return "TXT";
    return "Файл";
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") return "📄";
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "📝";
    }
    if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "📊";
    }
    if (mimeType === "text/plain") return "📃";
    return "📁";
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case "DOCUMENT_ADD":
        return "Құжат қосылды";
      case "DOCUMENT_VIEW":
        return "Құжат ашылды";
      case "DOCUMENT_DOWNLOAD":
        return "Құжат жүктелді";
      case "DOCUMENT_DELETE":
        return "Құжат өшірілді";
      default:
        return actionType || "Әрекет";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Қорғалған құжат сақтау жүйесі</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("documents")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
          >
            Құжаттар
          </button>

          <button
            onClick={() => setPage("addDocument")}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl"
          >
            Құжат қосу
          </button>

          <button
            onClick={() => setPage("logs")}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl"
          >
            Әрекет тарихы
          </button>

          <button
            onClick={() => setPage("profile")}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl"
          >
            Профиль
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => setPage("admin")}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 rounded-xl"
            >
              Admin
            </button>
          )}

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">
            Құжаттар, белсенділік және аккаунт бойынша қысқаша ақпарат
          </p>
        </div>

        {message && (
          <div className="bg-white border rounded-2xl p-4 mb-6 text-red-600">
            {message}
          </div>
        )}

        {user && (
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Пайдаланушы ақпараты</h3>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl border p-4">
                <p className="text-sm text-slate-500 mb-1">ID</p>
                <p className="font-semibold text-slate-900">{user.id}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl border p-4">
                <p className="text-sm text-slate-500 mb-1">Аты-жөні</p>
                <p className="font-semibold text-slate-900">
                  {user.full_name || "-"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border p-4">
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="font-semibold text-slate-900 break-all">
                  {user.email || "-"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border p-4">
                <p className="text-sm text-slate-500 mb-1">Рөлі</p>
                <p className="font-semibold text-slate-900 uppercase">
                  {user.role || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Барлық құжаттар</p>
            <p className="text-3xl font-bold text-slate-900">
              {stats.totalDocuments}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Қаралған құжаттар</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalViews}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Жүктелген құжаттар</p>
            <p className="text-3xl font-bold text-emerald-600">
              {stats.totalDownloads}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Өшірілген құжаттар</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.totalDeletes}
            </p>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h3 className="text-xl font-bold">Соңғы құжаттар</h3>

              <button
                onClick={() => setPage("documents")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Барлығын көру
              </button>
            </div>

            {recentDocuments.length === 0 ? (
              <p className="text-slate-500">Әзірге құжаттар жоқ</p>
            ) : (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-50"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-3xl">{getFileIcon(doc.mime_type)}</span>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">
                          {doc.title}
                        </h4>

                        <p className="text-sm text-slate-500">
                          {doc.category || "-"}
                        </p>

                        <p className="text-sm text-slate-500 break-all">
                          {doc.original_name || "Файл"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {getFileTypeLabel(doc.mime_type)}
                          {doc.file_size > 0
                            ? ` • ${(doc.file_size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDocumentId(doc.id);
                        setPage("viewer");
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shrink-0"
                    >
                      Ашу
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h3 className="text-xl font-bold">Соңғы әрекеттер</h3>

              <button
                onClick={() => setPage("logs")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Толық журнал
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <p className="text-slate-500">Әзірге әрекет тарихы жоқ</p>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-2xl p-4 bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {getActionLabel(log.action_type)}
                        </h4>
                        <p className="text-slate-700 mt-1">
                          {log.action_details || "Сипаттама жоқ"}
                        </p>
                      </div>

                      <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full shrink-0">
                        {log.action_type}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-3">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold mb-5">Жылдам әрекеттер</h3>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <button
              onClick={() => setPage("addDocument")}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left hover:bg-emerald-100 transition"
            >
              <div className="text-2xl mb-3">📤</div>
              <h4 className="font-semibold text-slate-900">Құжат жүктеу</h4>
              <p className="text-sm text-slate-600 mt-1">
                Жаңа файлды жүйеге қосу және шифрлау
              </p>
            </button>

            <button
              onClick={() => setPage("documents")}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-left hover:bg-blue-100 transition"
            >
              <div className="text-2xl mb-3">📁</div>
              <h4 className="font-semibold text-slate-900">Менің құжаттарым</h4>
              <p className="text-sm text-slate-600 mt-1">
                Құжаттарды қарау, ашу, жүктеу және өшіру
              </p>
            </button>

            <button
              onClick={() => setPage("logs")}
              className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-left hover:bg-yellow-100 transition"
            >
              <div className="text-2xl mb-3">🕘</div>
              <h4 className="font-semibold text-slate-900">Әрекет тарихы</h4>
              <p className="text-sm text-slate-600 mt-1">
                Қауіпсіздік пен құжат әрекеттерін бақылау
              </p>
            </button>

            <button
              onClick={() => setPage("profile")}
              className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-left hover:bg-indigo-100 transition"
            >
              <div className="text-2xl mb-3">👤</div>
              <h4 className="font-semibold text-slate-900">Профиль</h4>
              <p className="text-sm text-slate-600 mt-1">
                Аккаунт мәліметтері мен қауіпсіздік баптаулары
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;