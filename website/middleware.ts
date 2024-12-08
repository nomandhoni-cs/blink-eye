import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(af|ar|bn|ca|cs|da|de|el|en|es-ES|fa|fi|fr|he|hi|hu|id|it|ja|ko|nl|no|pl|pt|pt-BR|pt-PT|ro|ru|sr|sv-SE|th|tr|uk|ur|vi|zh|zh-CN|zh-TW)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // However, match all pathnames within `/users`, optionally with a locale prefix
    "/([\\w-]+)?/users/(.+)",
  ], // Match only internationalized pathnames
};
