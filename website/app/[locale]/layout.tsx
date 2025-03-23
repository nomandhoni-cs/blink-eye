import { Header } from "@/components/layout/header";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Providers } from "../providers";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { SEO } from "@/configs/seo";
import { Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/utils/cn";
// import StarryBackground from "@/components/StarryBackground";
import { Footer } from "@/components/layout/footer";
import { MediaQueriesDebug } from "@/components/debug/media-queries";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";
import { Urbanist } from "next/font/google";
// import localFont from "next/font/local";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF" },
    { media: "(prefers-color-scheme: dark)", color: "000" },
  ],
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
// const fontHeading = localFont({
//   src: "../../assets/fonts/CalSans-SemiBold.woff2",
//   variable: "--font-heading",
// });
// use Urbanist for heading font
const fontHeading = Urbanist({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "700",
});
type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">) {
  const { locale } = await params; // Await params here
  const t = await getTranslations({ locale, namespace: "Metadata" });
  // Retrieve the raw value for keywords
  const rawKeywords = t.raw("keywords"); // Gets the raw data, which is expected to be an array
  const keywords = Array.isArray(rawKeywords)
    ? rawKeywords.join(", ")
    : rawKeywords;
  return {
    title: t("appName") + " - " + t("title"),
    metadataBase: new URL(SEO.url),
    applicationName: t("appName"),
    description: t("description"),
    keywords,
    manifest: `${SEO.url}/site.webmanifest`,
    openGraph: {
      locale: locale,
      title: t("appName") + " - " + t("title"),
      description: t("description"),
      url: SEO.url,
      type: "website",
      videos: "https://www.youtube.com/watch?v=wszHM7OWOqI",
      images: [
        {
          url: "https://utfs.io/f/93hqarYp4cDdUuQivio0OCdzPs3rx4G5yFeS2tqMgwjDuXAK",
          width: 1280,
          height: 720,
          alt: t("description"),
        },
      ],
      siteName: t("appName"),
    },
    twitter: {
      site: SEO.twitter,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params; // Await params here

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <meta
          name="google-site-verification"
          content="TkrpS4PY-sUn-Dg71tDXhnUYdDA5N3HkznJvJUYPbR0"
        />
        <NextIntlClientProvider messages={messages}>
          <GoogleTagManager gtmId="GTM-5C4XTNHM" />
          <Providers>
            <Header />
            <main className="flex flex-1 flex-col">
              {/* <div className="relative isolate"> */}
              {/* <StarryBackground /> */}
              {/* <div
                className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden"
                aria-hidden="true"
              >
                <AuroraBackground />
              </div> */}
              {children}
              {/* </div> */}
            </main>
            <Footer />
            <MediaQueriesDebug />
          </Providers>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-5T49JELLG8" />
    </html>
  );
}
