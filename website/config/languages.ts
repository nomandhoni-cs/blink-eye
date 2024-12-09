export const languages = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français"
} as const;

export type LanguageCode = keyof typeof languages; 