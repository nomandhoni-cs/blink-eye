import { getDownloadLinks } from "@/utils/getReleaseData";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { SEO } from "@/configs/seo";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGithubStats } from "@/utils/fetch-github-release";
import DownloadButton from "@/components/ui/DownloadButton";

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
    const t = await getTranslations({ locale, namespace: "downloadPage" });
    const appInfo = await getTranslations({ locale, namespace: "Metadata" });

    return {
      title: t("title") + " | " + appInfo("appName"),
      description: t("description"),
      applicationName: appInfo("appName"),
      openGraph: {
        title: t("title") + " | " + appInfo("appName"),
        description: t("description"),
        url: "https://blinkeye.app/en/download",
        type: "website",
        images: [
          {
            url: "https://utfs.io/f/93hqarYp4cDdoi04u4derHR0E5Och9U3PASy1oYVvwiMlx6D",
            width: 1280,
            height: 720,
            alt: t("title") + " | " + appInfo("appName"),
          },
        ],
        siteName: appInfo("appName"),
      },
      twitter: {
        site: SEO.twitter,
      },
    };
  } catch (e) {
    return {
      title: "Download",
      description:
        "Download Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
      applicationName: SEO.title,
      keywords: SEO.keywords,
      openGraph: {
        title: "Download",
        description:
          "Download Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
        url: "https://blinkeye.app/en/download",
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

const DownloadPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  let downloadLinks: { [key: string]: string | null } = {
    windowsSetup: null,
    windowsMSI: null,
    macIntel: null,
    macSilicon: null,
    linuxAppImage: null,
    linuxDeb: null,
    linuxTar: null,
    linuxRPM: null,
  };

  // Fetch the unified Github Stats object
  const githubStats = await fetchGithubStats();

  // FIX: Access the assets from `latestRelease` safely
  if (githubStats && githubStats.latestRelease?.assets) {
    downloadLinks = getDownloadLinks(githubStats.latestRelease.assets);
  } else {
    console.warn("Release data not available, showing page without download links");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="relative h-full py-8">
        <div className="relative z-10 flex flex-col justify-center items-center w-full space-y-12">

          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-center">
            Download Now
          </h2>

          <div className="w-full flex flex-col gap-8">
            {/* Windows Download Options */}
            <div className="p-6 md:p-10 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 bg-foreground/5 w-full">
              <h3 className="font-bold text-2xl text-center mb-6">
                Windows
              </h3>
              {/* FIX: Used CSS Grid to make buttons strictly responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {downloadLinks.windowsSetup && (
                  <DownloadButton
                    href={downloadLinks.windowsSetup}
                    label="Download (EXE)"
                    icon={<WindowsIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
                {downloadLinks.windowsMSI && (
                  <DownloadButton
                    href={downloadLinks.windowsMSI}
                    label="Download (MSI)"
                    icon={<WindowsIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
              </div>
            </div>

            {/* MacOS Download Options */}
            <div className="p-6 md:p-10 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 bg-foreground/5 w-full">
              <h3 className="font-bold text-2xl text-center mb-6">
                MacOS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {downloadLinks.macSilicon && (
                  <DownloadButton
                    href={downloadLinks.macSilicon}
                    label="Apple Silicon"
                    icon={<MacIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
                {downloadLinks.macIntel && (
                  <DownloadButton
                    href={downloadLinks.macIntel}
                    label="Intel Chip"
                    icon={<MacIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
              </div>
            </div>

            {/* Linux Download Options */}
            <div className="p-6 md:p-10 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 bg-foreground/5 w-full">
              <h3 className="font-bold text-2xl text-center mb-6">
                Linux
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                {downloadLinks.linuxDeb && (
                  <DownloadButton
                    href={downloadLinks.linuxDeb}
                    label="Debian (.deb)"
                    icon={<LinuxIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
                {downloadLinks.linuxAppImage && (
                  <DownloadButton
                    href={downloadLinks.linuxAppImage}
                    label="AppImage"
                    icon={<LinuxIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
                {downloadLinks.linuxRPM && (
                  <DownloadButton
                    href={downloadLinks.linuxRPM}
                    label="RPM"
                    icon={<LinuxIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
                {downloadLinks.linuxTar && (
                  <DownloadButton
                    href={downloadLinks.linuxTar}
                    label="Tar.gz"
                    icon={<LinuxIcon className="w-6 h-6 shrink-0" />}
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DownloadPage;