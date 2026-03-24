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
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />

        <div className="relative p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl shadow-sm">
              🔐
            </div>

            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Жүйеге кіру
            </h2>

            <p className="mt-3 text-slate-600">
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
                placeholder="Мысалы: user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Пароль
              </label>
              <input
                type="password"
                placeholder="Парольді енгізіңіз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Тексерілуде..." : "Кіру"}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-2xl">🛡️</div>
              <p className="mt-2 text-xs text-slate-600">JWT қорғаныс</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-2xl">🔑</div>
              <p className="mt-2 text-xs text-slate-600">2FA қауіпсіздік</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-2xl">📁</div>
              <p className="mt-2 text-xs text-slate-600">AES шифрлау</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;