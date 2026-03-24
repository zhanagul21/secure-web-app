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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* NAV */}
        <div className="bg-white rounded-3xl p-5 shadow flex justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-slate-800">Профиль</h1>

          <div className="flex gap-3 flex-wrap">
            <button onClick={()=>setPage("dashboard")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Dashboard</button>
            <button onClick={()=>setPage("documents")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Құжаттар</button>
            <button onClick={()=>setPage("2fa")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">2FA</button>
            <button onClick={logout} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Шығу</button>
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