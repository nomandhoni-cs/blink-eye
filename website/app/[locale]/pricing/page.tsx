import PricingSection from "@/components/pricing-section";
import { SEO } from "@/configs/seo";
import { routing } from "@/i18n/routing";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const generateMetadata = async ({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> => {
  try {
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations("pricingPage");
    const appInfo = await getTranslations("Metadata");

    return {
      title: t("title") + " | " + appInfo("appName"),
      description: t("description"),
      openGraph: {
        title: t("title") + " | " + appInfo("appName"),
        description: t("description"),
        type: "website",
      },
    };
  } catch (e) {
    // Fallback metadata in case of errors
    return {
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
  }
};

const Pricing = () => {
  return (
    <>
      <PricingSection />
    </>
  );
};

export default Pricing;
