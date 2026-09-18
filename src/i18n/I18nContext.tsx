import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { SupportedLanguage, LanguageInfo, TranslationDictionary } from "./types";
import { enTranslations } from "./translations/en";
import { afTranslations } from "./translations/af";
import { zuTranslations } from "./translations/zu";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    region: "South Africa & International",
  },
  {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
    flag: "🇿🇦",
    region: "Suid-Afrika",
  },
  {
    code: "zu",
    name: "Zulu",
    nativeName: "isiZulu",
    flag: "🇿🇦",
    region: "iNingizimu Afrika",
  },
];

const TRANSLATION_MAP: Record<SupportedLanguage, TranslationDictionary> = {
  en: enTranslations,
  af: afTranslations,
  zu: zuTranslations,
};

const STORAGE_KEY = "activity_medical_language_preference";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  formatDate: (dateString: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "af" || saved === "zu") {
        return saved;
      }
    } catch {
      // ignore storage failure in sandboxed frames
    }
    return "en";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage failure
    }
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return TRANSLATION_MAP[language] || TRANSLATION_MAP.en;
  }, [language]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const locale = language === "af" ? "af-ZA" : language === "zu" ? "zu-ZA" : "en-ZA";
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo,
      formatDate,
    }),
    [language, t, currentLanguageInfo]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
