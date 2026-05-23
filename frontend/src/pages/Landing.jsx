import logo from "../assets/logo.png";

function Landing({ setPage }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,#eff6ff_38%,#ffffff_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
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
                    <span className="text-sm font-bold text-slate-900">{title}</span>
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
