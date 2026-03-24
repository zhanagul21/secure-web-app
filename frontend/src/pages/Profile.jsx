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
    } catch (error) {
      setMessage("Профиль жүктеу қатесі");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl shadow-sm ring-1 ring-sky-100">
                👤
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Профиль
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Жеке деректер, қауіпсіздік және құжаттарға жылдам қолжетімділік
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
              </button>
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжаттар
              </button>
              <button
                onClick={() => setPage("2fa")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                2FA
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

        {message && (
          <div className="rounded-2xl border border-rose-100 bg-white/95 p-4 text-rose-700 shadow-sm">
            {message}
          </div>
        )}

        {user && (
          <>
            <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Ақпарат</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Аккаунт туралы негізгі мәліметтер
                  </p>
                </div>

                <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                  Secure Profile
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card label="ID" value={user.id} />
                <Card label="Аты" value={user.full_name} />
                <Card label="Email" value={user.email} />
                <Card label="Role" value={user.role} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ActionCard
                title="2FA қауіпсіздік"
                desc="Google Authenticator арқылы қосымша қорғауды басқару"
                onClick={() => setPage("2fa")}
                icon="🔐"
              />

              <ActionCard
                title="Құжаттар"
                desc="Жүктелген файлдарды қарау, басқару және жүктеу"
                onClick={() => setPage("documents")}
                icon="📂"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function ActionCard({ title, desc, onClick, icon }) {
  return (
    <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>

      <button
        onClick={onClick}
        className="mt-6 rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
      >
        Ашу
      </button>
    </div>
  );
}

export default Profile;