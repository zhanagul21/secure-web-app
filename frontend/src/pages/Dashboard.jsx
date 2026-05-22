import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";

function Dashboard({ setLoggedIn, setPage, setSelectedDocumentId, logoutEverywhere }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const getProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch {
      setMessage("Пайдаланушы мәліметін жүктеу кезінде қате шықты");
    }
  };

  const getDocuments = async () => {
    try {
      const res = await API.get("/documents/my");
      setDocuments(res.data.documents || []);
    } catch {
      setMessage("Құжаттарды жүктеу кезінде қате шықты");
    }
  };

  const getLogs = async () => {
    try {
      const res = await API.get("/logs/my");
      setLogs(res.data.logs || []);
    } catch {
      setMessage("Логтарды жүктеу кезінде қате шықты");
    }
  };

  useEffect(() => {
    getProfile();
    getDocuments();
    getLogs();
  }, []);

  const recentDocuments = useMemo(() => [...documents].slice(0, 5), [documents]);
  const recentLogs = useMemo(() => [...logs].slice(0, 5), [logs]);

  const stats = useMemo(() => ({
    totalDocuments: documents.length,
    totalViews: logs.filter((log) => log.action_type === "DOCUMENT_VIEW").length,
    totalDownloads: logs.filter((log) => log.action_type === "DOCUMENT_DOWNLOAD").length,
    totalDeletes: logs.filter((log) => log.action_type === "DOCUMENT_DELETE").length,
  }), [documents, logs]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Қайырлы таң";
    if (hour < 18) return "Қайырлы күн";
    return "Қайырлы кеш";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,#eff6ff_35%,#ffffff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.15)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-sky-200">
                <img src={logo} alt="AuthGuard Locker" className="h-12 w-auto object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-sky-700">{getGreeting()}{user?.full_name ? `, ${user.full_name}` : ""}</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">AuthGuard Locker</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                  Құжаттарыңызды бір жерде сақтап, керек кезде қарап, жүктеп немесе уақытша сілтеме арқылы бөлісе аласыз.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("documents")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Құжаттар</button>
              <button onClick={() => setPage("addDocument")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Құжат қосу</button>
              <button onClick={() => setPage("logs")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Әрекет тарихы</button>
              <button onClick={() => setPage("profile")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Профиль</button>
              <button onClick={() => setPage("twofaSettings")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">2FA баптау</button>
              <button onClick={() => setPage("crypto")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Крипто модуль</button>
              {user?.role === "admin" && <button onClick={() => setPage("admin")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Admin</button>}
              <button onClick={logout} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {message && <div className="mt-6 rounded-3xl border border-sky-200 bg-white/90 px-5 py-4 text-slate-700 shadow-sm">{message}</div>}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-600">Барлық құжаттар</p>
            <p className="mt-3 text-3xl font-black text-slate-800">{stats.totalDocuments}</p>
          </div>
          <div className="rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-600">Қаралған құжаттар</p>
            <p className="mt-3 text-3xl font-black text-slate-800">{stats.totalViews}</p>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-600">Жүктелген құжаттар</p>
            <p className="mt-3 text-3xl font-black text-slate-800">{stats.totalDownloads}</p>
          </div>
          <div className="rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-slate-600">Аккаунт баптауы</p>
            <p className="mt-3 text-2xl font-black text-slate-800">Профиль және кіру коды</p>
            <p className="mt-2 text-sm text-slate-600">Құпия сөз бен кіру баптауын осы жерден өзгертесіз</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-sky-200 bg-white/90 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Соңғы құжаттар</h3>
                <p className="mt-1 text-sm text-slate-600">Жақында қосылған файлдар</p>
              </div>
              <button onClick={() => setPage("documents")} className="font-medium text-sky-700">Барлығын көру</button>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 px-4 py-8 text-center text-slate-600">Әзірге құжаттар жоқ</div>
            ) : (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex flex-col gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-900">{doc.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{doc.category || "-"}</p>
                      <p className="break-all text-sm text-slate-600">{doc.original_name || "Файл"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDocumentId(doc.id);
                        setPage("viewer");
                      }}
                      className="shrink-0 rounded-xl bg-slate-800 px-4 py-2.5 font-semibold text-white"
                    >
                      Ашу
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-sky-200 bg-white/90 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Соңғы әрекеттер</h3>
                <p className="mt-1 text-sm text-slate-600">Аккаунттағы соңғы журнал жазбалары</p>
              </div>
              <button onClick={() => setPage("logs")} className="font-medium text-sky-700">Толық журнал</button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 px-4 py-8 text-center text-slate-600">Әзірге әрекет тарихы жоқ</div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <div className="font-bold text-slate-900">{log.action_type}</div>
                    <p className="mt-1 text-slate-700">{log.action_details || "Сипаттама жоқ"}</p>
                    <p className="mt-3 text-sm text-slate-600">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
