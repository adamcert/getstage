import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/translations";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "fr",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "fr" ? "en" : "fr" }),
    }),
    {
      name: "getstage-locale",
    }
  )
);
