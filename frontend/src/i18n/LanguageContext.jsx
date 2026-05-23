import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES } from "./translations";

const STORAGE_KEY = "authguard_language";
const LanguageContext = createContext(null);

const getInitialLanguage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return LANGUAGES.some((item) => item.code === stored) ? stored : "kk";
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (nextLanguage) => {
    if (!LANGUAGES.some((item) => item.code === nextLanguage)) return;
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      languages: LANGUAGES,
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
