import { FeatureGrid } from "@/components/features";
import FeatureShowcase from "@/components/FeaturesShowcase";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
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
    const t = await getTranslations("featuresPage");
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
      title: "Features - Blink Eye",
      description:
        "Discover the features that make our app stand out. From customizable reminders to multiple themes, we've got you covered.",
    };
  }
};
const Features = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureGrid />
      <FeatureShowcase />
    </div>
  );
};

export default Features;
