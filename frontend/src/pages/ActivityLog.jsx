import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function ActivityLog({ setPage, setLoggedIn }) {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const getLogs = async () => {
    try {
      const res = await API.get("/logs");
      setLogs(res.data.logs || []);
      setMessage("");
    } catch (error) {
      console.error("GET LOGS ERROR:", error);
      setMessage("Логтарды жүктеу кезінде қате шықты");
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  const actionTypes = useMemo(() => {
    return [...new Set(logs.map((log) => log.action_type).filter(Boolean))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        log.action_type?.toLowerCase().includes(searchText) ||
        log.action_details?.toLowerCase().includes(searchText);

      const matchesAction =
        actionFilter === "all" ? true : log.action_type === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case "DOCUMENT_ADD":
        return "Құжат қосу";
      case "DOCUMENT_VIEW":
        return "Құжат ашу";
      case "DOCUMENT_DOWNLOAD":
        return "Құжат жүктеу";
      case "DOCUMENT_DELETE":
        return "Құжат өшіру";
      case "LOGIN":
        return "Жүйеге кіру";
      case "REGISTER":
        return "Тіркелу";
      case "PASSWORD_RESET":
        return "Пароль жаңарту";
      case "2FA_ENABLE":
        return "2FA қосу";
      default:
        return actionType || "Әрекет";
    }
  };

  const getActionBadgeClass = (actionType) => {
    switch (actionType) {
      case "DOCUMENT_ADD":
        return "bg-emerald-100 text-emerald-700";
      case "DOCUMENT_VIEW":
        return "bg-sky-100 text-sky-700";
      case "DOCUMENT_DOWNLOAD":
        return "bg-cyan-100 text-cyan-700";
      case "DOCUMENT_DELETE":
        return "bg-rose-100 text-rose-700";
      case "LOGIN":
        return "bg-violet-100 text-violet-700";
      case "REGISTER":
        return "bg-amber-100 text-amber-700";
      case "2FA_ENABLE":
        return "bg-fuchsia-100 text-fuchsia-700";
      case "PASSWORD_RESET":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "DOCUMENT_ADD":
        return "➕";
      case "DOCUMENT_VIEW":
        return "👁️";
      case "DOCUMENT_DOWNLOAD":
        return "⬇️";
      case "DOCUMENT_DELETE":
        return "🗑️";
      case "LOGIN":
        return "🔐";
      case "REGISTER":
        return "🆕";
      case "2FA_ENABLE":
        return "🛡️";
      case "PASSWORD_RESET":
        return "🔁";
      default:
        return "📌";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
                🕘
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">AuthGuard Locker</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Әрекет тарихы
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  Аккаунт пен құжаттарға қатысты қауіпсіздік журналдары
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">
                Басты бет
              </button>
              <button onClick={() => setPage("documents")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">
                Құжаттар
              </button>
              <button onClick={logout} className="rounded-2xl bg-rose-600 px-4 py-2.5 font-semibold text-white">
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Іздеу</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Әрекет атауы немесе сипаттама бойынша іздеу"
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Әрекет түрі</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 outline-none focus:border-sky-400"
              >
                <option value="all">Барлығы</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {message}
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-sky-200 bg-white/90 p-10 text-center shadow-sm">
            <div className="text-5xl">🕘</div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-800">Логтар табылмады</h2>
            <p className="mt-2 text-slate-700">Әзірге журнал жазбалары жоқ немесе іздеу нәтижесі бос.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="rounded-[28px] border border-sky-200 bg-white/90 p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                      {getActionIcon(log.action_type)}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {getActionLabel(log.action_type)}
                      </h3>
                      <p className="mt-1 text-slate-600">
                        {log.action_details || "Сипаттама жоқ"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getActionBadgeClass(log.action_type)}`}>
                    {log.action_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLog;