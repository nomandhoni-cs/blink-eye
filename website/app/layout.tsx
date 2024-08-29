import { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { SEO } from "@/configs/seo";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { MediaQueriesDebug } from "@/components/debug/media-queries";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import dynamic from 'next/dynamic';

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

const PolygonAnimation = dynamic(() => import('@/components/PolygonAnimation'), { ssr: true });

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.variable}>
        <meta
          name="google-site-verification"
          content="TkrpS4PY-sUn-Dg71tDXhnUYdDA5N3HkznJvJUYPbR0"
        />
        <Providers>
          <Header />
          <main className="relative flex flex-1 flex-col">
            <PolygonAnimation />
            <div className="relative z-10">
              {children}
            </div>
          </main>
          <Footer />
          <MediaQueriesDebug />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
