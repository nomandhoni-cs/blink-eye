import Blogs from "@/components/Blogs";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  try {
    const { locale } = await params;
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations({ locale, namespace: "blogsPage" });
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
const BlogsPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Blogs />;
};

export default BlogsPage;
