import { useLanguage } from "../i18n/LanguageContext";

function LanguageSelector() {
  const { language, languages, setLanguage } = useLanguage();

  return (
    <div
      data-i18n-ignore
      className="fixed bottom-4 right-4 z-[9999] flex gap-1 rounded-2xl border border-sky-100 bg-white/95 p-1 text-xs font-semibold text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.16)] backdrop-blur"
      aria-label="Language selector"
    >
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLanguage(item.code)}
          className={`rounded-xl px-3 py-2 transition ${
            language === item.code
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-sky-50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;
