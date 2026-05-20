import { useState, useCallback } from "react";

// ─── AES-256 (Web Crypto API) ───────────────────────────────────────────────
async function aesEncrypt(text, password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, enc.encode(text)
  );
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...result));
}

async function aesDecrypt(cipherB64, password) {
  const enc = new TextEncoder();
  const bytes = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const data = bytes.slice(28);
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

// ─── SHA-256 ─────────────────────────────────────────────────────────────────
async function sha256(text) {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── RSA Key Pair ─────────────────────────────────────────────────────────────
async function generateRSA() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );
  const pubExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const wrapPem = (b64, type) => {
    const lines = b64.match(/.{1,64}/g).join("\n");
    return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`;
  };
  return {
    publicKey: wrapPem(toBase64(pubExported), "PUBLIC KEY"),
    privateKey: wrapPem(toBase64(privExported), "PRIVATE KEY"),
  };
}

// ─── Tab components ──────────────────────────────────────────────────────────

function AESTab() {
  const [mode, setMode] = useState("encrypt"); // encrypt | decrypt
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0); // 0=idle,1=processing,2=done

  const runAES = async () => {
    if (!inputText.trim() || !password.trim()) {
      setMessage("Мәтін мен кілтті енгізіңіз");
      return;
    }
    setLoading(true);
    setMessage("");
    setStep(1);
    setOutputText("");
    try {
      await new Promise((r) => setTimeout(r, 600));
      const result =
        mode === "encrypt"
          ? await aesEncrypt(inputText, password)
          : await aesDecrypt(inputText, password);
      setOutputText(result);
      setStep(2);
      setMessage(mode === "encrypt" ? "✅ AES-256-GCM шифрлау сәтті аяқталды" : "✅ Дешифрлау сәтті аяқталды");
    } catch {
      setMessage("❌ Қате: кілтті немесе шифрланған мәтінді тексеріңіз");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
    setMessage("📋 Буферге көшірілді");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
        <div className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">Алгоритм</div>
        <div className="mt-2 text-2xl font-black text-slate-900">AES-256-GCM</div>
        <p className="mt-2 text-sm text-slate-600">
          256-биттік кілт пен аутентификацияланған шифрлауды қолданатын қазіргі заманғы симметриялық алгоритм. 
          Web Crypto API арқылы браузердің өзінде орындалады — мәтін сервер арқылы өтпейді.
        </p>
      </div>

      {/* Режим таңдау */}
      <div className="flex gap-3">
        <button
          onClick={() => { setMode("encrypt"); setOutputText(""); setMessage(""); setStep(0); }}
          className={`flex-1 rounded-2xl py-3 font-bold transition ${mode === "encrypt" ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          🔒 Шифрлау
        </button>
        <button
          onClick={() => { setMode("decrypt"); setOutputText(""); setMessage(""); setStep(0); }}
          className={`flex-1 rounded-2xl py-3 font-bold transition ${mode === "decrypt" ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          🔓 Дешифрлау
        </button>
      </div>

      {/* Визуалды процесс */}
      {step > 0 && (
        <div className="rounded-3xl border border-sky-100 bg-white p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <div className={`h-3 w-3 rounded-full ${step >= 1 ? "bg-sky-500" : "bg-slate-200"}`} />
            <span className={step >= 1 ? "text-slate-900" : "text-slate-400"}>Кілт PBKDF2 арқылы туынды алынуда (100 000 итерация)</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <div className={`h-3 w-3 rounded-full ${step >= 2 ? "bg-emerald-500" : step === 1 ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`} />
            <span className={step >= 2 ? "text-slate-900" : "text-slate-400"}>
              {mode === "encrypt" ? "AES-256-GCM шифрлау орындалуда..." : "AES-256-GCM дешифрлау орындалуда..."}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <div className={`h-3 w-3 rounded-full ${step >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
            <span className={step >= 2 ? "text-slate-900" : "text-slate-400"}>Base64 форматқа түрлендіру</span>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {mode === "encrypt" ? "Шифрланатын мәтін" : "Шифрланған мәтін (Base64)"}
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={mode === "encrypt" ? "Мысалы: Құпия ақпарат..." : "Base64 шифрланған мәтін..."}
          className="min-h-[100px] w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Шифрлау кілті (пароль)</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Мысалы: MySecretKey123!"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400"
        />
      </div>

      <button
        onClick={runAES}
        disabled={loading}
        className="w-full rounded-2xl bg-slate-800 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? "Орындалуда..." : mode === "encrypt" ? "🔒 Шифрлау" : "🔓 Дешифрлау"}
      </button>

      {message && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700">{message}</div>
      )}

      {outputText && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Нәтиже</label>
            <button onClick={copyOutput} className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Көшіру</button>
          </div>
          <div className="min-h-[80px] w-full break-all rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-mono text-sm text-emerald-800">
            {outputText}
          </div>
        </div>
      )}
    </div>
  );
}

function SHATab() {
  const [input, setInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [compareInput, setCompareInput] = useState("");
  const [compareResult, setCompareResult] = useState(null);

  const runHash = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setHashResult("");
    setCompareResult(null);
    await new Promise((r) => setTimeout(r, 300));
    const h = await sha256(input);
    setHashResult(h);
    setLoading(false);
  };

  const runCompare = async () => {
    if (!compareInput.trim() || !hashResult) return;
    const h = await sha256(compareInput);
    setCompareResult(h === hashResult);
  };

  const copyHash = () => navigator.clipboard.writeText(hashResult);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
        <div className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">Алгоритм</div>
        <div className="mt-2 text-2xl font-black text-slate-900">SHA-256</div>
        <p className="mt-2 text-sm text-slate-600">
          Криптографиялық хэш функциясы. Кез-келген ұзындықтағы деректен 256-бит тұрақты хэш жасайды. 
          Парольдерді, деректер тұтастығын тексеруде қолданылады. Кері аудару мүмкін емес.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Хэштелетін мәтін</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setHashResult(""); setCompareResult(null); }}
          placeholder="Кез-келген мәтін енгізіңіз..."
          className="min-h-[100px] w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 outline-none focus:border-sky-400"
        />
      </div>

      <button onClick={runHash} disabled={loading || !input.trim()} className="w-full rounded-2xl bg-slate-800 py-3 font-bold text-white disabled:opacity-60">
        {loading ? "Есептелуде..." : "# SHA-256 хэш жасау"}
      </button>

      {hashResult && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">SHA-256 хэш (64 символ / 256 bit)</label>
            <button onClick={copyHash} className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Көшіру</button>
          </div>
          <div className="break-all rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-mono text-sm text-emerald-800">
            {hashResult}
          </div>

          {/* Хэш визуализациясы */}
          <div className="mt-3 flex flex-wrap gap-1">
            {hashResult.match(/.{1,2}/g).map((pair, i) => (
              <span
                key={i}
                className="rounded px-1 py-0.5 font-mono text-xs font-bold"
                style={{ backgroundColor: `hsl(${parseInt(pair, 16) % 360}, 60%, 90%)`, color: `hsl(${parseInt(pair, 16) % 360}, 60%, 30%)` }}
              >
                {pair}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Хэштің әрбір 2 байты (жоғарыда) бірегей боялған — визуалды тексеру үшін</p>
        </div>
      )}

      {hashResult && (
        <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
          <div className="font-semibold text-slate-800">Тұтастықты тексеру</div>
          <p className="mt-1 text-sm text-slate-600">Екінші мәтін осы хэшпен сәйкес келе ме?</p>
          <div className="mt-3 flex gap-3">
            <input
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
              placeholder="Тексеретін мәтін..."
              className="flex-1 rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none"
            />
            <button onClick={runCompare} className="rounded-2xl bg-slate-800 px-4 py-3 font-bold text-white">Тексеру</button>
          </div>
          {compareResult !== null && (
            <div className={`mt-3 rounded-2xl px-4 py-3 font-bold ${compareResult ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {compareResult ? "✅ Хэштер сәйкес келеді — мәтін өзгерілмеген" : "❌ Хэштер сәйкес келмейді — мәтін өзгерілген"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RSATab() {
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const generate = async () => {
    setLoading(true);
    setKeys(null);
    setMessage("");
    try {
      const result = await generateRSA();
      setKeys(result);
      setMessage("✅ RSA-2048 кілт жұбы сәтті жасалды");
    } catch {
      setMessage("❌ RSA генерациясында қате шықты");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = (type, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
        <div className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">Алгоритм</div>
        <div className="mt-2 text-2xl font-black text-slate-900">RSA-2048</div>
        <p className="mt-2 text-sm text-slate-600">
          Асимметриялық шифрлау: ашық кілтпен шифрлайсыз, жабық кілтпен дешифрлайсыз.
          TLS/SSL, JWT, цифрлық қолтаңбада кеңінен қолданылады. 2048-бит = ~617 цифрлық сан.
        </p>
      </div>

      {/* RSA визуалды түсіндірме */}
      <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 items-center gap-2 text-center text-sm">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
            <div className="text-lg">👤</div>
            <div className="mt-1 font-bold text-slate-800">Жіберуші</div>
            <div className="text-xs text-slate-600">Ашық кілтпен шифрлайды</div>
          </div>
          <div className="font-black text-sky-600">→ 🔒 →</div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <div className="text-lg">🔑</div>
            <div className="mt-1 font-bold text-slate-800">Алушы</div>
            <div className="text-xs text-slate-600">Жабық кілтпен ашады</div>
          </div>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-2xl bg-slate-800 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? "RSA кілт жұбы жасалуда (2048-bit)..." : "🔑 RSA кілт жұбын жасау"}
      </button>

      {loading && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⏳ 2048-бит кілт жасалуда... Үлкен жай сандар іздеуде (p × q факторизациясы)
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700">{message}</div>
      )}

      {keys && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">🌐 Ашық кілт (Public Key) — бөлісуге болады</span>
              <button onClick={() => copyKey("public", keys.publicKey)} className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {copiedKey === "public" ? "✅ Көшірілді" : "Көшіру"}
              </button>
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 font-mono text-xs text-slate-700">
              {keys.publicKey}
            </pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">🔐 Жабық кілт (Private Key) — құпия!</span>
              <button onClick={() => copyKey("private", keys.privateKey)} className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                {copiedKey === "private" ? "✅ Көшірілді" : "Көшіру"}
              </button>
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 font-mono text-xs text-rose-900">
              {keys.privateKey}
            </pre>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            ⚠️ Жабық кілтті ешкімге бермеңіз. Ол тек сіздің компьютеріңізде болуы керек.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function EncryptionLab({ setPage, setLoggedIn, logoutEverywhere }) {
  const [activeTab, setActiveTab] = useState("aes");

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("temp2faToken");
    setLoggedIn(false);
    setPage("login");
  };

  const tabs = [
    { id: "aes", label: "AES-256", icon: "🔒", desc: "Шифрлау / Дешифрлау" },
    { id: "sha", label: "SHA-256", icon: "#", desc: "Хэш генератор" },
    { id: "rsa", label: "RSA-2048", icon: "🔑", desc: "Кілт жұбы" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#eff6ff_36%,#f8fafc_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-[34px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.15)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">Криптографиялық модуль</h1>
              <p className="mt-2 max-w-xl text-slate-600">
                AES-256, SHA-256 және RSA-2048 алгоритмдерін браузерде тікелей іске асырыңыз.
                Барлығы Web Crypto API арқылы клиент жағында орындалады — деректер серверге жіберілмейді.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={logout} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: "🌐", title: "Web Crypto API", desc: "Браузерге кіріктірілген криптографиялық интерфейс — бөлек кітапхана талап етілмейді" },
            { icon: "🛡️", title: "Client-Side Only", desc: "Деректер тек пайдаланушы браузерінде өңделеді, сервер арқылы өтпейді" },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-sm">
              <div className="text-2xl">{item.icon}</div>
              <div className="mt-2 font-black text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-600">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 font-bold transition ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-lg"
                  : "border border-sky-200 bg-white text-slate-700 hover:bg-sky-50"
              }`}
            >
              <span>{tab.icon}</span>
              <div className="text-left">
                <div className="font-black">{tab.label}</div>
                <div className={`text-xs font-medium ${activeTab === tab.id ? "text-slate-300" : "text-slate-500"}`}>{tab.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          {activeTab === "aes" && <AESTab />}
          {activeTab === "sha" && <SHATab />}
          {activeTab === "rsa" && <RSATab />}
        </div>


      </div>
    </div>
  );
}

export default EncryptionLab;
