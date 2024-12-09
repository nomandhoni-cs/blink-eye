import Contributors from "@/components/contributors";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const generateMetadata = async (): Promise<Metadata> => {
  try {
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations("contributePage");
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
      title: "Contribute - Blink Eye",
      description: "Contribute to the Blink Eye App development.",
    };
  }
};
const Contribute = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Contribute</h2>
      <p className="text-lg mb-4">
        Contributions are welcome! Feel free to open issues or submit pull
        requests.
      </p>
      <p className="text-lg">
        If you would like to contribute to Blink Eye, please follow these steps:
      </p>
      <ol className="list-decimal ml-6 mt-4">
        <li>Fork the repository on GitHub.</li>
        <li>Create a new branch for your feature or fix.</li>
        <li>Make your changes and commit them.</li>
        <li>Push your changes to your fork.</li>
        <li>Submit a pull request to the main repository.</li>
      </ol>
      <p className="text-lg mt-4">
        Thank you for your interest in contributing to Blink Eye!
      </p>
      <Contributors />
    </div>
  );
};

export default Contribute;
