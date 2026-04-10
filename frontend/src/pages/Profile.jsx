import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ setLoggedIn, setPage, logoutEverywhere }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    setLoggedIn(false);
  };

  const getProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch (error) {
      setMessage("Профиль жүктеу қатесі");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl">
                👤
              </div>

              <div>
                <p className="text-sm font-semibold text-sky-700">
                  AuthGuard Locker
                </p>

                <h1 className="text-2xl font-bold text-slate-800">Профиль</h1>

                <p className="text-sm text-slate-600">Аккаунт мәліметтері</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-white"
              >
                Басты бет
              </button>
              <button
                onClick={() => setPage("documents")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-white"
              >
                Құжаттар
              </button>
              <button
                onClick={logout}
                className="rounded-xl bg-slate-700 px-4 py-2 text-white"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {message}
          </div>
        )}

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          {!user ? (
            <p className="text-slate-600">Жүктелуде...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Аты-жөні</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.full_name || "Көрсетілмеген"}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Рөлі</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.role}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">2FA</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.twofa_enabled ? "Қосылған" : "Қосылмаған"}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Тіркелген уақыты</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "Белгісіз"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;