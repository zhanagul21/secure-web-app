import { useEffect, useState } from "react";
import API from "../services/api";

// WebAuthn helper — base64url <-> ArrayBuffer
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

// Options-тегі id/challenge-ді ArrayBuffer-ге айналдыру
function prepareRegistrationOptions(options) {
  return {
    ...options,
    challenge: b64url.decode(options.challenge),
    user: {
      ...options.user,
      id: b64url.decode(options.user.id),
    },
    excludeCredentials: (options.excludeCredentials || []).map((c) => ({
      ...c,
      id: b64url.decode(c.id),
    })),
  };
}

// Credential response-ті сервер үшін сериялау
function serializeCredential(cred) {
  return {
    id: cred.id,
    rawId: b64url.encode(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: b64url.encode(cred.response.clientDataJSON),
      attestationObject: cred.response.attestationObject
        ? b64url.encode(cred.response.attestationObject)
        : undefined,
      authenticatorData: cred.response.authenticatorData
        ? b64url.encode(cred.response.authenticatorData)
        : undefined,
      signature: cred.response.signature
        ? b64url.encode(cred.response.signature)
        : undefined,
      userHandle: cred.response.userHandle
        ? b64url.encode(cred.response.userHandle)
        : undefined,
    },
  };
}

function BiometricSettings({ setPage, setLoggedIn, logoutEverywhere }) {
  const [credentials, setCredentials] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [deviceName, setDeviceName] = useState(
    navigator.userAgent.includes("iPhone") ? "iPhone" :
    navigator.userAgent.includes("Mac") ? "Mac" :
    navigator.userAgent.includes("Windows") ? "Windows PC" :
    navigator.userAgent.includes("Android") ? "Android" : "Менің құрылғым"
  );
  const [supported, setSupported] = useState(true);
  const [platformAvailable, setPlatformAvailable] = useState(null);

  useEffect(() => {
    // WebAuthn қолдауын тексеру
    if (!window.PublicKeyCredential) {
      setSupported(false);
      return;
    }
    if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setPlatformAvailable)
        .catch(() => setPlatformAvailable(false));
    }
    loadCredentials();
  }, []);

  const setMsg = (text, type = "info") => setMessage({ text, type });

  const loadCredentials = async () => {
    try {
      const res = await API.get("/biometric/list");
      setCredentials(res.data.credentials || []);
    } catch {
      setMsg("Тізімді жүктеу мүмкін болмады", "error");
    }
  };

  const registerBiometric = async () => {
    setLoading(true);
    setMsg("", "info");

    try {
      // 1. Сервердан options алу
      const optRes = await API.post("/biometric/register/options");
      const options = prepareRegistrationOptions(optRes.data);

      // 2. Браузер биометрия диалогын ашу
      let credential;
      try {
        credential = await navigator.credentials.create({ publicKey: options });
      } catch (err) {
        if (err.name === "NotAllowedError") {
          setMsg("Биометрия диалогы жабылды немесе рұқсат берілмеді", "error");
          return;
        }
        if (["ConstraintError", "InvalidStateError", "NotSupportedError", "SecurityError", "UnknownError"].includes(err.name)) {
          setMsg(
            "Windows passkey сақтай алмады. Windows Hello PIN бапталғанын тексеріңіз немесе Chrome/Edge браузерінен қайталап көріңіз.",
            "error"
          );
          return;
        }
        throw err;
      }

      // 3. Серверге жіберу
      const serialized = serializeCredential(credential);
      const verifyRes = await API.post("/biometric/register/verify", {
        credential: serialized,
        deviceName,
      });

      setMsg(verifyRes.data.message || "Биометрия сәтті тіркелді!", "success");
      loadCredentials();
    } catch (error) {
      setMsg(error.response?.data?.message || "Биометрия тіркеу қатесі", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCredential = async (id) => {
    if (!window.confirm("Бұл биометрияны өшіресіз бе?")) return;
    try {
      await API.delete(`/biometric/${id}`);
      setMsg("Биометрия өшірілді", "success");
      loadCredentials();
    } catch {
      setMsg("Өшіру мүмкін болмады", "error");
    }
  };

  const logout = () => {
    if (logoutEverywhere) { logoutEverywhere(); return; }
    localStorage.clear();
    setLoggedIn(false);
    setPage("login");
  };

  const msgColors = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  const deviceIcons = {
    iPhone: "📱", Android: "📱", Mac: "💻", "Windows PC": "🖥️", default: "🔑",
  };
  const getIcon = (name) =>
    Object.keys(deviceIcons).find((k) => name?.includes(k))
      ? deviceIcons[Object.keys(deviceIcons).find((k) => name?.includes(k))]
      : deviceIcons.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="rounded-[32px] border border-sky-200 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl ring-1 ring-sky-200">
                🪪
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Биометрия баптау</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Face ID, Touch ID, Windows Hello арқылы кіруді баптаңыз
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 transition">
                Басты бет
              </button>
              <button onClick={() => setPage("twofaSettings")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 transition">
                2FA баптау
              </button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 transition">
                Шығу
              </button>
            </div>
          </div>
        </div>

        {/* Қолдау жоқ хабар */}
        {!supported && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="font-semibold">Браузер WebAuthn қолдамайды</div>
            <p className="mt-1 text-sm">
              Chrome 67+, Safari 14+, Firefox 60+ нұсқасын қолданыңыз.
              HTTPS қосылымы міндетті.
            </p>
          </div>
        )}

        {message.text && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${msgColors[message.type]}`}>
            {message.text}
          </div>
        )}

        {supported && platformAvailable === false && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="font-semibold">Бұл құрылғыда built-in Face ID / Windows Hello табылмады</div>
            <p className="mt-1 text-sm">
              Windows-та Settings → Accounts → Sign-in options арқылы Windows Hello PIN/Face баптаңыз.
              Yandex Browser орнына Chrome немесе Edge қолдансаңыз passkey тұрақтырақ жұмыс істейді.
            </p>
          </div>
        )}

        {supported && (
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Жаңа биометрия қосу */}
            <div className="rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Жаңа құрылғы тіркеу</h2>
              <p className="mt-2 text-sm text-slate-600">
                Биометрия тіркелгеннен кейін пароль енгізбей-ақ кіре аласыз.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Құрылғы атауы
                  </label>
                  <input
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Мысалы: Менің iPhone-ым"
                    className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                {/* Platform support chips */}
                <div className="flex flex-wrap gap-2">
                  {["Face ID", "Touch ID", "Windows Hello", "Android Biometric"].map((p) => (
                    <span key={p} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      {p}
                    </span>
                  ))}
                </div>

                <button
                  onClick={registerBiometric}
                  disabled={loading || !deviceName.trim()}
                  className="w-full rounded-2xl bg-slate-800 py-3 font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/>
                      </svg>
                      Биометрия диалогы ашылуда...
                    </span>
                  ) : (
                    "Биометрия тіркеу"
                  )}
                </button>
              </div>

              {/* Жұмыс принципі */}
              <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <div className="text-sm font-semibold text-sky-800">Қалай жұмыс істейді?</div>
                <ol className="mt-3 space-y-2 text-sm text-sky-900">
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xs font-bold text-sky-800">1</span>
                    Сервер challenge жасайды
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xs font-bold text-sky-800">2</span>
                    Браузер Face ID / Touch ID сұрайды
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xs font-bold text-sky-800">3</span>
                    Public key серверде сақталады
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xs font-bold text-sky-800">4</span>
                    Private key тек құрылғыда қалады
                  </li>
                </ol>
              </div>
            </div>

            {/* Тіркелген биометриялар */}
            <div className="rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Тіркелген құрылғылар</h2>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                  {credentials.length}
                </span>
              </div>

              {credentials.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50 py-12 text-center">
                  <div className="text-4xl">🔒</div>
                  <p className="mt-3 text-sm text-slate-600">
                    Биометрия тіркелмеген
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Сол жақтан жаңа құрылғы қосыңыз
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getIcon(cred.device_name)}</span>
                        <div>
                          <div className="font-semibold text-slate-900">{cred.device_name}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            Тіркелді: {new Date(cred.created_at).toLocaleDateString("kk-KZ")}
                          </div>
                          {cred.last_used_at && (
                            <div className="text-xs text-slate-500">
                              Соңғы кіру: {new Date(cred.last_used_at).toLocaleDateString("kk-KZ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCredential(cred.id)}
                        className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Өшіру
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Қауіпсіздік ескертпесі */}
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-800">Қауіпсіздік</div>
                <p className="mt-1 text-sm text-emerald-700">
                  Биометрия деректері тек сіздің құрылғыңызда сақталады.
                  Сервер тек криптографиялық public key алады.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BiometricSettings;
