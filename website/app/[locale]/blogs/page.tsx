import Blogs from "@/components/Blogs";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Blog index content is English-only; do not emit duplicate locale routes.
export function generateStaticParams() {
  return [{ locale: "en" }];
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
