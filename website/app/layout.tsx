import { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SEO } from "@/configs/seo";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { MediaQueriesDebug } from "@/components/debug/media-queries";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import StarryBackground from "@/components/StarryBackground";
import App from "@/components/WaveAnimation";
import AnnouncementBar from "@/components/layout/announcement-bar";

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
    videos: "https://www.youtube.com/watch?v=wszHM7OWOqI",
    images: [
      {
        url: "https://utfs.io/f/93hqarYp4cDdUuQivio0OCdzPs3rx4G5yFeS2tqMgwjDuXAK",
        width: 1280,
        height: 720,
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
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="flex flex-1 flex-col">
            <div className="relative isolate">
              <div
                className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden"
                aria-hidden="true"
              >
                <App />
                <StarryBackground />

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
