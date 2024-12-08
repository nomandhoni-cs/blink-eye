import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|de|fr|it|es|pt|nl|pl|tr|ar|ja|zh|ko|ru|hi|bn|he|ur|id|ms|th|vi|bg|cs|da|de|el|eo|es|eu|fi|fr|gl|hu|ia|id|is|it|ka|ko|la|lt|lv|mk|nb|nl|nn|no|oc|pl|pt|ro|ru|sk|sl|sq|sr|sv|tr|uk|vi)/:path*",
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/users`, optionally with a locale prefix
    '/([\\w-]+)?/users/(.+)'  
], // Match only internationalized pathnames
};
