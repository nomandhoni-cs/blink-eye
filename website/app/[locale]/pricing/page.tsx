import PricingSection from "@/components/pricing-section";
import { SEO } from "@/configs/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "See which plan is right for you and start using.",
  applicationName: SEO.title,
  keywords: SEO.keywords,
  openGraph: {
    locale: "en",
    title: "Pricing",
    description:
      "See which plan is right for you and start using Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
    url: "https://blinkeye.vercel.app/download",
    type: "website",
    images: [
      {
        url: "https://utfs.io/f/93hqarYp4cDdoi04u4derHR0E5Och9U3PASy1oYVvwiMlx6D",
        width: 1280,
        height: 720,
        alt: SEO.description,
      },
    ],
    siteName: "Blink Eye",
  },
  twitter: {
    site: SEO.twitter,
  },
};
const Pricing = () => {
  return (
    <>
      <PricingSection />
    </>
  );
};

export default Pricing;
