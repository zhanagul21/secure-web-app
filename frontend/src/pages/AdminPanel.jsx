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
      const token = localStorage.getItem("token");

      const res = await API.get("/user/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const token = localStorage.getItem("token");

      await API.delete(`/user/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const token = localStorage.getItem("token");

      await API.put(
        `/user/make-admin/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      return "bg-fuchsia-100 text-fuchsia-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                AUTHGUARD LOCKER
              </h1>
              <p className="mt-1 text-sm text-slate-500">Әкімшілік панель</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
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

        <div className="mt-6 mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>
          <p className="mt-1 text-slate-600">
            Қолданушыларды қарау, іздеу, рөл беру және өшіру
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm text-slate-500">Барлық қолданушылар</p>
            <p className="text-3xl font-bold text-slate-900">{roleStats.total}</p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm text-slate-500">Admin қолданушылар</p>
            <p className="text-3xl font-bold text-fuchsia-600">
              {roleStats.admins}
            </p>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm text-slate-500">
              Қарапайым қолданушылар
            </p>
            <p className="text-3xl font-bold text-sky-600">
              {roleStats.regularUsers}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
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

        <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-slate-800">
              Барлық қолданушылар
            </h3>
            <span className="text-sm text-slate-500">
              Нәтиже: {filteredUsers.length}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl bg-sky-50 py-10 text-center text-slate-500">
              Қолданушылар табылмады.
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      className="border-b border-sky-50 hover:bg-sky-50"
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
                          className={`rounded-full px-3 py-1 text-xs ${getRoleBadgeClass(
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;