import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

// AES-256 mini demo
async function miniEncrypt(text, key) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(key.padEnd(32, "0").slice(0, 32)), "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyMaterial, enc.encode(text));
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...result)).slice(0, 40) + "...";
}

// SHA-256 mini demo
async function miniHash(text) {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40) + "...";
}

function AESDemo() {
  const [input, setInput] = useState("Құпия құжат");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const r = await miniEncrypt(input, "authguard2026key");
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔒</span>
        <span className="font-black text-slate-900">AES-256-GCM шифрлау</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Файлдар серверде осы алгоритммен шифрланып сақталады</p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm outline-none"
        placeholder="Мәтін жазыңыз..."
      />
      <button
        onClick={run}
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-slate-800 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Шифрлануда..." : "Шифрлау →"}
      </button>
      {result && (
        <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-700 break-all">
          {result}
        </div>
      )}
    </div>
  );
}

function SHADemo() {
  const [input, setInput] = useState("password123");
  const [result, setResult] = useState("");

  useEffect(() => {
    miniHash(input).then(setResult);
  }, [input]);

  return (
    <div className="rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">#</span>
        <span className="font-black text-slate-900">SHA-256 хэш</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Парольдер дерекқорда хэш түрінде сақталады — кері аудару мүмкін емес</p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm outline-none"
        placeholder="Пароль енгізіңіз..."
      />
      {result && (
        <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 break-all">
          {result}
        </div>
      )}
    </div>
  );
}

function TwoFADemo() {
  const [code, setCode] = useState("------");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const generate = () => {
      const digits = Math.floor(100000 + Math.random() * 900000).toString();
      setCode(digits);
      setSeconds(30);
    };
    generate();
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { generate(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pct = (seconds / 30) * 100;

  return (
    <div className="rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🛡️</span>
        <span className="font-black text-slate-900">TOTP 2FA коды</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Google Authenticator сияқты 30 секунд сайын жаңаратын бір реттік код</p>
      <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3">
        <span className="font-mono text-2xl font-black tracking-[0.3em] text-slate-900">{code}</span>
        <div className="relative h-10 w-10">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={seconds <= 10 ? "#f43f5e" : "#0ea5e9"}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 15}`}
              strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">{seconds}</span>
        </div>
      </div>
    </div>
  );
}

function JWTDemo() {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: "user_42", role: "user", exp: Math.floor(Date.now() / 1000) + 900 })).replace(/=/g, "");
  const sig = "Xk9mP2rL...";

  return (
    <div className="rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎫</span>
        <span className="font-black text-slate-900">JWT токен</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Кірген соң 15 минуттық access token + 7 күндік refresh token беріледі</p>
      <div className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs break-all leading-5">
        <span className="text-rose-500">{header}</span>
        <span className="text-slate-400">.</span>
        <span className="text-amber-500">{payload}</span>
        <span className="text-slate-400">.</span>
        <span className="text-emerald-500">{sig}</span>
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-600 font-semibold">Header</span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-600 font-semibold">Payload</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 font-semibold">Signature</span>
      </div>
    </div>
  );
}

function Landing({ setPage }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,#eff6ff_38%,#ffffff_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Hero */}
        <div className="rounded-[36px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.14)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 ring-1 ring-sky-200">
                <img src={logo} alt="AuthGuard Locker" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Қорғалған құжат айналым жүйесі
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                AES-256, SHA-256, RSA, JWT және TOTP 2FA технологияларына негізделген заманауи қауіпсіздік жүйесі.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setPage("login")}
                  className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Кіру
                </button>
                <button
                  onClick={() => setPage("register")}
                  className="rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3 font-semibold text-sky-800 transition hover:bg-sky-100"
                >
                  Тіркелу
                </button>
              </div>
            </div>

            <div className="grid w-full max-w-sm gap-3">
              {[
                ["🔐", "AES-256-GCM", "Барлық файлдар серверде шифрланып сақталады"],
                ["🛡️", "TOTP 2FA", "Google Authenticator арқылы екі факторлы кіру"],
                ["🎫", "JWT токен", "15 мин access + 7 күн refresh токен жүйесі"],
                ["📋", "Audit Log", "Әрбір әрекет IP, браузермен бірге тіркеледі"],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-[20px] border border-sky-100 bg-sky-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="font-bold text-slate-900 text-sm">{title}</span>
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive demos */}
        <div>
          <h2 className="mb-4 text-center text-xl font-black text-slate-800">
            Тікелей жұмыс істейтін криптографиялық демо
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AESDemo />
            <SHADemo />
            <TwoFADemo />
            <JWTDemo />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
