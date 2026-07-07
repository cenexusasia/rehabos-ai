export const locales = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'tl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
