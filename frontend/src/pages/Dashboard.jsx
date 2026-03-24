import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function Dashboard({ setLoggedIn, setPage, setSelectedDocumentId }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
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
    const totalViews = logs.filter(
      (log) => log.action_type === "DOCUMENT_VIEW"
    ).length;
    const totalDownloads = logs.filter(
      (log) => log.action_type === "DOCUMENT_DOWNLOAD"
    ).length;
    const totalDeletes = logs.filter(
      (log) => log.action_type === "DOCUMENT_DELETE"
    ).length;

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Қайырлы таң";
    if (hour < 18) return "Қайырлы күн";
    return "Қайырлы кеш";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-100">
                🔐
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">
                  {getGreeting()}
                  {user?.full_name ? `, ${user.full_name}` : ""}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  AuthGuard Locker Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Құжаттар, белсенділік және аккаунт бойынша қысқаша ақпарат
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжаттар
              </button>

              <button
                onClick={() => setPage("addDocument")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжат қосу
              </button>

              <button
                onClick={() => setPage("logs")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Әрекет тарихы
              </button>

              <button
                onClick={() => setPage("profile")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Профиль
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => setPage("admin")}
                  className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
                >
                  Admin
                </button>
              )}

              <button
                onClick={logout}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-3xl border border-sky-100 bg-white px-5 py-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {user && (
          <div className="mt-6 rounded-[32px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Пайдаланушы ақпараты
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Аккаунт туралы негізгі мәліметтер
                </p>
              </div>

              <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
                {user.role || "user"}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="mb-1 text-sm text-slate-500">ID</p>
                <p className="font-semibold text-slate-900">{user.id}</p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="mb-1 text-sm text-slate-500">Аты-жөні</p>
                <p className="font-semibold text-slate-900">
                  {user.full_name || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="mb-1 text-sm text-slate-500">Email</p>
                <p className="break-all font-semibold text-slate-900">
                  {user.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="mb-1 text-sm text-slate-500">Рөлі</p>
                <p className="font-semibold uppercase text-slate-900">
                  {user.role || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Барлық құжаттар</p>
            <p className="mt-3 text-3xl font-black text-slate-800">
              {stats.totalDocuments}
            </p>
            <p className="mt-2 text-sm text-slate-500">Жүйедегі файлдар саны</p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Қаралған құжаттар
            </p>
            <p className="mt-3 text-3xl font-black text-slate-800">
              {stats.totalViews}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Viewer арқылы ашылғандар
            </p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Жүктелген құжаттар
            </p>
            <p className="mt-3 text-3xl font-black text-slate-800">
              {stats.totalDownloads}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Download жасалған файлдар
            </p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Өшірілген құжаттар
            </p>
            <p className="mt-3 text-3xl font-black text-slate-800">
              {stats.totalDeletes}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Жүйеден жойылған файлдар
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Соңғы құжаттар
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Жақында қосылған файлдар
                </p>
              </div>

              <button
                onClick={() => setPage("documents")}
                className="font-medium text-sky-600 transition hover:text-sky-700"
              >
                Барлығын көру
              </button>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-100 bg-sky-50 px-4 py-8 text-center">
                <div className="text-4xl">📂</div>
                <p className="mt-3 font-semibold text-slate-700">
                  Әзірге құжаттар жоқ
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Бірінші құжатыңызды жүктеп бастаңыз
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                        {getFileIcon(doc.mime_type)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-slate-900">
                          {doc.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          {doc.category || "-"}
                        </p>

                        <p className="break-all text-sm text-slate-500">
                          {doc.original_name || "Файл"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
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
                      className="shrink-0 rounded-xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Ашу
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Соңғы әрекеттер
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Аккаунттағы соңғы журнал жазбалары
                </p>
              </div>

              <button
                onClick={() => setPage("logs")}
                className="font-medium text-sky-600 transition hover:text-sky-700"
              >
                Толық журнал
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-100 bg-sky-50 px-4 py-8 text-center">
                <div className="text-4xl">🕘</div>
                <p className="mt-3 font-semibold text-slate-700">
                  Әзірге әрекет тарихы жоқ
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-sky-100 bg-sky-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {getActionLabel(log.action_type)}
                        </h4>
                        <p className="mt-1 text-slate-700">
                          {log.action_details || "Сипаттама жоқ"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-sky-100">
                        {log.action_type}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
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

        <div className="mt-6 rounded-[32px] border border-sky-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-800">
              Жылдам әрекеттер
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Негізгі бөлімдерге тез өту
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={() => setPage("addDocument")}
              className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-left transition hover:bg-sky-100"
            >
              <div className="mb-3 text-2xl">📤</div>
              <h4 className="font-semibold text-slate-900">Құжат жүктеу</h4>
              <p className="mt-1 text-sm text-slate-600">
                Жаңа файлды жүйеге қосу және шифрлау
              </p>
            </button>

            <button
              onClick={() => setPage("documents")}
              className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-left transition hover:bg-sky-100"
            >
              <div className="mb-3 text-2xl">📁</div>
              <h4 className="font-semibold text-slate-900">Менің құжаттарым</h4>
              <p className="mt-1 text-sm text-slate-600">
                Құжаттарды қарау, ашу, жүктеу және өшіру
              </p>
            </button>

            <button
              onClick={() => setPage("logs")}
              className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-left transition hover:bg-sky-100"
            >
              <div className="mb-3 text-2xl">🕘</div>
              <h4 className="font-semibold text-slate-900">Әрекет тарихы</h4>
              <p className="mt-1 text-sm text-slate-600">
                Қауіпсіздік пен құжат әрекеттерін бақылау
              </p>
            </button>

            <button
              onClick={() => setPage("profile")}
              className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-left transition hover:bg-sky-100"
            >
              <div className="mb-3 text-2xl">👤</div>
              <h4 className="font-semibold text-slate-900">Профиль</h4>
              <p className="mt-1 text-sm text-slate-600">
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