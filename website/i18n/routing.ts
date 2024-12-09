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
    "pt", // Portuguese [Done]
    "de", // German [Done] - Gemini Experimental
    "ru", // Russian [Done]
    "ja", // Japanese [Done] - Gemini Experimental
    "bn", // Bengali [Done] - Gemini Experimental
    "fr", // French [Done] - Gemini Experimental
    "ur", // Urdu [Done] - Gemini Experimental
    "id", // Indonesian [Done] - Gemini Experimental
    "ko", // Korean [Done] - Gemini Experimental
    "it", // Italian [Done] - Gemini Experimental
    "tr", // Turkish [Done] - Gemini Experimental
    "vi", // Vietnamese [Done] - Gemini Experimental
    "th", // Thai [Done] - Gemini Experimental
    "fa", // Persian [Done] - Gemini Experimental
    "pl", // Polish [Done] - Gemini Experimental
    "nl", // Dutch [Done] - Gemini Experimental
    "af", // Afrikaans [Done] - Gemini Experimental
    "ca", // Catalan  [Done] - Gemini Experimental
    "cs", // Czech [Done] - Gemini Experimental
    "da", // Danish [Done] - Gemini Experimental
    "el", // Greek [Done] - Gemini Experimental
    "fi", // Finnish [Done] - Gemini Experimental
    "he", // Hebrew [Done] - Gemini Experimental
    "hu", // Hungarian [Done] - Gemini Experimental
    "no", // Norwegian [Done] - Gemini Experimental
    "pt-BR", // Portuguese (Brazil) [Done] - Gemini Experimental
    "pt-PT", // Portuguese (Portugal) [Done] - Gemini Experimental
    "ro", // Romanian [Done] - Gemini Experimental
    "sr", // Serbian [Done] - Gemini Experimental
    "sv-SE", // Swedish  [Done] - Gemini Experimental
    "uk", // Ukrainian [Done] - Gemini Experimental
    "zh-CN", // Simplified Chinese [Done] - Gemini Experimental
    "zh-TW", // Traditional Chinese [Done] - Gemini Experimental
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
