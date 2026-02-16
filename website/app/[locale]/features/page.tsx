import { FeatureGrid } from "@/components/features";
import FeatureShowcase from "@/components/FeaturesShowcase";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  try {
    const { locale } = await params;
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations({ locale, namespace: "featuresPage" });
    const appInfo = await getTranslations({ locale, namespace: "Metadata" });

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
      title: "Features - Blink Eye",
      description:
        "Discover the features that make our app stand out. From customizable reminders to multiple themes, we've got you covered.",
    };
  }
};
const Features = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureGrid />
      <FeatureShowcase />
    </div>
  );
};

export default Features;
