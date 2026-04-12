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
      const res = await API.get("/logs/my");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
            >
              Басты бет
            </button>
            <button
              onClick={logout}
              className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white"
            >
              Шығу
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-4">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-[32px] border border-sky-200 bg-white/90 p-5 shadow-sm">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Іздеу..."
              className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
            >
              <option value="all">Барлығы</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3"
              >
                <div className="font-semibold text-slate-800">
                  {log.action_type}
                </div>
                <div className="text-slate-700">{log.action_details}</div>
                <div className="text-sm text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-6 text-center text-slate-600">
                Логтар табылмады
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;