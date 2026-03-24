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
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Басты бет
              </button>
              <button
                onClick={() => setPage("profile")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Профиль
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

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-800">QR код</h2>
              <p className="mt-1 text-sm text-slate-500">
                Authenticator қолданбасымен сканерлеңіз
              </p>
            </div>

            <div className="flex min-h-[360px] items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-50 to-blue-50 p-6 ring-1 ring-sky-100">
              {qr ? (
                <img
                  src={qr}
                  alt="2FA QR"
                  className="w-56 rounded-2xl bg-white p-3 shadow-sm"
                />
              ) : (
                <p className="text-slate-500">Жүктелуде...</p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-800">Код енгізу</h2>
              <p className="mt-1 text-sm text-slate-500">
                Қолданбадағы 6 таңбалы кодты енгізіңіз
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-sky-50 to-blue-50 p-5 ring-1 ring-sky-100">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Бір реттік код
              </label>

              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="123456"
              />

              <button
                onClick={verify}
                className="mt-4 w-full rounded-2xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Растау
              </button>

              {message && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {message}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-sky-50 p-4">
              <p className="text-sm text-slate-600">
                2FA қосылғаннан кейін аккаунтқа кіру кезінде қосымша қауіпсіздік
                коды сұралады.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFA;