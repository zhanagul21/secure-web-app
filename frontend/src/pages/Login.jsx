import { useState } from "react";
import API from "../services/api";

function Login({ setLoggedIn, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Email мен парольді толтырыңыз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.requires2fa) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("temp2faToken", res.data.tempToken);
        setPage("2fa");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("temp2faToken");

      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setMessage(error.response?.data?.message || "Login қатесі");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage("");

    if (!resetEmail.trim()) {
      setMessage("Email енгізіңіз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/forgot-password", {
        email: resetEmail.trim(),
      });

      setMessage(res.data.message || "Қалпына келтіру коды жіберілді");
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      setMessage(
        error.response?.data?.message || "Құпиясөзді қалпына келтіру қатесі"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setMessage("");

    if (!resetEmail.trim() || !resetCode.trim() || !newPassword.trim()) {
      setMessage("Барлық өрісті толтырыңыз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/reset-password", {
        email: resetEmail.trim(),
        code: resetCode.trim(),
        newPassword: newPassword.trim(),
      });

      setMessage(res.data.message || "Құпия сөз жаңартылды");
      setResetCode("");
      setNewPassword("");
      setShowForgot(false);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      setMessage(error.response?.data?.message || "Reset password қатесі");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-800">
              Secure Web Application
            </h1>
            <p className="mt-2 text-slate-600">
              Қазіргі аутентификация және шифрлау әдістеріне негізделген қорғалған веб-қосымша
            </p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email енгізіңіз"
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Құпия сөз
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Құпия сөз"
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? "Кіріп жатыр..." : "Кіру"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setPage("register");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Тіркелу
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setMessage("");
                  setResetEmail(email);
                }}
                className="w-full text-sm font-medium text-sky-700"
              >
                Құпия сөзді ұмыттыңыз ба?
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
              >
                Код жіберу
              </button>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Код
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
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
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                Құпия сөзді жаңарту
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Артқа
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;