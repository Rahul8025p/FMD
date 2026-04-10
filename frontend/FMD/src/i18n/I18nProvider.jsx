import { createContext, useContext, useMemo, useState } from "react";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";

const SUPPORTED = ["en", "hi", "te"];
const DICTIONARIES = { en, hi, te };

const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  supportedLanguages: SUPPORTED
});

function sanitizeLanguage(lang) {
  return SUPPORTED.includes(lang) ? lang : "en";
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(
    sanitizeLanguage(localStorage.getItem("language") || "en")
  );

  const setLanguage = (next) => {
    const safe = sanitizeLanguage(next);
    setLanguageState(safe);
    localStorage.setItem("language", safe);
  };

  const value = useMemo(() => {
    const dictionary = DICTIONARIES[language] || DICTIONARIES.en;
    const fallbackDictionary = DICTIONARIES.en;
    return {
      language,
      setLanguage,
      supportedLanguages: SUPPORTED,
      t: (key, fallback) =>
        dictionary[key] || fallbackDictionary[key] || fallback || key
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  return useContext(I18nContext);
}

