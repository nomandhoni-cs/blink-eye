import { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SEO } from "@/configs/seo";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { MediaQueriesDebug } from "@/components/debug/media-queries";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

type RootLayoutProps = {
  children: React.ReactNode;
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF" },
    { media: "(prefers-color-scheme: dark)", color: "000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SEO.url),
  title: { absolute: SEO.title, template: `%s -  ${SEO.title}` },
  applicationName: SEO.title,
  description: SEO.description,
  keywords: SEO.keywords,
  openGraph: {
    locale: "en",
    title: SEO.title,
    description: SEO.description,
    url: SEO.url,
    type: "website",
    images: [
      {
        url: "https://repository-images.githubusercontent.com/749625079/db502010-82d3-4004-8e01-283d20915ee0",
        width: 1200,
        height: 630,
        alt: SEO.description,
      },
    ],
    siteName: SEO.title,
  },
  twitter: {
    site: SEO.twitter,
  },
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.variable}>
        <meta
          name="google-site-verification"
          content="TkrpS4PY-sUn-Dg71tDXhnUYdDA5N3HkznJvJUYPbR0"
        />
        <Analytics />
        <Providers>
          <Header />
          <main className="flex flex-1 flex-col">
            <div className="relative isolate">
              <div
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                aria-hidden="true"
              >
                <div
                  className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#FE4C55] to-[#FEF4E2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                />
              </div>
              {children}
            </div>
          </main>
          <Footer />
          <MediaQueriesDebug />
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-5T49JELLG8" />
    </html>
  );
};

export default RootLayout;
