import logo from "../assets/logo.png";

function Landing({ setPage }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,#eff6ff_38%,#ffffff_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="w-full rounded-[36px] border border-white/80 bg-white/95 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.14)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 ring-1 ring-sky-200">
                <img src={logo} alt="AuthGuard Locker" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Қорғалған құжат айналым жүйесі
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Мұнда құжаттарыңызды сақтап, керек кезде қарап, жүктеп немесе уақытша сілтеме арқылы бөлісе аласыз.
                Әр қолданушы тек өз құжаттарын көреді.
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

            <div className="grid w-full max-w-md gap-4">
              {[
                ["Құжат сақтау", "Файлдарды өз аккаунтыңызда жинайсыз."],
                ["Бірнеше файл", "Бір папка атауымен бірнеше құжатты бірге сақтай аласыз."],
                ["Уақытша сілтеме", "Қажет болса құжатқа уақыт шектеуі бар сілтеме жасайсыз."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[24px] border border-sky-100 bg-sky-50 p-5">
                  <div className="font-bold text-slate-900">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
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
