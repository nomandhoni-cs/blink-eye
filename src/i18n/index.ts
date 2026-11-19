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

/**
 * Fetch a locale plus its fallback chain. Callers decide how to register the
 * packs: `initI18n` hands them to `init()` directly, `changeLanguage` adds them
 * afterwards.
 *
 * Must NOT call `addResourceBundle` — i18next only attaches that method from
 * inside `init()`, so using it beforehand throws and leaves i18next
 * uninitialised (every `t()` then renders the raw key).
 */
async function fetchLocaleResources(
  code: string,
): Promise<Record<string, Record<string, unknown>>> {
  const packs: Record<string, Record<string, unknown>> = {};
  for (const locale of getFallbackChain(code)) {
    if (loadedLocales.has(locale)) continue;
    const resources = await importLocale(locale);
    if (resources) packs[locale] = resources;
    loadedLocales.add(locale);
  }
  return packs;
}

/** Register already-fetched catalogs on an initialised i18next instance. */
function registerLocaleResources(
  packs: Record<string, Record<string, unknown>>,
): void {
  for (const [locale, resources] of Object.entries(packs)) {
    i18n.addResourceBundle(locale, "translation", resources, true, true);
  }
}

/** Load a locale plus its fallback chain into i18next (once per session). */
async function loadLocaleResources(code: string): Promise<void> {
  registerLocaleResources(await fetchLocaleResources(code));
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
      let language = resolveLocale(await readStoredLanguage());

      // Fetch the catalogs first, then hand them to `init()`. Registering them
      // via `addResourceBundle` here would throw — i18next only exposes that
      // method once `init()` has run.
      const resources: Record<string, { translation: Record<string, unknown> }> =
        {};
      try {
        const packs = await fetchLocaleResources(language);
        for (const [locale, pack] of Object.entries(packs)) {
          resources[locale] = { translation: pack };
        }

        await i18n.use(initReactI18next).init({
          lng: language,
          resources,
          fallbackLng: { default: [DEFAULT_LANGUAGE] },
          supportedLngs: LOCALES.map((locale) => locale.code),
          nonExplicitSupportedLngs: true,
          interpolation: { escapeValue: false },
          returnEmptyString: false,
          react: { useSuspense: false },
        });
      } catch (error) {
        // Never leave the UI with an uninitialised i18next — that renders raw
        // keys. Fall back to a bare English instance.
        console.error(
          `[i18n] Failed to initialise "${language}"; falling back to English.`,
          error,
        );
        language = DEFAULT_LANGUAGE;
        if (!i18n.isInitialized) {
          await i18n.use(initReactI18next).init({
            lng: DEFAULT_LANGUAGE,
            fallbackLng: { default: [DEFAULT_LANGUAGE] },
            supportedLngs: LOCALES.map((locale) => locale.code),
            nonExplicitSupportedLngs: true,
            interpolation: { escapeValue: false },
            returnEmptyString: false,
            react: { useSuspense: false },
          });
        }
      }

      applyDocumentAttributes(language);
      return language;
    })();
  }
  return initPromise;
}

/** Switch language at runtime: loads catalogs, updates the UI and persists it. */
export async function changeLanguage(code: string): Promise<string> {
  // `addResourceBundle` needs an initialised instance, so make sure bootstrap
  // has happened even if a caller got here first.
  await initI18n();

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
