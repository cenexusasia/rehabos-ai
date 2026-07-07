'use client';

import { useLocale } from '@/hooks/use-locale';
import type { Locale } from '@/lib/i18n/config';

const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  tl: 'Tagalog',
};

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className = '' }: LocaleSwitcherProps) {
  const { locale, setLocale, locales } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className={`rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 ${className}`}
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
