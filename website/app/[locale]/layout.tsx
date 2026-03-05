import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Providers } from "../providers";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { SEO } from "@/configs/seo";
import { Viewport } from "next";
import { Inter as FontSans, Urbanist } from "next/font/google";
import { cn } from "@/utils/cn";
import { MediaQueriesDebug } from "@/components/debug/media-queries";
import { ReactNode } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";

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

const fontHeading = Urbanist({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "700",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const rawKeywords = t.raw("keywords");
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
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {locale === "bn" && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap"
          />
        )}
        <meta
          name="google-site-verification"
          content="TkrpS4PY-sUn-Dg71tDXhnUYdDA5N3HkznJvJUYPbR0"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable,
          fontHeading.variable,
          locale === "bn" ? "font-bn" : undefined
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <GoogleTagManager gtmId="GTM-5C4XTNHM" />
          <Providers>
            <Header />
            <AnnouncementBar />
            {/* Main content area - grows to fill space, pushes footer down */}
            <main className="flex-1">
              {children}
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