'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lang, translations } from '@/lib/translations';

const STORAGE_KEY = 'citydoctor_lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Translate a key; falls back to English, then the raw key. */
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Hydrate the saved preference after mount (keeps SSR markup stable).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') setLangState(saved);
    } catch {
      /* private mode — ignore */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === 'bn' ? 'bn' : 'en';
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'en' ? 'bn' : 'en';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next === 'bn' ? 'bn' : 'en';
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe no-op fallback so components never crash outside the provider.
    return {
      lang: 'en',
      setLang: () => {},
      toggleLang: () => {},
      t: (key: string, fallback?: string) =>
        translations.en[key] ?? fallback ?? key,
    };
  }
  return ctx;
}
