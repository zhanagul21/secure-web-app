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
      const token = localStorage.getItem("token");

      const res = await API.get("/logs/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      default:
        return "📌";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-800">AUTHGUARD LOCKER</h1>
              <p className="mt-1 text-sm text-slate-600">Әрекет тарихы</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800">Dashboard</button>
              <button onClick={() => setPage("documents")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800">Құжаттар</button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800">Шығу</button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/95 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Журнал түрлері</h3>
          <p className="mt-2 text-slate-700">
            Құжат қосу, ашу, жүктеу, өшіру және қауіпсіздікке қатысты әрекеттер сақталады.
          </p>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium text-slate-700">Іздеу</label>
              <input
                type="text"
                placeholder="Әрекет түрі немесе сипаттамасы бойынша іздеу"
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 p-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-slate-700">Әрекет түрі</label>
              <select
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 p-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">Барлығы</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {getActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-sky-200 bg-white/95 p-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-[32px] border border-sky-200 bg-white/95 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Қауіпсіздік және әрекет журналы</h2>
            <span className="text-sm text-slate-600">Барлығы: {filteredLogs.length}</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="rounded-2xl bg-sky-100 py-10 text-center text-slate-600">
              Әзірге әрекет тарихы табылмады.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-sky-200 bg-sky-100 p-5 transition hover:shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 text-2xl">{getActionIcon(log.action_type)}</div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-900">
                            {getActionLabel(log.action_type)}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${getActionBadgeClass(
                              log.action_type
                            )}`}
                          >
                            {log.action_type}
                          </span>
                        </div>

                        <p className="text-slate-700">
                          {log.action_details || "Сипаттама жоқ"}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 md:text-right">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;