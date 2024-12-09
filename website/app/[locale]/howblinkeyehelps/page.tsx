import HowBlinkEyeWillHelp from "@/components/how-blink-eye-will-help";
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
    const t = await getTranslations("howBlinkEyeHelpsPage");
    const appInfo = await getTranslations("Metadata");

    return {
      title: t("title") + " | " + appInfo("appName"),
      description: t("description"),
      openGraph: {
        locale: params.locale,
        title: t("title") + " | " + appInfo("appName"),
        description: t("description"),
        type: "website",
      },
    };
  } catch (e) {
    // Fallback metadata in case of errors
    return {
      title: "How Blink Eye Helps - Blink Eye",
      description: "Learn how Blink Eye helps you stay focused and productive.",
    };
  }
};
const HowBlinkEyeHelpsPage = () => {
  return (
    <>
      <HowBlinkEyeWillHelp />
    </>
  );
};

export default HowBlinkEyeHelpsPage;
