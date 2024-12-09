import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Used when no locale matches
  defaultLocale: "en",
  // A list of all locales that are supported
  locales: [
    "en", // English  [Done]
    "zh", // Chinese (Mandarin) [Done]
    "hi", // Hindi [Done]
    "es-ES", // Spanish [Done]
    "ar", // Arabic [Done]
    "bn", // Bengali
    "pt", // Portuguese [Done]
    "ru", // Russian [Done]
    "ja", // Japanese
    "de", // German
    "fr", // French
    "ur", // Urdu
    "id", // Indonesian
    "ko", // Korean
    "it", // Italian
    "tr", // Turkish
    "vi", // Vietnamese
    "th", // Thai
    "fa", // Persian
    "pl", // Polish
    "nl", // Dutch
    "af", // Afrikaans
    "ca", // Catalan
    "cs", // Czech
    "da", // Danish
    "el", // Greek
    "fi", // Finnish
    "he", // Hebrew
    "hu", // Hungarian
    "no", // Norwegian
    "pt-BR", // Portuguese (Brazil)
    "pt-PT", // Portuguese (Portugal)
    "ro", // Romanian
    "sr", // Serbian
    "sv-SE", // Swedish
    "uk", // Ukrainian
    "zh-CN", // Simplified Chinese
    "zh-TW", // Traditional Chinese
  ],
  pathnames: {
    "/": "/",
    "/pathnames": {
      en: "/pathnames",
      zh: "/pathnames",
      hi: "/pathnames",
      "es-ES": "/pathnames",
      ar: "/pathnames",
      bn: "/pathnames",
      pt: "/pathnames",
      ru: "/pathnames",
      ja: "/pathnames",
      de: "/pathnames",
      fr: "/pathnames",
      ur: "/pathnames",
      id: "/pathnames",
      ko: "/pathnames",
      it: "/pathnames",
      tr: "/pathnames",
      vi: "/pathnames",
      th: "/pathnames",
      fa: "/pathnames",
      pl: "/pathnames",
      nl: "/pathnames",
      af: "/pathnames",
      ca: "/pathnames",
      cs: "/pathnames",
      da: "/pathnames",
      el: "/pathnames",
      fi: "/pathnames",
      he: "/pathnames",
      hu: "/pathnames",
      no: "/pathnames",
      "pt-BR": "/pathnames",
      "pt-PT": "/pathnames",
      ro: "/pathnames",
      sr: "/pathnames",
      "sv-SE": "/pathnames",
      uk: "/pathnames",
      "zh-CN": "/pathnames",
      "zh-TW": "/pathnames",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
