import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ setLoggedIn, setPage }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      setMessage("");
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
      setMessage("Профиль мәліметін жүктеу кезінде қате шықты");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Пайдаланушы профилі</p>
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
            onClick={() => setPage("2fa")}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl"
          >
            2FA
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {message && (
          <div className="bg-white border rounded-2xl p-4 mb-6 text-red-600">
            {message}
          </div>
        )}

        {user ? (
          <>
            <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-5">Негізгі ақпарат</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl border p-4">
                  <p className="text-sm text-slate-500 mb-1">Пайдаланушы ID</p>
                  <p className="font-semibold text-slate-900">{user.id}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl border p-4">
                  <p className="text-sm text-slate-500 mb-1">Толық аты-жөні</p>
                  <p className="font-semibold text-slate-900">
                    {user.full_name || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl border p-4">
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="font-semibold text-slate-900 break-all">
                    {user.email || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl border p-4">
                  <p className="text-sm text-slate-500 mb-1">Рөл</p>
                  <p className="font-semibold text-slate-900 uppercase">
                    {user.role || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl border p-4 md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Тіркелген уақыты</p>
                  <p className="font-semibold text-slate-900">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-5">Қауіпсіздік параметрлері</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="text-2xl mb-3">🛡️</div>
                  <h4 className="font-semibold text-slate-900">2FA қауіпсіздігі</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Екі факторлы аутентификацияны қосу немесе қайта баптау
                  </p>

                  <button
                    onClick={() => setPage("2fa")}
                    className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
                  >
                    2FA бөліміне өту
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <div className="text-2xl mb-3">📁</div>
                  <h4 className="font-semibold text-slate-900">Құжаттар бөлімі</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Құжаттарды қарау, жүктеу, өшіру және preview жасау
                  </p>

                  <button
                    onClick={() => setPage("documents")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                  >
                    Құжаттарға өту
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center text-slate-500">
            Профиль жүктелуде...
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;