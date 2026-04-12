import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminPanel({ setPage, setLoggedIn, logoutEverywhere }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [appStats, setAppStats] = useState(null);
  const [latestLogs, setLatestLogs] = useState([]);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const getUsers = async () => {
    const res = await API.get("/user/all-users");
    setUsers(res.data.users || []);
  };

  const getAdminStats = async () => {
    const res = await API.get("/user/admin-stats");
    setAppStats(res.data.stats || null);
    setLatestLogs(res.data.latestLogs || []);
  };

  const refreshAdminData = async () => {
    try {
      setMessage("");
      const results = await Promise.allSettled([getUsers(), getAdminStats()]);
      const failed = results.some((result) => result.status === "rejected");
      if (failed) {
        setMessage("Кейбір әкімшілік деректер жүктелмеді, бірақ басқару функциялары қолжетімді.");
      }
    } catch {
      setMessage("Admin Panel жүктеу кезінде қате шықты");
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await API.post("/user/admin-create", {
        full_name: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        role: newRole,
      });

      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setMessage("Қолданушы қосылды");
      refreshAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Қолданушы қосу кезінде қате шықты");
    }
  };

  const deleteUser = async (id) => {
    try {
      await API.delete(`/user/delete/${id}`);
      setMessage("Қолданушы өшірілді");
      refreshAdminData();
    } catch {
      setMessage("Қолданушыны өшіру кезінде қате шықты");
    }
  };

  const makeAdmin = async (id) => {
    try {
      await API.put(`/user/make-admin/${id}`, {});
      setMessage("Қолданушы admin болды");
      refreshAdminData();
    } catch {
      setMessage("Admin рөлін беру кезінде қате шықты");
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        String(user.id).includes(searchText);
      const matchesRole = roleFilter === "all" ? true : user.role?.toLowerCase() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleStats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    return {
      total: users.length,
      admins,
      regularUsers: users.length - admins,
    };
  }, [users]);

  const formatBytes = (value) => {
    const bytes = Number(value || 0);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0f172a_0,#111827_34%,#1e293b_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/15 text-3xl ring-1 ring-sky-400/30">
                AP
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">AuthGuard Locker</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Admin Panel</h1>
                <p className="mt-2 text-slate-300">Қолданушыларды басқару, жүйе күйін бақылау және соңғы әрекеттерді қадағалау.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-white/10 px-4 py-2.5 font-semibold text-white ring-1 ring-white/10">Басты бет</button>
              <button onClick={() => setPage("logs")} className="rounded-2xl bg-white/10 px-4 py-2.5 font-semibold text-white ring-1 ring-white/10">Әрекет тарихы</button>
              <button onClick={logout} className="rounded-2xl bg-white/10 px-4 py-2.5 font-semibold text-white ring-1 ring-white/10">Шығу</button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-lg backdrop-blur">
            <div className="text-sm text-slate-400">Барлық қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-white">{roleStats.total}</div>
          </div>
          <div className="rounded-[28px] border border-sky-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(255,255,255,0.04))] p-6 shadow-lg backdrop-blur">
            <div className="text-sm text-slate-400">Admin қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-sky-300">{roleStats.admins}</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-lg backdrop-blur">
            <div className="text-sm text-slate-400">Қарапайым қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-white">{roleStats.regularUsers}</div>
          </div>
          <div className="rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(255,255,255,0.03))] p-6 shadow-lg backdrop-blur">
            <div className="text-sm text-emerald-200">Қорғаныс статусы</div>
            <div className="mt-3 text-2xl font-black text-white">Шифрлау қосулы</div>
            <div className="mt-2 text-sm text-emerald-100">Storage: {appStats?.storage_mode || "database"}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Құжаттар</div>
            <div className="mt-3 text-3xl font-black">{appStats?.total_documents || 0}</div>
            <div className="mt-2 text-sm text-slate-300">Жалпы көлем: {formatBytes(appStats?.total_file_size)}</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Журнал оқиғалары</div>
            <div className="mt-3 text-3xl font-black">{appStats?.total_events || 0}</div>
            <div className="mt-2 text-sm text-slate-300">Соңғы жүйелік әрекеттер</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Уақытша сілтемелер</div>
            <div className="mt-3 text-3xl font-black">{appStats?.active_links || 0}</div>
            <div className="mt-2 text-sm text-slate-300">Белсенді secure links</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={createUser} className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-6 backdrop-blur">
            <h2 className="text-2xl font-black text-white">Қолданушы қосу</h2>
            <p className="mt-2 text-slate-300">Жаңа user немесе admin аккаунтын осы жерден жасай аласыз.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={newFullName} onChange={(event) => setNewFullName(event.target.value)} placeholder="Аты-жөні" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-400" />
              <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-400" />
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Пароль" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-400" />
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="mt-5 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white">Қолданушы қосу</button>
          </form>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-6 backdrop-blur">
            <h2 className="text-2xl font-black text-white">Соңғы оқиғалар</h2>
            <div className="mt-5 space-y-3">
              {latestLogs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Әзірге оқиға жоқ</div>
              ) : (
                latestLogs.map((log, index) => (
                  <div key={`${log.action_type}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{log.action_type}</div>
                    <div className="mt-1 text-sm text-slate-300">{log.action_details || "Сипаттама жоқ"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-6 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium text-slate-300">Іздеу</label>
              <input
                type="text"
                placeholder="ID, аты-жөні немесе email бойынша іздеу"
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-slate-300">Рөл</label>
              <select className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Барлығы</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Қолданушылар</h2>
              <p className="mt-1 text-slate-300">Жүйеде тіркелген аккаунттар тізімі</p>
            </div>
            <span className="rounded-full bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-200 ring-1 ring-sky-400/20">Нәтиже: {filteredUsers.length}</span>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-400">ID</div>
                    <div className="font-bold text-white">{user.id}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-sky-200">{user.role || "user"}</span>
                </div>
                <div className="mt-4 text-white">{user.full_name || "-"}</div>
                <div className="mt-1 break-all text-sm text-slate-300">{user.email || "-"}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.role !== "admin" && <button onClick={() => makeAdmin(user.id)} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Admin ету</button>}
                  <button onClick={() => deleteUser(user.id)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">Өшіру</button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-slate-400">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Аты-жөні</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Рөлі</th>
                  <th className="p-3 font-medium">Тіркелген уақыты</th>
                  <th className="p-3 font-medium">Әрекет</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 text-slate-200">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.full_name || "-"}</td>
                    <td className="break-all p-3">{user.email || "-"}</td>
                    <td className="p-3 uppercase">{user.role || "user"}</td>
                    <td className="p-3">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {user.role !== "admin" && <button onClick={() => makeAdmin(user.id)} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Admin ету</button>}
                        <button onClick={() => deleteUser(user.id)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">Өшіру</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="rounded-[24px] border border-white/10 bg-white/5 py-12 text-center text-slate-300">
              Қолданушылар табылмады.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
