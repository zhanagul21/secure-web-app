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

                <h1 className="text-2xl font-bold text-slate-800">
                  Профиль
                </h1>

                <p className="text-sm text-slate-600">
                  Аккаунт мәліметтері
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={()=>setPage("dashboard")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Басты бет</button>
              <button onClick={()=>setPage("documents")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Құжаттар</button>
              <button onClick={()=>setPage("2fa")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">2FA</button>
              <button onClick={logout} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Шығу</button>
            </div>

          </div>
        </div>

        {message && <div className="bg-white p-4 rounded-xl">{message}</div>}

        {user && (
          <>
            <div className="bg-white p-6 rounded-3xl shadow">
              <h2 className="text-xl font-bold mb-4">Ақпарат</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Card label="ID" value={user.id}/>
                <Card label="Аты" value={user.full_name}/>
                <Card label="Email" value={user.email}/>
                <Card label="Role" value={user.role}/>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow grid md:grid-cols-2 gap-4">

              <ActionCard
                title="2FA қауіпсіздік"
                desc="Қосымша қорғау"
                onClick={()=>setPage("2fa")}
              />

              <ActionCard
                title="Құжаттар"
                desc="Файлдарды басқару"
                onClick={()=>setPage("documents")}
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({label,value}) {
  return (
    <div className="bg-sky-50 p-4 rounded-xl">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ActionCard({title,desc,onClick}) {
  return (
    <div className="bg-sky-50 p-5 rounded-xl">
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>

      <button
        onClick={onClick}
        className="mt-3 bg-slate-700 text-white px-4 py-2 rounded-xl"
      >
        Ашу
      </button>
    </div>
  );
}

export default Profile;