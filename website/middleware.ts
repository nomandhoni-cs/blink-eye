import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const VERCEl_APP_DOMAIN = "blinkeye.vercel.app";
const PRIMARY_DOMAIN = "blinkeye.app";

const nextIntlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  if (hostname === VERCEl_APP_DOMAIN) {
    // Add noindex header
    const response = nextIntlMiddleware(req);
    response.headers.set("X-Robots-Tag", "noindex");

    // Add canonical link tag
    const canonicalURL = `https://${PRIMARY_DOMAIN}${url.pathname}`;
    const canonicalLinkTag = `<link rel="canonical" href="${canonicalURL}" />`;

    // Modify the response body to inject the canonical link tag
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    const originalResponseText = await response.text();
    const injectedResponseText = originalResponseText.replace(
      "</head>",
      `${canonicalLinkTag}</head>`
    );

    const injectedResponse = new NextResponse(
      textEncoder.encode(injectedResponseText),
      {
        status: response.status,
        headers: response.headers,
      }
    );

    injectedResponse.headers.set("content-type", "text/html; charset=utf-8");

    return injectedResponse;
  }

  return nextIntlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(af|ar|bn|ca|cs|da|de|el|en|es-ES|fa|fi|fr|he|hi|hu|id|it|ja|ko|nl|no|pl|pt|pt-BR|pt-PT|ro|ru|sr|sv-SE|th|tr|uk|ur|vi|zh|zh-CN|zh-TW)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // However, match all pathnames within `/users`, optionally with a locale prefix
    "/([\\w-]+)?/users/(.+)",
  ],
};
