import { useState } from "react";
import API from "../services/api";

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
        localStorage.setItem("tempUserEmail", res.data.tempUser.email);
        localStorage.setItem("tempUserRole", res.data.tempUser.role || "user");
        localStorage.setItem("tempUserId", res.data.tempUser.id);
        setMessage("2FA кодын енгізу қажет");
        window.location.reload();
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setLoggedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Кіру қатесі");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-indigo-600/10" />

        <div className="relative p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl shadow-lg">
              🔐
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Жүйеге кіру
            </h2>

            <p className="mt-3 text-slate-200">
              Қауіпсіз құжат сақтау жүйесіне кіру үшін аккаунтыңызды пайдаланыңыз
            </p>
          </div>

          <form onSubmit={loginUser} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-100">
                Email
              </label>
              <input
                type="email"
                placeholder="Мысалы: user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/90 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-100">
                Пароль
              </label>
              <input
                type="password"
                placeholder="Парольді енгізіңіз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/90 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-500 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Тексерілуде..." : "Кіру"}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-2xl">🛡️</div>
              <p className="mt-2 text-xs text-slate-200">JWT қорғаныс</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-2xl">🔑</div>
              <p className="mt-2 text-xs text-slate-200">2FA қауіпсіздік</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-2xl">📁</div>
              <p className="mt-2 text-xs text-slate-200">AES шифрлау</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;