import { useState } from "react";
import API from "../services/api";

function TwoFA({ setPage, setLoggedIn }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const verify2FA = async (e) => {
    e.preventDefault();
    setMessage("");

    const email = localStorage.getItem("tempUserEmail");

    if (!email) {
      setMessage("Уақытша email табылмады. Қайта кіріңіз.");
      return;
    }

    if (!code) {
      setMessage("2FA кодын енгізіңіз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login-2fa", {
        email,
        token: code,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      localStorage.removeItem("tempUserEmail");
      localStorage.removeItem("tempUserRole");
      localStorage.removeItem("tempUserId");

      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA тексеру қатесі");
    } finally {
      setLoading(false);
    }
  };

  const reset2FA = async (e) => {
    e.preventDefault();
    setMessage("");
    setQrImage("");

    if (!resetEmail || !resetPassword) {
      setMessage("Email мен парольді толтырыңыз");
      return;
    }

    try {
      setResetLoading(true);

      const qrRes = await API.post("/user/2fa/reset-login", {
        email: resetEmail,
        password: resetPassword,
      });

      setQrImage(qrRes.data.qr);
      setMessage("Жаңа QR код дайын. Оны Google Authenticator-ға сканерлеңіз.");
    } catch (error) {
      setMessage(error.response?.data?.message || "QR қайта алу қатесі");
    } finally {
      setResetLoading(false);
    }
  };

  const goBack = () => {
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setPage("dashboard");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(2,132,199,0.15)] sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
              🔑
            </div>

            <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
              2FA растау
            </h2>

            <p className="mt-3 text-slate-700">
              Google Authenticator ішіндегі 6 таңбалы кодты енгізіңіз
            </p>
          </div>

          <form onSubmit={verify2FA} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                2FA коды
              </label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-5 py-4 text-center text-xl tracking-[0.3em] text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                maxLength={6}
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-slate-700 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Тексерілуде..." : "Растау"}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-2xl border border-sky-200 bg-white py-4 text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-sky-50"
              >
                Артқа
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-sky-200 pt-8">
            <button
              onClick={() => setShowReset(!showReset)}
              className="w-full rounded-2xl border border-sky-200 bg-sky-100 py-4 text-lg font-semibold text-slate-800 shadow-sm transition hover:bg-sky-200"
            >
              {showReset ? "QR қайта алу бөлімін жабу" : "QR қайта алу / Қайта баптау"}
            </button>

            {showReset && (
              <form onSubmit={reset2FA} className="mt-6 space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-5 py-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                />

                <input
                  type="password"
                  placeholder="Пароль"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-5 py-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                />

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-2xl bg-slate-700 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resetLoading ? "Жүктелуде..." : "Жаңа QR алу"}
                </button>

                {qrImage && (
                  <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
                    <p className="mb-4 font-medium text-slate-700">
                      Осы QR кодты Google Authenticator-мен сканерлеңіз:
                    </p>
                    <img
                      src={qrImage}
                      alt="2FA QR"
                      className="mx-auto w-64 rounded-2xl border border-sky-200 bg-white p-3 shadow"
                    />
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFA;