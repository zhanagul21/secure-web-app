import logo from "../assets/logo.png";
import { useLanguage } from "../i18n/LanguageContext";

const COPY = {
  kk: {
    eyebrow: "Қорғалған құжат платформасы",
    subtitle:
      "AuthGuard Locker файлдарды шифрлап сақтауға, қауіпсіз бөлісуге және әр әрекетті бақылауға көмектеседі.",
    description:
      "Құжаттарды бір жерге жинаңыз, тек рұқсаты бар пайдаланушыларға көрсетіңіз және уақытша сілтемелер арқылы қолжетімділікті басқарыңыз.",
    signIn: "Кіру",
    register: "Тіркелу",
    preview: "Жүйе көрінісі",
    documentName: "Қорғалған құжат",
    fileName: "verified-document.docx",
    secureStatus: "Қорғалған",
    recentAction: "Соңғы әрекет",
    auditText: "IP мекенжайы, браузер және уақыт журналға жазылды",
    workflowTitle: "Құжат жолы",
    workflowSubtitle: "Жүктеу, тексеру және бөлісу бір экраннан басқарылады.",
    whyTitle: "Неге ыңғайлы?",
    footerTitle: "Жүйеге кіріп, құжаттарыңызды қорғауды бастаңыз",
    footerText:
      "Аккаунт ашқаннан кейін жеке құжаттар, журнал, 2FA және ортақ сілтемелер қолжетімді болады.",
    stats: [
      { value: "AES-256", label: "Файл шифрлауы" },
      { value: "2FA", label: "Қосымша кіру қорғанысы" },
      { value: "Log", label: "Әр әрекет тіркеледі" },
    ],
    steps: [
      "Құжат жүктелді",
      "Шифрлау тексерілді",
      "Уақытша сілтеме дайын",
      "Қолжетімділік журналға түсті",
    ],
    features: [
      {
        label: "Жеке сақтау",
        text: "Әр пайдаланушы тек өз құжаттарын көреді, артық файлдар көрсетілмейді.",
        value: "Private",
      },
      {
        label: "Қауіпсіз бөлісу",
        text: "Сілтеме уақытпен шектеледі, қажет кезде автоматты түрде жабылады.",
        value: "Share",
      },
      {
        label: "Бақылау журналы",
        text: "Кіру, қарау, жүктеу және өшіру әрекеттері тарихта сақталады.",
        value: "Audit",
      },
    ],
    quickList: ["PDF, DOCX, PPTX", "Жеке кабинет", "Әкімші панелі"],
  },
  ru: {
    eyebrow: "Платформа защищенных документов",
    subtitle:
      "AuthGuard Locker помогает шифровать файлы, безопасно делиться доступом и отслеживать каждое действие.",
    description:
      "Храните документы в одном месте, показывайте их только пользователям с доступом и управляйте временными ссылками.",
    signIn: "Войти",
    register: "Регистрация",
    preview: "Вид системы",
    documentName: "Защищенный документ",
    fileName: "verified-document.docx",
    secureStatus: "Защищено",
    recentAction: "Последнее действие",
    auditText: "IP-адрес, браузер и время записаны в журнал",
    workflowTitle: "Путь документа",
    workflowSubtitle: "Загрузка, проверка и обмен управляются с одного экрана.",
    whyTitle: "Почему удобно?",
    footerTitle: "Войдите и начните защищать документы",
    footerText:
      "После входа доступны личные документы, журнал, 2FA и общие ссылки.",
    stats: [
      { value: "AES-256", label: "Шифрование файлов" },
      { value: "2FA", label: "Дополнительная защита входа" },
      { value: "Log", label: "Каждое действие фиксируется" },
    ],
    steps: [
      "Документ загружен",
      "Шифрование проверено",
      "Временная ссылка готова",
      "Доступ записан в журнал",
    ],
    features: [
      {
        label: "Личное хранение",
        text: "Каждый пользователь видит только свои документы, лишние файлы не отображаются.",
        value: "Private",
      },
      {
        label: "Безопасный обмен",
        text: "Ссылка ограничена по времени и закрывается автоматически.",
        value: "Share",
      },
      {
        label: "Журнал контроля",
        text: "Вход, просмотр, загрузка и удаление сохраняются в истории.",
        value: "Audit",
      },
    ],
    quickList: ["PDF, DOCX, PPTX", "Личный кабинет", "Панель администратора"],
  },
  en: {
    eyebrow: "Secure document platform",
    subtitle:
      "AuthGuard Locker helps encrypt files, share access safely, and track every important action.",
    description:
      "Keep documents in one place, show them only to approved users, and manage access through temporary links.",
    signIn: "Sign in",
    register: "Register",
    preview: "System preview",
    documentName: "Protected document",
    fileName: "verified-document.docx",
    secureStatus: "Protected",
    recentAction: "Recent activity",
    auditText: "IP address, browser, and time were saved to the log",
    workflowTitle: "Document path",
    workflowSubtitle: "Upload, verification, and sharing are managed from one screen.",
    whyTitle: "Why it helps",
    footerTitle: "Sign in and start protecting your documents",
    footerText:
      "After signing in, you can use private documents, logs, 2FA, and shared links.",
    stats: [
      { value: "AES-256", label: "File encryption" },
      { value: "2FA", label: "Extra sign-in protection" },
      { value: "Log", label: "Every action is recorded" },
    ],
    steps: [
      "Document uploaded",
      "Encryption verified",
      "Temporary link ready",
      "Access saved to audit log",
    ],
    features: [
      {
        label: "Private storage",
        text: "Each user sees only their own documents, without unrelated files.",
        value: "Private",
      },
      {
        label: "Safe sharing",
        text: "Links are time-limited and close automatically when access ends.",
        value: "Share",
      },
      {
        label: "Audit history",
        text: "Sign-ins, views, downloads, and deletes are saved in history.",
        value: "Audit",
      },
    ],
    quickList: ["PDF, DOCX, PPTX", "Personal dashboard", "Admin panel"],
  },
};

function Landing({ setPage }) {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.kk;

  return (
    <main
      data-i18n-ignore
      className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,#c7d2fe_0,#e0f2fe_26%,#f8fbff_52%,#ffffff_100%)] px-3 pb-20 pt-4 text-slate-900"
    >
      <section className="mx-auto max-w-[1120px] overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_22px_70px_rgba(15,23,42,0.14)]">
        <div className="h-1.5 bg-[linear-gradient(90deg,#0f172a,#0284c7,#10b981,#f59e0b,#f43f5e)]" />

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.86fr_1.14fr] lg:p-6 xl:p-7">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-sky-50 ring-1 ring-sky-200">
                <img
                  src={logo}
                  alt="AuthGuard Locker"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">
                  AuthGuard Locker
                </p>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {copy.eyebrow}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-2xl font-black leading-[1.14] text-slate-950 sm:text-3xl xl:text-[34px]">
              {copy.subtitle}
            </p>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
              {copy.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPage("login")}
                className="rounded-2xl bg-slate-950 px-7 py-2.5 font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {copy.signIn}
              </button>
              <button
                type="button"
                onClick={() => setPage("register")}
                className="rounded-2xl border border-sky-200 bg-sky-50 px-7 py-2.5 font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100"
              >
                {copy.register}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {copy.stats.map((item) => (
                <div
                  key={item.value}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                >
                  <p className="text-lg font-black text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.76fr]">
            <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-3 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                    {copy.preview}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">authguard.app</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="mt-4 rounded-[22px] bg-white p-3 text-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                      DOCX
                    </p>
                    <h2 className="mt-1.5 text-lg font-black">
                      {copy.documentName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {copy.fileName}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {copy.secureStatus}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {copy.steps.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black text-white ${
                          index === 0
                            ? "bg-sky-600"
                            : index === 1
                              ? "bg-emerald-600"
                              : index === 2
                                ? "bg-amber-500"
                                : "bg-rose-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 sm:text-sm">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-[20px] border border-white/10 bg-white/8 p-3">
                <p className="text-sm font-bold text-white">
                  {copy.recentAction}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {copy.auditText}
                </p>
              </div>
            </div>

            <aside className="grid auto-rows-min gap-3">
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
                  {copy.workflowTitle}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-emerald-950">
                  {copy.workflowSubtitle}
                </p>
              </div>
              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
                  Files
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {copy.quickList.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">
                  {copy.whyTitle}
                </p>
                <div className="mt-4 h-2 rounded-full bg-white">
                  <div className="h-full w-4/5 rounded-full bg-[linear-gradient(90deg,#0284c7,#10b981,#f59e0b)]" />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-600">
                  Security flow 80%
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="grid gap-3 border-y border-slate-100 bg-slate-50/80 p-6 sm:grid-cols-3 sm:p-8">
          {copy.features.map((item) => (
            <article
              key={item.label}
              className="rounded-[22px] border border-white bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-slate-900">
                  {item.label}
                </h3>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                  {item.value}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              {copy.footerTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {copy.footerText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPage("login")}
            className="w-full rounded-2xl bg-sky-600 px-6 py-3.5 font-bold text-white shadow-[0_14px_30px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-700 sm:w-auto"
          >
            {copy.signIn}
          </button>
        </div>
      </section>
    </main>
  );
}

export default Landing;
