import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import en from "../locales/en.json";
import ar from "../locales/ar.json";
import zhCN from "../locales/zh-CN.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";
import pt from "../locales/pt.json";
import ru from "../locales/ru.json";
import id from "../locales/id.json";
import de from "../locales/de.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import tr from "../locales/tr.json";
import it from "../locales/it.json";
import pl from "../locales/pl.json";
import nl from "../locales/nl.json";
import bn from "../locales/bn.json";
import ur from "../locales/ur.json";
import vi from "../locales/vi.json";
import th from "../locales/th.json";

import {
  getLanguageDirection,
  languageRegistry,
  defaultLanguage,
} from "../global/languages";
import { normalizeLanguageCode } from "../global/languages/LanguageUtils";

// ===============================
// Translation Files (all 20 supported languages)
// ===============================

const translations = {
  en,
  ar,
  "zh-CN": zhCN,
  es,
  fr,
  hi,
  pt,
  ru,
  id,
  de,
  ja,
  ko,
  tr,
  it,
  pl,
  nl,
  bn,
  ur,
  vi,
  th,
} as const;

// ===============================
// Language Type
// ===============================

export type Language = keyof typeof translations;

// ===============================
// Context Interface
// ===============================

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /**
   * Translation lookup by dot-notated key, e.g. t('toast.profileUpdated').
   * Supports simple {{variable}} interpolation via the optional params object,
   * e.g. t('toast.listingPublished', { title: listing.title }).
   */
  t: (key: string, params?: Record<string, string | number>) => string;
  direction: "ltr" | "rtl";
  availableLanguages: ReturnType<typeof languageRegistry.getAll>;
}

// ===============================
// Create Context
// ===============================

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// ===============================
// Provider
// ===============================

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    defaultLanguage as Language
  );

  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved) {
      const normalized = normalizeLanguageCode(saved) as Language;
      if (languageRegistry.exists(normalized)) {
        setLanguageState(normalized);
      }
    }
  }, []);

  // Apply direction / lang attribute whenever language changes
  useEffect(() => {
    const dir = getLanguageDirection(language);
    setDirection(dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  function setLanguage(lang: Language) {
    const normalized = normalizeLanguageCode(lang) as Language;
    if (languageRegistry.exists(normalized)) {
      setLanguageState(normalized);
    }
  }

  function resolveKey(dict: any, key: string): any {
    let result: any = dict;
    for (const part of key.split(".")) {
      result = result?.[part];
    }
    return result;
  }

  function interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_match, name) =>
      params[name] !== undefined ? String(params[name]) : `{{${name}}}`
    );
  }

  function t(key: string, params?: Record<string, string | number>): string {
    let result = resolveKey((translations as any)[language], key);

    // Fallback to English if missing in the active language
    if (result === undefined || result === null) {
      result = resolveKey(translations.en, key);
    }

    // Fallback to the raw key if still missing (helps spot untranslated strings)
    if (result === undefined || result === null) {
      return key;
    }

    return interpolate(String(result), params);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        direction,
        availableLanguages: languageRegistry.getAll(),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ===============================
// Hook
// ===============================

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
