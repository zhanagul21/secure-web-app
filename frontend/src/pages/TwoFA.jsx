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

    await API.post(
      "/user/2fa/verify",
      { token: code },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("2FA қосылды");
  };

  useEffect(() => {
    loadQR();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl shadow-sm ring-1 ring-sky-100">
                🔐
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  2FA Қауіпсіздік
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Google Authenticator арқылы аккаунтыңызға қосымша қорғаныс
                  қосыңыз
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={() => setPage("profile")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Профиль</button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow">
            <h2 className="font-bold mb-3">QR код</h2>
            {qr ? <img src={qr} className="mx-auto w-52"/> : "Жүктелуде..."}
          </div>

          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow">
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