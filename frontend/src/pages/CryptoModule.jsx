import { useState } from "react";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function arrayBufferToPem(buffer, label) {
  const base64 = bytesToBase64(new Uint8Array(buffer));
  const lines = base64.match(/.{1,64}/g)?.join("\n") || "";
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  return base64ToBytes(base64).buffer;
}

async function deriveAesKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function CryptoModule({ setPage, setLoggedIn, logoutEverywhere }) {
  const [activeTool, setActiveTool] = useState("aes");
  const [aesMode, setAesMode] = useState("encrypt");
  const [aesPlaintext, setAesPlaintext] = useState("");
  const [aesCiphertext, setAesCiphertext] = useState("");
  const [aesPassword, setAesPassword] = useState("");
  const [aesResult, setAesResult] = useState("");
  const [aesMessage, setAesMessage] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [rsaPublicKey, setRsaPublicKey] = useState("");
  const [rsaPrivateKey, setRsaPrivateKey] = useState("");
  const [rsaPlaintext, setRsaPlaintext] = useState("");
  const [rsaCiphertext, setRsaCiphertext] = useState("");
  const [rsaDecrypted, setRsaDecrypted] = useState("");
  const [rsaMessage, setRsaMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setLoggedIn(false);
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  const switchAesMode = (mode) => {
    setAesMode(mode);
    setAesResult("");
    setAesMessage("");
  };

  const encryptAes = async () => {
    if (!aesPlaintext.trim() || !aesPassword) {
      setAesMessage("Мәтін мен парольді енгізіңіз.");
      return;
    }

    try {
      setLoading(true);
      setAesMessage("Кілт PBKDF2 арқылы туынды алынуда (100 000 итерация)");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveAesKey(aesPassword, salt);
      const encrypted = new Uint8Array(
        await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          encoder.encode(aesPlaintext)
        )
      );
      const packed = new Uint8Array(salt.length + iv.length + encrypted.length);
      packed.set(salt, 0);
      packed.set(iv, salt.length);
      packed.set(encrypted, salt.length + iv.length);
      const result = bytesToBase64(packed);
      setAesCiphertext(result);
      setAesResult(result);
      setAesMessage("AES-256-GCM шифрлау сәтті аяқталды.");
    } catch {
      setAesMessage("Шифрлау кезінде қате шықты.");
    } finally {
      setLoading(false);
    }
  };

  const decryptAes = async () => {
    if (!aesCiphertext.trim() || !aesPassword) {
      setAesMessage("Base64 мәтін мен парольді енгізіңіз.");
      return;
    }

    try {
      setLoading(true);
      setAesMessage("AES-256-GCM дешифрлау орындалуда...");
      const packed = base64ToBytes(aesCiphertext.trim());
      const salt = packed.slice(0, 16);
      const iv = packed.slice(16, 28);
      const encrypted = packed.slice(28);
      const key = await deriveAesKey(aesPassword, salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
      );
      const result = decoder.decode(decrypted);
      setAesPlaintext(result);
      setAesResult(result);
      setAesMessage("Дешифрлау сәтті аяқталды.");
    } catch {
      setAesMessage("Дешифрлау орындалмады. Пароль немесе Base64 мәтін қате болуы мүмкін.");
    } finally {
      setLoading(false);
    }
  };

  const createHash = async () => {
    if (!hashInput.trim()) return;
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(hashInput));
    setHashResult(bufferToHex(digest));
  };

  const generateRsaKeys = async () => {
    try {
      setLoading(true);
      setRsaMessage("RSA-2048 кілт жұбы жасалуда...");
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
      const publicBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      setRsaPublicKey(arrayBufferToPem(publicBuffer, "PUBLIC KEY"));
      setRsaPrivateKey(arrayBufferToPem(privateBuffer, "PRIVATE KEY"));
      setRsaCiphertext("");
      setRsaDecrypted("");
      setRsaMessage("RSA-2048 кілт жұбы сәтті жасалды.");
    } catch {
      setRsaMessage("RSA кілтін жасау кезінде қате шықты.");
    } finally {
      setLoading(false);
    }
  };

  const encryptRsa = async () => {
    if (!rsaPublicKey.trim() || !rsaPlaintext.trim()) {
      setRsaMessage("Public Key және мәтінді енгізіңіз.");
      return;
    }

    const data = encoder.encode(rsaPlaintext);
    if (data.length > 190) {
      setRsaMessage("RSA-2048 қысқа мәтінге арналған. Ұзын мәтін/файл үшін AES қолданыңыз.");
      return;
    }

    try {
      setLoading(true);
      const publicKey = await crypto.subtle.importKey(
        "spki",
        pemToArrayBuffer(rsaPublicKey),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );
      const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
      const result = bytesToBase64(new Uint8Array(encrypted));
      setRsaCiphertext(result);
      setRsaDecrypted("");
      setRsaMessage("Мәтін Public Key арқылы шифрланды.");
    } catch {
      setRsaMessage("RSA шифрлау орындалмады. Public Key форматын тексеріңіз.");
    } finally {
      setLoading(false);
    }
  };

  const decryptRsa = async () => {
    if (!rsaPrivateKey.trim() || !rsaCiphertext.trim()) {
      setRsaMessage("Private Key және RSA ciphertext енгізіңіз.");
      return;
    }

    try {
      setLoading(true);
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBuffer(rsaPrivateKey),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );
      const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        base64ToBytes(rsaCiphertext.trim())
      );
      setRsaDecrypted(decoder.decode(decrypted));
      setRsaMessage("Ciphertext Private Key арқылы ашылды.");
    } catch {
      setRsaMessage("RSA дешифрлау орындалмады. Private Key немесе ciphertext қате болуы мүмкін.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#f8fafc_42%,#dbeafe_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                Криптографиялық модуль
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                AES-256-GCM, SHA-256 және RSA-2048 алгоритмдері браузерде Web Crypto API арқылы орындалады.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-900 px-4 py-2.5 font-semibold text-white">
                Басты бет
              </button>
              <button onClick={logout} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700">
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["aes", "AES-256", "Шифрлау / дешифрлау"],
            ["sha", "SHA-256", "Хэш генератор"],
            ["rsa", "RSA-2048", "Кілт жұбы және қысқа мәтін"],
          ].map(([id, title, subtitle]) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`rounded-[24px] border p-5 text-left transition ${
                activeTool === id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-white/70 bg-white/95 text-slate-800 hover:border-sky-200"
              }`}
            >
              <div className="text-lg font-black">{title}</div>
              <div className={`mt-1 text-sm ${activeTool === id ? "text-slate-200" : "text-slate-500"}`}>
                {subtitle}
              </div>
            </button>
          ))}
        </div>

        {activeTool === "aes" && (
          <div className="mt-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button onClick={() => switchAesMode("encrypt")} className={`rounded-2xl px-5 py-2.5 font-semibold ${aesMode === "encrypt" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
                Шифрлау
              </button>
              <button onClick={() => switchAesMode("decrypt")} className={`rounded-2xl px-5 py-2.5 font-semibold ${aesMode === "decrypt" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
                Дешифрлау
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                {aesMode === "encrypt" ? (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Шифрланатын мәтін</span>
                    <textarea value={aesPlaintext} onChange={(event) => setAesPlaintext(event.target.value)} placeholder="Мысалы: Құпия ақпарат..." className="mt-2 min-h-[150px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 outline-none focus:border-sky-300" />
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Шифрланған мәтін (Base64)</span>
                    <textarea value={aesCiphertext} onChange={(event) => setAesCiphertext(event.target.value)} placeholder="Base64 шифрланған мәтін..." className="mt-2 min-h-[150px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 font-mono text-sm outline-none focus:border-sky-300" />
                  </label>
                )}
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Шифрлау кілті (пароль)</span>
                  <input value={aesPassword} onChange={(event) => setAesPassword(event.target.value)} placeholder="Мысалы: MySecretKey123!" className="mt-2 w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 outline-none focus:border-sky-300" />
                </label>
                <button disabled={loading} onClick={aesMode === "encrypt" ? encryptAes : decryptAes} className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-70">
                  {aesMode === "encrypt" ? "Шифрлау" : "Дешифрлау"}
                </button>
              </div>

              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-black text-slate-900">Нәтиже</h2>
                  <button onClick={() => copyText(aesResult)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Көшіру
                  </button>
                </div>
                {aesMessage && <p className="mt-3 text-sm text-slate-600">{aesMessage}</p>}
                <pre className="mt-4 min-h-[220px] whitespace-pre-wrap break-all rounded-2xl bg-white p-4 text-sm text-slate-800">
                  {aesResult || "Нәтиже осы жерде шығады."}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTool === "sha" && (
          <div className="mt-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Хэштелетін мәтін</span>
              <textarea value={hashInput} onChange={(event) => setHashInput(event.target.value)} placeholder="Кез-келген мәтін енгізіңіз..." className="mt-2 min-h-[150px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 outline-none focus:border-sky-300" />
            </label>
            <button disabled={!hashInput.trim()} onClick={createHash} className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">
              SHA-256 хэш жасау
            </button>
            {hashResult && (
              <div className="mt-5 rounded-[24px] border border-sky-100 bg-sky-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-black text-slate-900">SHA-256 хэш</h2>
                  <button onClick={() => copyText(hashResult)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Көшіру
                  </button>
                </div>
                <pre className="mt-4 whitespace-pre-wrap break-all rounded-2xl bg-white p-4 font-mono text-sm text-slate-800">{hashResult}</pre>
              </div>
            )}
          </div>
        )}

        {activeTool === "rsa" && (
          <div className="mt-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-5 text-center">
                <div className="text-2xl">Public Key</div>
                <p className="mt-2 font-semibold text-slate-800">Жіберуші ашық кілтпен шифрлайды</p>
              </div>
              <div className="text-center text-2xl font-black text-sky-700">→</div>
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 text-center">
                <div className="text-2xl">Private Key</div>
                <p className="mt-2 font-semibold text-slate-800">Алушы жабық кілтпен ашады</p>
              </div>
            </div>

            <button disabled={loading} onClick={generateRsaKeys} className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-70">
              RSA-2048 кілт жұбын жасау
            </button>
            {rsaMessage && <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-slate-700">{rsaMessage}</div>}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Ашық кілт (Public Key)</span>
                <textarea value={rsaPublicKey} onChange={(event) => setRsaPublicKey(event.target.value)} placeholder="Public Key осы жерге шығады немесе енгізіледі..." className="mt-2 min-h-[260px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 font-mono text-xs outline-none focus:border-sky-300" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Жабық кілт (Private Key)</span>
                <textarea value={rsaPrivateKey} onChange={(event) => setRsaPrivateKey(event.target.value)} placeholder="Private Key құпия сақталады..." className="mt-2 min-h-[260px] w-full rounded-2xl border border-rose-100 bg-rose-50 p-4 font-mono text-xs outline-none focus:border-rose-300" />
              </label>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">RSA арқылы шифрланатын қысқа мәтін</span>
                  <textarea value={rsaPlaintext} onChange={(event) => setRsaPlaintext(event.target.value)} placeholder="Қысқа хабарлама енгізіңіз..." className="mt-2 min-h-[120px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 outline-none focus:border-sky-300" />
                </label>
                <button disabled={loading} onClick={encryptRsa} className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-70">
                  Public Key арқылы шифрлау
                </button>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">RSA ciphertext (Base64)</span>
                  <textarea value={rsaCiphertext} onChange={(event) => setRsaCiphertext(event.target.value)} placeholder="RSA ciphertext..." className="mt-2 min-h-[120px] w-full rounded-2xl border border-sky-100 bg-sky-50 p-4 font-mono text-sm outline-none focus:border-sky-300" />
                </label>
                <button disabled={loading} onClick={decryptRsa} className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-70">
                  Private Key арқылы ашу
                </button>
              </div>
            </div>

            {rsaDecrypted && (
              <div className="mt-5 rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-black text-slate-900">Ашылған мәтін</h2>
                  <button onClick={() => copyText(rsaDecrypted)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Көшіру
                  </button>
                </div>
                <pre className="mt-4 whitespace-pre-wrap break-all rounded-2xl bg-white p-4 text-sm text-slate-800">{rsaDecrypted}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CryptoModule;
