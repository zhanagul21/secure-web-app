import { useState } from "react";
import API from "../services/api";

function Register() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Email енгізіңіз");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/send-code", { email });
      setMessage(res.data.message || "Код жіберілді");
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Код жіберу кезінде қате");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !code) {
      setMessage("Email мен кодты енгізіңіз");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/verify-code", { email, code });
      setMessage(res.data.message || "Код расталды");
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data?.message || "Код қате");
    } finally {
      setLoading(false);
    }
  };

  const completeRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName || !email || !password) {
      setMessage("Барлық өрістерді толтырыңыз");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/complete-register", {
        full_name: fullName,
        email,
        password,
      });

      setMessage(res.data.message || "Тіркелу сәтті аяқталды");
      setStep(1);
      setFullName("");
      setEmail("");
      setCode("");
      setPassword("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Тіркелу қатесі");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50" />

        <div className="relative p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-sm">
              ✨
            </div>

            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Тіркелу
            </h2>

            <p className="mt-3 text-slate-600">
              Жаңа аккаунт жасау үшін төмендегі қадамдарды орындаңыз
            </p>
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 1 ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            </div>
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 2 ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            </div>
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step >= 3 ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={sendCode} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email адресіңіз"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Жіберілуде..." : "Код жіберу"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyCode} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Растау коды
                </label>
                <input
                  type="text"
                  placeholder="6 таңбалы код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
                {loading ? "Тексерілуде..." : "Кодты растау"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={completeRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Аты-жөні
                </label>
                <input
                  type="text"
                  placeholder="Толық аты-жөніңіз"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Құпиясөз жасаңыз"
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
                className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Аяқталуда..." : "Тіркелуді аяқтау"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;