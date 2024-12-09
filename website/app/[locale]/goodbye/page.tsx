import Image from "next/image";
import cat from "@/public/images/cat-gif.gif";
import sadface from "@/public/images/sadface.png";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const generateMetadata = async (): Promise<Metadata> => {
  try {
    // Await getTranslations to fetch translations for the current locale
    const t = await getTranslations("goodbyePage");
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
      title: "Good Bye - Blink Eye",
      description: "Uninstall Page of the Blink Eye App",
    };
  }
};
const Page = () => {
  return (
    <div className="continer px-2 mx-auto flex flex-col justify-center items-center">
      <h1 className="text-center py-3 text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
        We're going to miss you.
      </h1>
      <Image src={cat} className="rounded-xl" alt="Cat" priority />
      <h1 className="text-center py-3 text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
        Take good care of your Eyes.{" "}
        <Image src={sadface} className="inline" alt="Sad Face Sticker" />
      </h1>
    </div>
  );
};

export default Page;
