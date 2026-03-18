import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function ActivityLog({ setPage, setLoggedIn }) {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
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
        return "bg-blue-100 text-blue-700";
      case "DOCUMENT_DOWNLOAD":
        return "bg-cyan-100 text-cyan-700";
      case "DOCUMENT_DELETE":
        return "bg-red-100 text-red-700";
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
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Әрекет тарихы</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("documents")}
            className="bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl"
          >
            Құжаттар
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-semibold mb-2">Журнал түрлері</h3>
          <p className="text-slate-600">
            Құжат қосу, ашу, жүктеу, өшіру және қауіпсіздікке қатысты әрекеттер сақталады.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Іздеу</label>
              <input
                type="text"
                placeholder="Әрекет түрі немесе сипаттамасы бойынша іздеу"
                className="w-full border rounded-xl p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Әрекет түрі</label>
              <select
                className="w-full border rounded-xl p-3"
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
          <div className="mb-4 bg-white border rounded-xl p-4 text-slate-700">
            {message}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Қауіпсіздік және әрекет журналы</h2>
            <span className="text-sm text-slate-500">
              Барлығы: {filteredLogs.length}
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Әзірге әрекет тарихы табылмады.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-2xl bg-slate-50 p-5 hover:shadow-sm transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">{getActionIcon(log.action_type)}</div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {getActionLabel(log.action_type)}
                          </h3>

                          <span
                            className={`text-xs px-3 py-1 rounded-full ${getActionBadgeClass(
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

                    <div className="text-sm text-slate-500 md:text-right">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "-"}
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