import { useState, useEffect, useCallback } from 'react';
import { getTranslation, TranslationKey } from './translations';

export const LANGUAGE_CHANGE_EVENT = 'nexora_language_changed';

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'ks', 'lang-89', 'lang-90', 'lang-110']);

function applyDocumentLanguage(code: string) {
  if (typeof document !== 'undefined') {
    const cleanCode = (code || 'pt').trim();
    const baseCode = cleanCode.split('-')[0].toLowerCase();
    document.documentElement.lang = cleanCode;
    document.documentElement.dir = RTL_LANGUAGES.has(cleanCode) || RTL_LANGUAGES.has(baseCode) ? 'rtl' : 'ltr';
  }
}

export function useTranslation() {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem('nexora_lang') || 'pt';
    applyDocumentLanguage(saved);
    return saved;
  });

  useEffect(() => {
    const handleLangChange = (e: CustomEvent<string>) => {
      if (e.detail) {
        applyDocumentLanguage(e.detail);
        setCurrentLanguageState(e.detail);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT as any, handleLangChange as any);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT as any, handleLangChange as any);
    };
  }, []);

  const setLanguage = useCallback((code: string) => {
    const cleanCode = (code || 'pt').trim();
    localStorage.setItem('nexora_lang', cleanCode);
    applyDocumentLanguage(cleanCode);
    setCurrentLanguageState(cleanCode);
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: cleanCode }));
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const translated = getTranslation(currentLanguage, key);
      return translated || fallback || key;
    },
    [currentLanguage]
  );

  return {
    currentLanguage,
    setLanguage,
    t,
  };
}
