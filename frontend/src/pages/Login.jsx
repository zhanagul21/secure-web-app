import logo from "../assets/logo.png";
import { useState } from "react";
import API from "../services/api";
import Register from "./Register";

function Login({ setLoggedIn, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Email мен парольді толтырыңыз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data.requires2fa) {
        localStorage.setItem("tempUserEmail", res.data.email);
        setMessage("2FA кодын енгізу қажет");
        setPage("2fa");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("tempUserEmail");

      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Кіру қатесі");
    } finally {
      setLoading(false);
    }
  };

  const sendResetCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!resetEmail) {
      setMessage("Email енгізіңіз");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await API.post("/auth/forgot-password", {
        email: resetEmail,
      });
      setMessage(res.data.message || "Қалпына келтіру коды жіберілді");
      setForgotStep(2);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Код жіберу кезінде қате шықты"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!resetEmail || !resetCode || !newPassword) {
      setMessage("Барлық өрістерді толтырыңыз");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await API.post("/auth/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword,
      });
      setMessage(res.data.message || "Құпия сөз жаңартылды");
      setShowForgot(false);
      setForgotStep(1);
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Парольді жаңарту кезінде қате шықты"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="AuthGuard Locker"
              className="h-16 object-contain md:h-24"
            />
          </div>

          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Қауіпсіз құжат сақтау, басқару және шифрлау жүйесі
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              JWT Authentication
            </span>
            <span className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              2FA Protection
            </span>
            <span className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              AES Encryption
            </span>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="w-full">
            <div className="overflow-hidden rounded-[32px] border border-sky-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(2,132,199,0.15)] sm:p-9">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
                  🔐
                </div>

                <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
                  Жүйеге кіру
                </h2>

                <p className="mt-3 text-slate-700">
                  Қауіпсіз құжат сақтау жүйесіне кіру үшін аккаунтыңызды пайдаланыңыз
                </p>
              </div>

              <form onSubmit={loginUser} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Құпия сөз
                  </label>
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Күтіңіз..." : "Кіру"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false);
                      setShowForgot(true);
                      setMessage("");
                    }}
                    className="rounded-2xl border border-sky-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-sky-50"
                  >
                    Парольді ұмыттым
                  </button>
                </div>
              </form>

              {message && (
                <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setShowRegister(true);
                    setMessage("");
                  }}
                  className="font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  Аккаунт жоқ па? Тіркелу
                </button>
              </div>
            </div>
          </div>

          <div className="w-full">
            {showRegister ? (
              <Register
                onClose={() => {
                  setShowRegister(false);
                  setMessage("");
                }}
              />
            ) : showForgot ? (
              <div className="overflow-hidden rounded-[32px] border border-sky-200 bg-white/90 p-7 shadow-[0_20px_60px_rgba(2,132,199,0.15)] sm:p-9">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="w-full text-center sm:text-left">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200 sm:mx-0">
                      🔄
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
                      Құпия сөзді қалпына келтіру
                    </h2>

                    <p className="mt-3 text-slate-700">
                      Email арқылы код алып, жаңа құпия сөз орнатыңыз
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForgot}
                    className="shrink-0 rounded-2xl border border-sky-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-sky-50"
                  >
                    Жабу
                  </button>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={sendResetCode} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {forgotLoading ? "Жіберілуде..." : "Код жіберу"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={resetPasswordSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Код
                      </label>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="6 таңбалы код"
                        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Жаңа құпия сөз
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Жаңа пароль"
                        className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {forgotLoading ? "Жаңартылуда..." : "Парольді жаңарту"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="rounded-2xl border border-sky-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-sky-50"
                      >
                        Артқа
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-[32px] border border-sky-200 bg-white/60 p-8 text-center shadow-[0_20px_60px_rgba(2,132,199,0.08)]">
                <div>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl ring-1 ring-sky-200">
                    🛡️
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Қорғалған веб-қосымша
                  </h3>
                  <p className="mt-3 max-w-md text-slate-600">
                    Қазіргі аутентификация және шифрлау әдістерін пайдалана отырып,
                    қауіпсіз құжат сақтау жүйесі.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;