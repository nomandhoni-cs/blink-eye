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
    const t = await getTranslations("privacyPage");
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
      title: "Privacy Policy - Blink Eye",
      description: "Learn about our privacy practices and policies.",
    };
  }
};

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Privacy</h2>
      <p className="text-lg mb-4">
        GPL v3 + Additional Commercial Use Restrictions
      </p>
      <p className="text-lg mb-4">
        Commercial License: For business purposes. Contact Noman Dhoni at{" "}
        <a href="mailto:alnoman.dhoni@gmail.com">alnoman.dhoni@gmail.com</a> for
        licensing options.
      </p>
      <h3 className="text-xl font-bold mb-2">Contact</h3>
      <p className="text-lg mb-4">
        For inquiries and support, please contact Noman Dhoni:
      </p>
      <ul className="list-disc ml-6">
        <li>
          Email:{" "}
          <a href="mailto:alnoman.dhoni@gmail.com">alnoman.dhoni@gmail.com</a>
        </li>
        <li>
          Twitter: <a href="https://twitter.com/nomandhoni">@nomandhoni</a>
        </li>
      </ul>
      <p className="text-lg mt-4">
        Contributing: Contributions are welcome! Feel free to open issues or
        submit pull requests.
      </p>
    </div>
  );
};

export default Privacy;
