import logo from "../assets/logo.png";

function Landing({ setPage }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,#eff6ff_38%,#ffffff_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[36px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.14)] sm:p-10">
          <div className="max-w-xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 ring-1 ring-sky-200">
              <img src={logo} alt="AuthGuard Locker" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">AuthGuard Locker</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Қорғалған құжат айналым жүйесі
            </h1>
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
        </div>
      </div>
    </div>
  );
}

export default Landing;
