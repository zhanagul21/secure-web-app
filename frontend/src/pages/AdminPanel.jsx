import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminPanel({ setPage, setLoggedIn }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
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
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Әкімшілік панель</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("logs")}
            className="bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl"
          >
            Әрекет тарихы
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-600 mt-1">
            Қолданушыларды қарау, іздеу, рөл беру және өшіру
          </p>
        </div>

        {message && (
          <div className="bg-white border rounded-2xl p-4 mb-6 text-red-600">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Барлық қолданушылар</p>
            <p className="text-3xl font-bold text-slate-900">{roleStats.total}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Admin қолданушылар</p>
            <p className="text-3xl font-bold text-fuchsia-600">
              {roleStats.admins}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6">
            <p className="text-sm text-slate-500 mb-2">Қарапайым қолданушылар</p>
            <p className="text-3xl font-bold text-blue-600">
              {roleStats.regularUsers}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Іздеу</label>
              <input
                type="text"
                placeholder="ID, аты-жөні немесе email бойынша іздеу"
                className="w-full border rounded-xl p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Рөл</label>
              <select
                className="w-full border rounded-xl p-3"
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

        <div className="bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold">Барлық қолданушылар</h3>
            <span className="text-sm text-slate-500">
              Нәтиже: {filteredUsers.length}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Қолданушылар табылмады.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b text-left text-slate-500">
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
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-slate-900">{user.id}</td>

                      <td className="p-3 text-slate-900">
                        {user.full_name || "-"}
                      </td>

                      <td className="p-3 text-slate-700 break-all">
                        {user.email || "-"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getRoleBadgeClass(
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
                              className="bg-fuchsia-600 text-white px-3 py-2 rounded-xl hover:bg-fuchsia-700"
                            >
                              Admin ету
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(user.id, user.full_name)}
                            className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600"
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