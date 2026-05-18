import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function getRiskSignal(log) {
  const action = log.action_type || "";
  const details = log.action_details || "";
  const text = `${action} ${details}`.toLowerCase();
  let score = 0;
  const reasons = [];

  if (action.includes("DOWNLOAD")) {
    score += 40;
    reasons.push("құжат жүктеу");
  }

  if (action.includes("SHARE")) {
    score += 35;
    reasons.push("уақытша сілтеме");
  }

  if (text.includes("failed") || text.includes("қате") || text.includes("invalid")) {
    score += 30;
    reasons.push("сәтсіз әрекет");
  }

  if (text.includes("2fa") || text.includes("password") || text.includes("пароль")) {
    score += 20;
    reasons.push("аккаунт қауіпсіздігі");
  }

  if (action.includes("DELETE")) {
    score += 25;
    reasons.push("өшіру әрекеті");
  }

  const level = score >= 60 ? "Жоғары" : score >= 30 ? "Орташа" : "Төмен";
  return { level, score, reasons: reasons.length ? reasons : ["қалыпты әрекет"] };
}

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
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

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
    setMessage("");
    const results = await Promise.allSettled([getUsers(), getAdminStats()]);
    if (results.every((result) => result.status === "rejected")) {
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

  const setUserRole = async (id, role) => {
    try {
      await API.put(`/user/role/${id}`, { role });
      setMessage(role === "admin" ? "Қолданушы admin болды" : "Қолданушы user рөліне ауысты");
      refreshAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Рөлді өзгерту кезінде қате шықты");
    }
  };

  const resetUser2FA = async (id) => {
    try {
      await API.post(`/user/admin-reset-2fa/${id}`, {});
      setMessage("Қолданушының 2FA баптауы тазартылды");
      refreshAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA тазарту кезінде қате шықты");
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();
      const matchesSearch = user.full_name?.toLowerCase().includes(searchText) || user.email?.toLowerCase().includes(searchText) || String(user.id).includes(searchText);
      const matchesRole = roleFilter === "all" ? true : user.role?.toLowerCase() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleStats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    return { total: users.length, admins, regularUsers: users.length - admins };
  }, [users]);

  const riskMonitor = useMemo(() => {
    const signals = latestLogs.map((log) => ({ ...log, risk: getRiskSignal(log) }));
    const high = signals.filter((item) => item.risk.level === "Жоғары").length;
    const medium = signals.filter((item) => item.risk.level === "Орташа").length;
    const topScore = Math.max(0, ...signals.map((item) => item.risk.score));
    const status = high > 0 ? "Жоғары қауіп" : medium > 0 ? "Бақылау керек" : "Тұрақты";
    return { signals, high, medium, topScore, status };
  }, [latestLogs]);

  const formatBytes = (value) => {
    const bytes = Number(value || 0);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#eff6ff_36%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-xl font-black text-sky-700 ring-1 ring-sky-200">AP</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">AuthGuard Locker</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Admin Panel</h1>
                <p className="mt-2 text-slate-600">Қолданушыларды басқару, жүйе күйін бақылау және соңғы әрекеттерді қадағалау.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={() => setPage("logs")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Әрекет тарихы</button>
              <button onClick={logout} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {message && <div className="mt-6 rounded-2xl border border-sky-100 bg-white/95 p-4 text-slate-700 shadow-sm">{message}</div>}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm text-slate-500">Барлық қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-slate-900">{roleStats.total}</div>
          </div>
          <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm text-slate-500">Admin қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-sky-600">{roleStats.admins}</div>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm text-slate-500">Қарапайым қолданушылар</div>
            <div className="mt-3 text-4xl font-black text-slate-900">{roleStats.regularUsers}</div>
          </div>
          <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm text-emerald-700">Қорғаныс статусы</div>
            <div className="mt-3 text-2xl font-black text-slate-900">Шифрлау қосулы</div>
            <div className="mt-2 text-sm text-slate-600">Құжаттар қорғалған түрде сақталады</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Қолданушы қосу",
            "Рөлді admin/user қылып өзгерту",
            "2FA баптауын тазарту",
            "Қолданушыны жүйеден өшіру",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-white/70 bg-white/95 p-5 text-sm font-semibold text-slate-700 shadow-sm">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <div className="text-sm text-slate-500">Құжаттар</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{appStats?.total_documents || 0}</div>
            <div className="mt-2 text-sm text-slate-600">Жалпы көлем: {formatBytes(appStats?.total_file_size)}</div>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <div className="text-sm text-slate-500">Журнал оқиғалары</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{appStats?.total_events || 0}</div>
            <div className="mt-2 text-sm text-slate-600">Соңғы жүйелік әрекеттер</div>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <div className="text-sm text-slate-500">Уақытша сілтемелер</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{appStats?.active_links || 0}</div>
            <div className="mt-2 text-sm text-slate-600">Белсенді secure links</div>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-rose-100 bg-[linear-gradient(135deg,#fff1f2,#ffffff)] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Қауіпсіздік бақылауы</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Қауіпті әрекеттерді бақылау</h2>
              <p className="mt-2 text-slate-600">Жүйе құжат жүктеу, уақытша сілтеме жасау, өшіру және аккаунт қауіпсіздігіне қатысты күмәнді әрекеттерді автоматты белгілейді.</p>
            </div>
            <div className={`rounded-[24px] px-6 py-4 text-center shadow-sm ${
              riskMonitor.status === "Жоғары қауіп"
                ? "bg-rose-600 text-white"
                : riskMonitor.status === "Бақылау керек"
                ? "bg-amber-400 text-slate-950"
                : "bg-emerald-500 text-white"
            }`}>
              <div className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">Жалпы статус</div>
              <div className="mt-1 text-2xl font-black">{riskMonitor.status}</div>
              <div className="mt-1 text-sm font-semibold">Ең жоғары ұпай: {riskMonitor.topScore}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-white p-5 ring-1 ring-rose-100">
              <div className="text-sm text-slate-500">Жоғары қауіп</div>
              <div className="mt-2 text-3xl font-black text-rose-600">{riskMonitor.high}</div>
            </div>
            <div className="rounded-[24px] bg-white p-5 ring-1 ring-amber-100">
              <div className="text-sm text-slate-500">Орташа қауіп</div>
              <div className="mt-2 text-3xl font-black text-amber-600">{riskMonitor.medium}</div>
            </div>
            <div className="rounded-[24px] bg-white p-5 ring-1 ring-emerald-100">
              <div className="text-sm text-slate-500">Тексерілген оқиға</div>
              <div className="mt-2 text-3xl font-black text-emerald-600">{riskMonitor.signals.length}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {riskMonitor.signals.slice(0, 4).map((item, index) => (
              <div key={`${item.action_type}-${index}`} className="rounded-[22px] border border-white bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-900">{item.action_type}</div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${
                    item.risk.level === "Жоғары"
                      ? "bg-rose-100 text-rose-700"
                      : item.risk.level === "Орташа"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {item.risk.level}
                  </span>
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-slate-600">{item.action_details || "Сипаттама жоқ"}</div>
                <div className="mt-3 text-xs font-semibold text-slate-500">Себеп: {item.risk.reasons.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={createUser} className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Қолданушы қосу</h2>
            <p className="mt-2 text-slate-600">Жаңа user немесе admin аккаунтын осы жерден жасай аласыз.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={newFullName} onChange={(event) => setNewFullName(event.target.value)} placeholder="Аты-жөні" className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none" />
              <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Email" className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none" />
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Пароль" className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none" />
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)} className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="mt-5 rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">Қолданушы қосу</button>
          </form>

          <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Соңғы оқиғалар</h2>
            <div className="mt-5 space-y-3">
              {latestLogs.length === 0 ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-slate-600">Әзірге оқиға жоқ</div>
              ) : (
                latestLogs.map((log, index) => (
                  <div key={`${log.action_type}-${index}`} className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <div className="font-semibold text-slate-900">{log.action_type}</div>
                    <div className="mt-1 text-sm text-slate-600">{log.action_details || "Сипаттама жоқ"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium text-slate-700">Іздеу</label>
              <input type="text" placeholder="ID, аты-жөні немесе email бойынша іздеу" className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block font-medium text-slate-700">Рөл</label>
              <select className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Барлығы</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Қолданушылар</h2>
              <p className="mt-1 text-slate-600">Жүйеде тіркелген аккаунттар тізімі</p>
            </div>
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Нәтиже: {filteredUsers.length}</span>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-[24px] border border-sky-100 bg-sky-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">ID</div>
                    <div className="font-bold text-slate-900">{user.id}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-sky-700 ring-1 ring-sky-100">{user.role || "user"}</span>
                </div>
                <div className="mt-4 text-slate-900">{user.full_name || "-"}</div>
                <div className="mt-1 break-all text-sm text-slate-600">{user.email || "-"}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                    disabled={user.id === currentUser?.id && user.role === "admin"}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {user.role === "admin" ? "User ету" : "Admin ету"}
                  </button>
                  <button onClick={() => resetUser2FA(user.id)} className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700">2FA reset</button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={user.id === currentUser?.id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Өшіру
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-sky-100 text-left text-slate-500">
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
                  <tr key={user.id} className="border-b border-sky-100 text-slate-700">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.full_name || "-"}</td>
                    <td className="break-all p-3">{user.email || "-"}</td>
                    <td className="p-3 uppercase">{user.role || "user"}</td>
                    <td className="p-3">{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                          disabled={user.id === currentUser?.id && user.role === "admin"}
                          className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {user.role === "admin" ? "User ету" : "Admin ету"}
                        </button>
                        <button onClick={() => resetUser2FA(user.id)} className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700">2FA reset</button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                        >
                          Өшіру
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && <div className="rounded-[24px] border border-sky-100 bg-sky-50 py-12 text-center text-slate-600">Қолданушылар табылмады.</div>}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

