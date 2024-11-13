import { fetchReleaseData } from "@/utils/fetch-github-release";
import DownloadButton from "@/components/ui/download-button";
import { getDownloadLinks } from "@/utils/getReleaseData";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { Metadata } from "next";
import { SEO } from "@/configs/seo";
export const metadata: Metadata = {
  title: "Download",
  description:
    "Download Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
  applicationName: SEO.title,
  keywords: SEO.keywords,
  openGraph: {
    locale: "en",
    title: SEO.title,
    description: SEO.description,
    url: SEO.url,
    type: "website",
    images: [
      {
        url: "https://repository-images.githubusercontent.com/749625079/db502010-82d3-4004-8e01-283d20915ee0",
        width: 1200,
        height: 630,
        alt: SEO.description,
      },
    ],
    siteName: SEO.title,
  },
  twitter: {
    site: SEO.twitter,
  },
};
const DownloadPage = async () => {
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
  try {
    const releaseData = await fetchReleaseData();
    downloadLinks = getDownloadLinks(releaseData.assets);
  } catch (error) {
    console.error("Error fetching release data:", error);
    return <div>Error loading download links.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-full py-8 rounded-xl">
        <div className="relative z-10 flex flex-col justify-center items-center space-y-4">
          <h2 className="font-bold text-2xl leading-[1.1] sm:text-2xl md:text-4xl">
            Download Now
          </h2>

          {/* Windows Download Options */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-md">
            <h3 className="font-bold text-2xl leading-tight text-center sm:text-2xl md:text-4xl lg:text-4xl mb-4">
              Windows
            </h3>
            <div className="flex items-center h-16 py-4 pr-2 space-x-8 rounded-full">
              {downloadLinks.windowsSetup && (
                <DownloadButton
                  href={downloadLinks.windowsSetup}
                  label="Download for Windows (EXE)"
                  icon={<WindowsIcon />}
                />
              )}
              {downloadLinks.windowsMSI && (
                <DownloadButton
                  href={downloadLinks.windowsMSI}
                  label="Download for Windows (MSI)"
                  icon={<WindowsIcon />}
                />
              )}
            </div>
          </div>
          {/* MacOS  */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-md ">
            <h3 className="font-bold text-2xl leading-tight text-center sm:text-2xl md:text-4xl lg:text-4xl mb-4">
              MacOS
            </h3>
            <div className="flex items-center h-16 py-4 pr-2 space-x-8 rounded-full">
              {downloadLinks.macSilicon && (
                <DownloadButton
                  href={downloadLinks.macSilicon}
                  label="Download for MacOS (Apple Silicon)"
                  icon={<MacIcon />}
                />
              )}
              {downloadLinks.macIntel && (
                <DownloadButton
                  href={downloadLinks.macIntel}
                  label="Download for MacOS (Intel Chip)"
                  icon={<MacIcon />}
                />
              )}
            </div>
          </div>
          {/* Linux  */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-md">
            <h3 className="font-bold text-2xl leading-tight text-center sm:text-2xl md:text-4xl lg:text-4xl mb-4">
              Linux
            </h3>
            <div className="flex items-center h-16 py-4 pr-2 space-x-8 rounded-full">
              {downloadLinks.linuxDeb && (
                <DownloadButton
                  href={downloadLinks.linuxDeb}
                  label="Download for Linux (Debian)"
                  icon={<LinuxIcon />}
                />
              )}
              {downloadLinks.linuxAppImage && (
                <DownloadButton
                  href={downloadLinks.linuxAppImage}
                  label="Download for Linux (Appimage)"
                  icon={<LinuxIcon />}
                />
              )}
              {downloadLinks.linuxRPM && (
                <DownloadButton
                  href={downloadLinks.linuxRPM}
                  label="Download for Linux (RPM)"
                  icon={<LinuxIcon />}
                />
              )}
              {downloadLinks.linuxTar && (
                <DownloadButton
                  href={downloadLinks.linuxTar}
                  label="Download for Linux (Tar.gz)"
                  icon={<LinuxIcon />}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
