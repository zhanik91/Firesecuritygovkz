import React, { useState, useEffect, ReactNode } from 'react';
import { LanguageContext, type Language, type LanguageContextType } from '../hooks/useLanguage';
import ruTranslations from '../locales/ru.json';
import kzTranslations from '../locales/kz.json';

const translations = {
  ru: ruTranslations,
  kz: kzTranslations
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'ru';
    }
    return 'ru';
  });

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return defaultValue || key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage: (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    },
    t,
    translations: translations[language]
  };

  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Устанавливаем lang атрибут для HTML
    document.documentElement.lang = language === 'kz' ? 'kk' : 'ru';
  }, [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}