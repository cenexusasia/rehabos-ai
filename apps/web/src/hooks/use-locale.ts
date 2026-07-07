import { useEffect, useCallback, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

const LOCALE_KEY = 'rehabos-locale';

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem(LOCALE_KEY) as Locale) ?? 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, newLocale);
    }
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LOCALE_KEY && e.newValue) {
        setLocaleState(e.newValue as Locale);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { locale, setLocale, locales: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'tl'] as Locale[] };
}
