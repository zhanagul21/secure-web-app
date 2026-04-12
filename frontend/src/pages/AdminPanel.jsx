import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminPanel({ setPage, setLoggedIn }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const getUsers = async () => {
    try {
      const res = await API.get("/user/all-users");
      setUsers(res.data.users || []);
      setMessage("");
    } catch (error) {
      console.error("GET USERS ERROR:", error);
      setMessage("Админ деректерін жүктеу кезінде қате шықты");
    }
  };

  const deleteUser = async (id, fullName) => {
    const ok = window.confirm(
      `${fullName || "Бұл"} қолданушыны өшіргіңіз келе ме?`
    );
    if (!ok) return;

    try {
      await API.delete(`/user/delete/${id}`);
      getUsers();
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      setMessage("Қолданушыны өшіру кезінде қате шықты");
    }
  };

  const makeAdmin = async (id, fullName) => {
    const ok = window.confirm(
      `${fullName || "Бұл"} қолданушыға admin рөлін бергіңіз келе ме?`
    );
    if (!ok) return;

    try {
      await API.put(`/user/make-admin/${id}`, {});
      getUsers();
    } catch (error) {
      console.error("MAKE ADMIN ERROR:", error);
      setMessage("Admin рөлін беру кезінде қате шықты");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        String(user.id).includes(searchText);

      const matchesRole =
        roleFilter === "all" ? true : user.role?.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleStats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const regularUsers = users.filter((user) => user.role !== "admin").length;

    return {
      total: users.length,
      admins,
      regularUsers,
    };
  }, [users]);

  const getRoleBadgeClass = (role) => {
    if (role === "admin") {
      return "bg-fuchsia-100 text-fuchsia-700 ring-1 ring-fuchsia-200";
    }
    return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl shadow-sm ring-1 ring-sky-100">
                🛡️
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Әкімшілік панель
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                  Қолданушыларды қарау, іздеу, рөл беру және өшіру
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Басты бет
              </button>

              <button
                onClick={() => setPage("logs")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Әрекет тарихы
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 mt-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Қолданушыларды басқару
          </h2>
          <p className="mt-2 text-slate-600">
            Қолданушыларды басқару және қауіпсіздік бақылауы
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-white/95 p-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Барлық қолданушылар
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {roleStats.total}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Admin қолданушылар
                </p>
                <p className="text-3xl font-bold text-fuchsia-600">
                  {roleStats.admins}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-50 text-2xl ring-1 ring-fuchsia-100">
                ⭐
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Қарапайым қолданушылар
                </p>
                <p className="text-3xl font-bold text-sky-600">
                  {roleStats.regularUsers}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
                👤
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block font-medium text-slate-700">
                Іздеу
              </label>
              <input
                type="text"
                placeholder="ID, аты-жөні немесе email бойынша іздеу"
                className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Рөл
              </label>
              <select
                className="w-full rounded-2xl border border-sky-100 bg-sky-50 p-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Барлығы</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Барлық қолданушылар
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Жүйеде тіркелген аккаунттар тізімі
              </p>
            </div>

            <span className="w-fit rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
              Нәтиже: {filteredUsers.length}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-sky-200 bg-sky-50 py-12 text-center text-slate-500">
              Қолданушылар табылмады.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
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
                      <tr
                        key={user.id}
                        className="border-b border-sky-50 transition hover:bg-sky-50/70"
                      >
                        <td className="p-3 text-slate-900">{user.id}</td>

                        <td className="p-3 text-slate-900">
                          {user.full_name || "-"}
                        </td>

                        <td className="break-all p-3 text-slate-700">
                          {user.email || "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>

                        <td className="p-3 text-slate-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleString()
                            : "-"}
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {user.role !== "admin" && (
                              <button
                                onClick={() =>
                                  makeAdmin(user.id, user.full_name)
                                }
                                className="rounded-xl bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-800"
                              >
                                Admin ету
                              </button>
                            )}

                            <button
                              onClick={() =>
                                deleteUser(user.id, user.full_name)
                              }
                              className="rounded-xl bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-800"
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

              <div className="grid gap-4 lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">ID</p>
                        <p className="font-bold text-slate-900">{user.id}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role || "user"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Аты-жөні</p>
                      <p className="font-medium text-slate-800">
                        {user.full_name || "-"}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="break-all font-medium text-slate-700">
                        {user.email || "-"}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-slate-500">
                        Тіркелген уақыты
                      </p>
                      <p className="font-medium text-slate-700">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => makeAdmin(user.id, user.full_name)}
                          className="rounded-xl bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-800"
                        >
                          Admin ету
                        </button>
                      )}

                      <button
                        onClick={() => deleteUser(user.id, user.full_name)}
                        className="rounded-xl bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-800"
                      >
                        Өшіру
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
