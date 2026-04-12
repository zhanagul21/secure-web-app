import { useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";

function Register({ onClose }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Email енгізіңіз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/send-code", {
        email: email.trim(),
      });

      setMessage(res.data.message || "Код жіберілді");
      setStep(2);
    } catch (error) {
      console.error("SEND CODE ERROR:", error);
      setMessage(error.response?.data?.message || "Код жіберу кезінде қате");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !code.trim()) {
      setMessage("Email мен кодты енгізіңіз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/verify-code", {
        email: email.trim(),
        code: code.trim(),
      });

      setMessage(res.data.message || "Код расталды");
      setCodeVerified(true);
      setStep(3);
    } catch (error) {
      console.error("VERIFY CODE ERROR:", error);
      setMessage(error.response?.data?.message || "Код қате");
    } finally {
      setLoading(false);
    }
  };

  const completeRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setMessage("Барлық өрістерді толтырыңыз");
      return;
    }

    if (!codeVerified) {
      setMessage("Алдымен кодты растаңыз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/complete-register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      setMessage(
        res.data.message ||
          "Тіркелу сәтті аяқталды"
      );

      setTimeout(() => {
        setStep(1);
        setFullName("");
        setEmail("");
        setCode("");
        setPassword("");
        setCodeVerified(false);
        onClose?.();
      }, 1200);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setMessage(error.response?.data?.message || "Тіркелу қатесі");
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
                AuthGuard Locker жүйесіне қосылу үшін email-ді растаңыз да, аккаунтыңызды аяқтаңыз
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

          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>1. Email</span>
              <span>2. Код</span>
              <span>3. Аяқтау</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className={`h-2 rounded-full ${step >= 1 ? "bg-sky-500" : "bg-slate-200"}`} />
              <div className={`h-2 rounded-full ${step >= 2 ? "bg-sky-500" : "bg-slate-200"}`} />
              <div className={`h-2 rounded-full ${step >= 3 ? "bg-sky-500" : "bg-slate-200"}`} />
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
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
                className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
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
                  className="w-full rounded-2xl border border-sky-200 bg-slate-100 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Растау коды
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6 таңбалы код"
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
                  onClick={() => setStep(1)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Артқа
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {loading ? "Тексерілуде..." : "Кодты растау"}
                </button>
              </div>
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
                  disabled
                  className="w-full rounded-2xl border border-sky-200 bg-slate-100 px-4 py-3 outline-none"
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

              {message && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Артқа
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {loading ? "Аяқталуда..." : "Тіркелуді аяқтау"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
