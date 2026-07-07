'use client';

import { useLocale } from './use-locale';
import { en } from '@/lib/i18n/en';
import { es } from '@/lib/i18n/es';
// import { fr } from '@/lib/i18n/fr';
// import { de } from '@/lib/i18n/de';
// import { pt } from '@/lib/i18n/pt';
// import { zh } from '@/lib/i18n/zh';
// import { ja } from '@/lib/i18n/ja';
// import { ko } from '@/lib/i18n/ko';
// import { ar } from '@/lib/i18n/ar';
// import { tl } from '@/lib/i18n/tl';
import type { Dictionary } from '@/lib/i18n/dictionary';

const dictionaries: Record<string, Dictionary> = {
  en,
  es,
  // fr,
  // de,
  // pt,
  // zh,
  // ja,
  // ko,
  // ar,
  // tl,
};

export function useI18n() {
  const { locale } = useLocale();
  const t = dictionaries[locale] ?? dictionaries['en'];
  return { t, locale };
}
