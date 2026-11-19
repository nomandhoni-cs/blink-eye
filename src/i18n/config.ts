// ─────────────────────────────────────────────────────────────────────────────
// Locale configuration
//
// The list mirrors the locales supported by the Blink Eye website
// (`website/i18n/routing.ts`) so the app and the website stay in sync.
// Add a new locale here, drop a matching JSON file in `src/i18n/locales/`,
// and it becomes available in the onboarding picker and in Settings.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_LANGUAGE = "en";

export interface LocaleInfo {
  /** Locale code used in URLs, config storage and JSON file names. */
  code: string;
  /** Name of the language written in that language (shown in pickers). */
  nativeName: string;
  /** English name of the language (used for accessibility / tooling). */
  englishName: string;
  /** Whether the language is written right-to-left. */
  rtl: boolean;
  /** Base language to fall back to when a key is missing (e.g. pt-BR → pt). */
  fallback?: string;
}

// Order matches the website's `locales` array.
export const LOCALES: LocaleInfo[] = [
  { code: "en", nativeName: "English", englishName: "English", rtl: false },
  { code: "zh", nativeName: "中文", englishName: "Chinese", rtl: false },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", rtl: false },
  { code: "es-ES", nativeName: "Español", englishName: "Spanish", rtl: false },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", rtl: true },
  { code: "pt", nativeName: "Português", englishName: "Portuguese", rtl: false },
  { code: "de", nativeName: "Deutsch", englishName: "German", rtl: false },
  { code: "ru", nativeName: "Русский", englishName: "Russian", rtl: false },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", rtl: false },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", rtl: false },
  { code: "fr", nativeName: "Français", englishName: "French", rtl: false },
  { code: "ur", nativeName: "اردو", englishName: "Urdu", rtl: true },
  { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian", rtl: false },
  { code: "ko", nativeName: "한국어", englishName: "Korean", rtl: false },
  { code: "it", nativeName: "Italiano", englishName: "Italian", rtl: false },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish", rtl: false },
  { code: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese", rtl: false },
  { code: "th", nativeName: "ไทย", englishName: "Thai", rtl: false },
  { code: "fa", nativeName: "فارسی", englishName: "Persian", rtl: true },
  { code: "pl", nativeName: "Polski", englishName: "Polish", rtl: false },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch", rtl: false },
  { code: "af", nativeName: "Afrikaans", englishName: "Afrikaans", rtl: false },
  { code: "ca", nativeName: "Català", englishName: "Catalan", rtl: false },
  { code: "cs", nativeName: "Čeština", englishName: "Czech", rtl: false },
  { code: "da", nativeName: "Dansk", englishName: "Danish", rtl: false },
  { code: "el", nativeName: "Ελληνικά", englishName: "Greek", rtl: false },
  { code: "fi", nativeName: "Suomi", englishName: "Finnish", rtl: false },
  { code: "he", nativeName: "עברית", englishName: "Hebrew", rtl: true },
  { code: "hu", nativeName: "Magyar", englishName: "Hungarian", rtl: false },
  { code: "no", nativeName: "Norsk", englishName: "Norwegian", rtl: false },
  {
    code: "pt-BR",
    nativeName: "Português (Brasil)",
    englishName: "Portuguese (Brazil)",
    rtl: false,
    fallback: "pt",
  },
  {
    code: "pt-PT",
    nativeName: "Português (Portugal)",
    englishName: "Portuguese (Portugal)",
    rtl: false,
    fallback: "pt",
  },
  { code: "ro", nativeName: "Română", englishName: "Romanian", rtl: false },
  { code: "sr", nativeName: "Српски", englishName: "Serbian", rtl: false },
  { code: "sv-SE", nativeName: "Svenska", englishName: "Swedish", rtl: false },
  { code: "uk", nativeName: "Українська", englishName: "Ukrainian", rtl: false },
  {
    code: "zh-CN",
    nativeName: "简体中文",
    englishName: "Chinese (Simplified)",
    rtl: false,
    fallback: "zh",
  },
  {
    code: "zh-TW",
    nativeName: "繁體中文",
    englishName: "Chinese (Traditional)",
    rtl: false,
    fallback: "zh",
  },
];

const LOCALE_MAP = new Map(LOCALES.map((locale) => [locale.code, locale]));

export function isSupportedLocale(
  code: string | null | undefined,
): boolean {
  return !!code && LOCALE_MAP.has(code);
}

export function getLocaleInfo(code: string | null | undefined): LocaleInfo | undefined {
  return code ? LOCALE_MAP.get(code) : undefined;
}

export function isRTL(code: string | null | undefined): boolean {
  return getLocaleInfo(code)?.rtl ?? false;
}

/**
 * Map an arbitrary BCP-47 tag (from the OS, a stored value, or a URL) onto a
 * supported locale. `en-US` → `en`, `pt-BR` → `pt-BR`, `fr-FR` → `fr`.
 * Unknown values fall back to the default language (English).
 */
export function resolveLocale(code: string | null | undefined): string {
  if (!code) return DEFAULT_LANGUAGE;

  const normalized = code.trim();
  if (isSupportedLocale(normalized)) return normalized;

  // Case-insensitive match, e.g. `EN-us` or `Pt-br`.
  const lower = normalized.toLowerCase();
  const direct = LOCALES.find((locale) => locale.code.toLowerCase() === lower);
  if (direct) return direct.code;

  // Base-language match, e.g. `fr-FR` → `fr`, `zh-Hans` → `zh`.
  const base = lower.split(/[-_]/)[0];
  const byBase = LOCALES.find((locale) => locale.code.toLowerCase() === base);
  if (byBase) return byBase.code;

  return DEFAULT_LANGUAGE;
}

/** Full fallback chain for a locale: itself, its base language, then English. */
export function getFallbackChain(code: string): string[] {
  const chain = [code];
  let current = getLocaleInfo(code);
  let guard = 0;
  while (current?.fallback && guard < 5) {
    chain.push(current.fallback);
    current = getLocaleInfo(current.fallback);
    guard += 1;
  }
  if (!chain.includes(DEFAULT_LANGUAGE)) chain.push(DEFAULT_LANGUAGE);
  return chain;
}

/** Value used for `<html lang>` — keeps regional tags when we support them. */
export function htmlLang(code: string): string {
  return code;
}
