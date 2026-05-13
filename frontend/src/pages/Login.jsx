import { useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../services/apiConfig";
import logo from "../assets/logo.png";

const b64url = {
  decode: (str) => {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer;
  },
  encode: (buf) => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
};

function prepareAuthenticationOptions(options) {
  return {
    ...options,
    challenge: b64url.decode(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((credential) => ({
      ...credential,
      id: b64url.decode(credential.id),
    })),
  };
}

function serializeCredential(cred) {
  return {
    id: cred.id,
    rawId: b64url.encode(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: b64url.encode(cred.response.clientDataJSON),
      authenticatorData: b64url.encode(cred.response.authenticatorData),
      signature: b64url.encode(cred.response.signature),
      userHandle: cred.response.userHandle
        ? b64url.encode(cred.response.userHandle)
        : undefined,
    },
  };
}

function Login({ setLoggedIn, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const biometricSupported =
    typeof window !== "undefined" && Boolean(window.PublicKeyCredential);

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
      setMessage(
        getApiErrorMessage(error, "Кіру кезінде қате шықты")
      );
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
      setMessage(getApiErrorMessage(error, "Құпиясөзді қалпына келтіру қатесі"));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setMessage("");

    if (!biometricSupported) {
      setMessage("Бұл браузер Face ID / Touch ID арқылы кіруді қолдамайды.");
      return;
    }

    if (!email.trim()) {
      setMessage("Face ID арқылы кіру үшін алдымен email енгізіңіз.");
      return;
    }

    try {
      setLoading(true);

      const optionsRes = await API.post("/biometric/login/options", {
        email: email.trim(),
      });
      const options = prepareAuthenticationOptions(optionsRes.data);
      const credential = await navigator.credentials.get({ publicKey: options });

      if (!credential) {
        setMessage("Face ID растауы алынбады.");
        return;
      }

      const verifyRes = await API.post("/biometric/login/verify", {
        userId: optionsRes.data.userId,
        credential: serializeCredential(credential),
      });

      localStorage.setItem("token", verifyRes.data.token);
      localStorage.setItem("user", JSON.stringify(verifyRes.data.user));
      localStorage.removeItem("temp2faToken");

      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Face ID арқылы кіру мүмкін болмады. Аккаунт ішінде биометрияны тіркеп көріңіз."
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
      setMessage(getApiErrorMessage(error, "Құпия сөзді жаңарту кезінде қате шықты"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-100 shadow-sm ring-1 ring-sky-200">
              <img
                src={logo}
                alt="AuthGuard Locker"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-xs font-semibold uppercase text-sky-700">
              Қауіпсіз құжат платформасы
            </p>
            <h1 className="text-3xl font-black text-slate-800">
              AuthGuard Locker
            </h1>
            <p className="mt-2 text-slate-600">
              Құжаттарды шифрлап сақтау, қауіпсіз бөлісу және қолжетімділікті басқаруға арналған жүйе.
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

              {biometricSupported && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 font-semibold text-sky-800 transition hover:bg-sky-100 disabled:opacity-70"
                >
                  Face ID / Touch ID арқылы кіру
                </button>
              )}

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
