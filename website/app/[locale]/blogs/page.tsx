import Blogs from "@/components/Blogs";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const generateMetadata = async (): Promise<Metadata> => {
  try {
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations("blogsPage");
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
      title: "Blogs - Blink Eye",
      description: "Read the latest news and updates from the Blink Eye team.",
      openGraph: {
        title: "Blogs - Blink Eye",
        description:
          "Read the latest news and updates from the Blink Eye team.",
        type: "website",
      },
    };
  }
};
const BlogsPage = () => {
  return <Blogs />;
};

export default BlogsPage;
