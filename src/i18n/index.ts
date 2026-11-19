// ─────────────────────────────────────────────────────────────────────────────
// i18n bootstrap
//
// Uses `react-i18next` with lazily-loaded JSON catalogs (one file per locale in
// `./locales`). The selected language is persisted in the app config database
// (`appLanguage` key) with a `localStorage` mirror so the web preview and older
// builds keep working. Missing keys fall back to the base language and then to
// English, so a partial translation never shows a raw key.
// ─────────────────────────────────────────────────────────────────────────────

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  LOCALES,
  getFallbackChain,
  isRTL,
  resolveLocale,
} from "./config";

export * from "./config";

const CONFIG_KEY = "appLanguage";
const STORAGE_KEY = "blinkEyeLanguage";

const loadedLocales = new Set<string>();
let initPromise: Promise<string> | null = null;

type LocaleModule = { default: Record<string, unknown> };

async function importLocale(code: string): Promise<Record<string, unknown> | null> {
  try {
    const mod = (await import(`./locales/${code}.json`)) as LocaleModule;
    return mod.default ?? null;
  } catch (error) {
    console.warn(`[i18n] Could not load locale "${code}":`, error);
    return null;
  }
}

/** Load a locale plus its fallback chain into i18next (once per session). */
async function loadLocaleResources(code: string): Promise<void> {
  const chain = getFallbackChain(code);
  for (const locale of chain) {
    if (loadedLocales.has(locale)) continue;
    const resources = await importLocale(locale);
    if (resources) {
      i18n.addResourceBundle(locale, "translation", resources, true, true);
    }
    loadedLocales.add(locale);
  }
}

/** Keep `<html lang>` / `<html dir>` in sync for fonts, hyphenation and RTL. */
function applyDocumentAttributes(code: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = code;
  document.documentElement.dir = isRTL(code) ? "rtl" : "ltr";
}

async function readStoredLanguage(): Promise<string | null> {
  // 1. Persistent app config (authoritative when running inside Tauri).
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const value = await invoke<string | null>("get_config_string", {
      key: CONFIG_KEY,
    });
    if (typeof value === "string" && value.trim()) return value;
  } catch {
    // Not running inside Tauri (web preview / tests) — ignore.
  }

  // 2. localStorage mirror (web preview + backward-compatible cache).
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && value.trim()) return value;
  } catch {
    // Storage unavailable (private mode, sandboxed iframe) — ignore.
  }

  return null;
}

/** Persist the chosen language. Failures are non-fatal. */
export async function storeLanguage(code: string): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore
  }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    // Generic upsert path for appconfig.db (see docs/tauri-commands-api.md).
    await invoke("update_reminder_setting", { key: CONFIG_KEY, value: code });
  } catch {
    // Not running inside Tauri — localStorage already covers it.
  }
}

/**
 * Initialise i18n once. Safe to call from multiple places; concurrent callers
 * share the same promise.
 */
export function initI18n(): Promise<string> {
  if (!initPromise) {
    initPromise = (async () => {
      // Backward compatibility: no stored value (or an unsupported one) → English.
      const stored = await readStoredLanguage();
      const language = resolveLocale(stored);

      await loadLocaleResources(language);

      await i18n.use(initReactI18next).init({
        lng: language,
        fallbackLng: { default: [DEFAULT_LANGUAGE] },
        supportedLngs: LOCALES.map((locale) => locale.code),
        nonExplicitSupportedLngs: true,
        interpolation: { escapeValue: false },
        returnEmptyString: false,
        react: { useSuspense: false },
      });

      applyDocumentAttributes(language);
      return language;
    })();
  }
  return initPromise;
}

/** Switch language at runtime: loads catalogs, updates the UI and persists it. */
export async function changeLanguage(code: string): Promise<string> {
  const language = resolveLocale(code);
  await loadLocaleResources(language);
  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }
  applyDocumentAttributes(language);
  await storeLanguage(language);
  return language;
}

/** The currently active locale code (defaults to English before init). */
export function getCurrentLanguage(): string {
  return resolveLocale(i18n.language || DEFAULT_LANGUAGE);
}
