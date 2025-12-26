import { useState, useEffect, createContext, useContext } from 'react';
import ruTranslations from '../locales/ru.json';
import kzTranslations from '../locales/kz.json';

type Language = 'ru' | 'kz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  translations: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ru: ruTranslations,
  kz: kzTranslations
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback для использования вне контекста
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
          return defaultValue || key;
        }
      }
      
      return typeof value === 'string' ? value : key;
    };

    useEffect(() => {
      localStorage.setItem('language', language);
    }, [language]);

    return {
      language,
      setLanguage,
      t,
      translations: translations[language]
    };
  }
  return context;
}

export function createLanguageContext() {
  return LanguageContext;
}

export { LanguageContext, type Language, type LanguageContextType };