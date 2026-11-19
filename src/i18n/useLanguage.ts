import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "./index";
import { LOCALES, isRTL, resolveLocale } from "./config";

/**
 * Small helper for language-aware UI: the active locale, the supported locale
 * list, an RTL flag and an async setter that persists the choice.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language = resolveLocale(i18n.language || getCurrentLanguage());

  return {
    language,
    locales: LOCALES,
    isRTL: isRTL(language),
    setLanguage: (code: string) => changeLanguage(code),
  };
}
