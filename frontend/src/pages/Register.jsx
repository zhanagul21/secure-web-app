import { useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../services/apiConfig";
import logo from "../assets/logo.png";

function Register({ onClose, setLoggedIn, setPage }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage("Барлық өрістерді толтырыңыз");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Құпия сөздер бірдей емес");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register-direct", {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("temp2faToken");

      setLoggedIn?.(true);
      setPage?.("dashboard");
      onClose?.();
    } catch (error) {
      console.error("DIRECT REGISTER ERROR:", error);
      setMessage(getApiErrorMessage(error, "Тіркелу кезінде қате"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[32px] border border-sky-200 bg-white/90 p-7 shadow-sm sm:p-9">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="w-full text-center sm:text-left">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 shadow-sm ring-1 ring-sky-200 sm:mx-0">
                <img
                  src={logo}
                  alt="AuthGuard Locker"
                  className="h-10 w-auto object-contain"
                />
              </div>

              <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
                Тіркелу
              </h2>

              <p className="mt-3 text-slate-700">
                Аккаунтты қазір сайттың өзінен бірден ашып, бірден жүйеге кіре аласыз.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-2xl border border-sky-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-sky-50"
            >
              Жабу
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Email кодын күтпейсіз. Тіркелгеннен кейін жүйе сізді автоматты түрде кіргізеді.
          </div>

          <form onSubmit={handleDirectRegister} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Аты-жөні
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Аты-жөніңізді енгізіңіз"
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
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
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Құпия сөзді қайталау
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Құпия сөзді қайта енгізіңіз"
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Артқа
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
              >
                {loading ? "Тіркелуде..." : "Тіркелу"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
