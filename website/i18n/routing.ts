import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Used when no locale matches
  defaultLocale: "en",
  // A list of all locales that are supported
  locales: [
    "en", // English
    "zh", // Chinese (Mandarin)
    "hi", // Hindi
    "es", // Spanish
    "ar", // Arabic
    "bn", // Bengali
    "pt", // Portuguese
    "ru", // Russian
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
  ],
  pathnames: {
    "/": "/",
    "/pathnames": {
      en: "/pathnames",
      zh: "/pathnames",
      hi: "/pathnames",
      es: "/pathnames",
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
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
