import { useEffect, useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../services/apiConfig";
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

  const getPasswordStrength = (value) => {
    const checks = [
      value.length >= 8,
      /[A-ZА-ЯЁ]/.test(value),
      /[a-zа-яё]/.test(value),
      /\d/.test(value),
      /[^A-Za-zА-Яа-яЁё0-9]/.test(value),
    ];
    const score = checks.filter(Boolean).length;

    if (score >= 5) return { label: "Күшті", color: "bg-emerald-500", width: "100%" };
    if (score >= 3) return { label: "Орташа", color: "bg-amber-500", width: "66%" };
    return { label: "Әлсіз", color: "bg-rose-500", width: "33%" };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (step !== 3) return;

    setFullName("");
    setPassword("");

    const clearAutofillTimer = window.setTimeout(() => {
      setFullName("");
      setPassword("");
    }, 300);

    return () => window.clearTimeout(clearAutofillTimer);
  }, [step]);

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
      setMessage(res.data.message || "Код email-ге жіберілді");
      setStep(2);
    } catch (error) {
      console.error("SEND CODE ERROR:", error);
      setMessage(getApiErrorMessage(error, "Код жіберу кезінде қате"));
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
      setMessage(getApiErrorMessage(error, "Кодты тексеру кезінде қате"));
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

    if (passwordStrength.label === "Әлсіз") {
      setMessage("Құпия сөз кемінде 8 таңба, бас әріп, кіші әріп және сан қамтуы керек");
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

      setMessage(res.data.message || "Тіркелу сәтті аяқталды");

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
      setMessage(getApiErrorMessage(error, "Тіркелуді аяқтау кезінде қате"));
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
                Email-ге келген кодты растаңыз да, аккаунтыңызды аяқтаңыз.
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
            <form onSubmit={sendCode} autoComplete="off" className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="registration-email"
                  autoComplete="email"
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
            <form onSubmit={verifyCode} autoComplete="off" className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="registration-email-readonly"
                  autoComplete="off"
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
                  name="verification-code"
                  autoComplete="one-time-code"
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
            <form onSubmit={completeRegister} autoComplete="off" className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Аты-жөні
                </label>
                <input
                  type="text"
                  name="new-account-full-name"
                  autoComplete="off"
                  data-lpignore="true"
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
                  name="new-account-email-readonly"
                  autoComplete="off"
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
                  name="new-account-password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Құпия сөз"
                  className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
                />
                {password && (
                  <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Құпия сөз күші</span>
                      <span>{passwordStrength.label}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className={`h-full ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      8+ таңба, бас әріп, кіші әріп, сан және арнайы белгі қолданған дұрыс.
                    </p>
                  </div>
                )}
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
