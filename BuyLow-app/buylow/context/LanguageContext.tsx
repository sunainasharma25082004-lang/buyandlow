import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import storage from '../utils/storage';
import { translate, type TranslateFn } from '../i18n';
import { LANGUAGES, type Language } from '../i18n/types';

const STORAGE_KEY = 'app_language';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: TranslateFn;
  languages: typeof LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    storage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'hi' || stored === 'pa') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await storage.setItem(STORAGE_KEY, lang);
  };

  const t = useMemo<TranslateFn>(
    () => (key, params) => translate(language, key, params),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};