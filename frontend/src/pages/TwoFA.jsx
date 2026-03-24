import { useEffect, useState } from "react";
import API from "../services/api";

function TwoFA({ setPage, setLoggedIn }) {
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const loadQR = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/user/2fa/setup", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setQr(res.data.qr);
  };

  const verify = async () => {
    const token = localStorage.getItem("token");

    await API.post("/user/2fa/verify",
      { token: code },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("2FA қосылды");
  };

  useEffect(()=>{ loadQR(); },[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* NAV */}
        <div className="bg-white p-5 rounded-3xl shadow flex justify-between flex-wrap gap-3">
          <h1 className="font-bold text-xl">2FA</h1>

          <div className="flex gap-3">
            <button onClick={()=>setPage("dashboard")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Dashboard</button>
            <button onClick={()=>setPage("profile")} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Profile</button>
            <button onClick={logout} className="bg-slate-700 text-white px-4 py-2 rounded-xl">Шығу</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow grid md:grid-cols-2 gap-6">

          <div className="bg-sky-50 p-6 rounded-xl text-center">
            <h2 className="font-bold mb-3">QR код</h2>

            {qr ? (
              <img src={qr} className="mx-auto w-52"/>
            ) : "Жүктелуде..."}
          </div>

          <div className="bg-sky-50 p-6 rounded-xl">
            <h2 className="font-bold mb-3">Код енгізу</h2>

            <input
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              className="w-full p-3 rounded-xl border"
              placeholder="123456"
            />

            <button
              onClick={verify}
              className="w-full mt-3 bg-slate-700 text-white py-3 rounded-xl"
            >
              Растау
            </button>

            {message && <p className="mt-3">{message}</p>}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TwoFA;