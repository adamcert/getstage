"use client";

import { useLocaleStore } from "@/stores/locale-store";
import { translations, type Locale, type TranslationKey } from "@/lib/i18n";

/**
 * Hook to get translated strings for a specific section.
 *
 * @example
 * const { t, locale } = useTranslation("header");
 * t("home") // → "Accueil" or "Home"
 */
export function useTranslation<K extends TranslationKey>(section: K) {
  const locale = useLocaleStore((s) => s.locale);
  const sectionData = translations[section];

  const t = (key: keyof typeof sectionData): string => {
    const entry = sectionData[key] as Record<Locale, string>;
    return entry?.[locale] ?? String(key);
  };

  return { t, locale };
}

/**
 * Hook to get the current locale and toggle function.
 */
export function useLocale() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);
  return { locale, setLocale, toggleLocale };
}
