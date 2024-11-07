import { DownloadIcon } from "lucide-react";
import { CONFIG } from "@/configs/site";
import { Button } from "./ui/button";
import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { ReleaseData } from "@/utils/github-fetch-types";

const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};

const DownloadApp = async () => {
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
  let tag_name: string | null = null;

  try {
    const releaseData = await fetchReleaseData();
    tag_name = releaseData.tag_name;

    const { assets } = releaseData;
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        if (asset.name.endsWith(".exe") && asset.name.includes("x64-setup")) {
          downloadLinks.windowsSetup = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".msi") &&
          asset.name.includes("x64_en-US")
        ) {
          downloadLinks.windowsMSI = asset.browser_download_url;
        } else if (asset.name.endsWith(".dmg") && asset.name.includes("x64")) {
          downloadLinks.macIntel = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".dmg") &&
          asset.name.includes("aarch64")
        ) {
          downloadLinks.macSilicon = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".AppImage") &&
          asset.name.includes("amd64")
        ) {
          downloadLinks.linuxAppImage = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".deb") &&
          asset.name.includes("amd64")
        ) {
          downloadLinks.linuxDeb = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".tar.gz") &&
          asset.name.includes("x64")
        ) {
          downloadLinks.linuxTar = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".rpm") &&
          asset.name.includes("x86_64")
        ) {
          downloadLinks.linuxRPM = asset.browser_download_url;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching release data:", error);
  }

  if (!downloadLink) {
    downloadLink = `${CONFIG.repository}/releases`;
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-4 space-x-0">
      <div className="flex flex-col space-y-4 md:space-y-0">
        {/* Windows Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-5 rounded-md">
          {downloadLinks.windowsSetup && (
            <Button asChild>
              <Link
                href={downloadLinks.windowsSetup}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Windows (Setup)</span>
              </Link>
            </Button>
          )}
          {downloadLinks.windowsMSI && (
            <Button asChild>
              <Link
                href={downloadLinks.windowsMSI}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Windows (MSI)</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mac Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-5 rounded-md">
          {downloadLinks.macIntel && (
            <Button asChild>
              <Link
                href={downloadLinks.macIntel}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Mac Intel</span>
              </Link>
            </Button>
          )}
          {downloadLinks.macSilicon && (
            <Button asChild>
              <Link
                href={downloadLinks.macSilicon}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Mac Apple Silicon</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Linux Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-5 rounded-md">
          {downloadLinks.linuxAppImage && (
            <Button asChild>
              <Link
                href={downloadLinks.linuxAppImage}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Linux (AppImage)</span>
              </Link>
            </Button>
          )}
          {downloadLinks.linuxDeb && (
            <Button asChild>
              <Link
                href={downloadLinks.linuxDeb}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Linux (Debian)</span>
              </Link>
            </Button>
          )}
          {downloadLinks.linuxTar && (
            <Button asChild>
              <Link
                href={downloadLinks.linuxTar}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Linux (x64 TAR)</span>
              </Link>
            </Button>
          )}
          {downloadLinks.linuxRPM && (
            <Button asChild>
              <Link
                href={downloadLinks.linuxRPM}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="text-sm">Download for Linux (RPM)</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <VersionTolatDownloads tag_name={tag_name} />
    </div>
  );
};

export default DownloadApp;
