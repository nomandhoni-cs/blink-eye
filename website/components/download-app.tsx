import * as React from "react";
import { DownloadIcon } from "lucide-react";
import { CONFIG } from "@/configs/site";
import { Button } from "./ui/button";
import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { ReleaseData } from "@/utils/github-fetch-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
    {
      next: { revalidate: 3600 },
    }
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

  return (
    <div className="flex flex-col justify-center items-center space-y-4 space-x-0 bg-[#e24149] px-16 py-8 rounded-xl">
      <h3 className="text-4xl font-bold py-4">Download Now</h3>
      <div className="flex flex-col items-center space-y-4 md:space-y-6">
        {/* Platform Row */}
        <div className="flex space-x-4 justify-center">
          {/* Windows Button */}
          <Select>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Download for Windows" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Download for Windows</SelectLabel>
                {downloadLinks.windowsSetup && (
                  <SelectItem value={downloadLinks.windowsSetup}>
                    <Link
                      href={downloadLinks.windowsSetup}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (EXE)</span>
                    </Link>
                  </SelectItem>
                )}
                {downloadLinks.windowsMSI && (
                  <SelectItem value={downloadLinks.windowsMSI}>
                    <Link
                      href={downloadLinks.windowsMSI}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (MSI)</span>
                    </Link>
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Mac Button */}
          <Select>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Download for Mac" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Download for Mac</SelectLabel>{" "}
                {downloadLinks.macSilicon && (
                  <SelectItem value={downloadLinks.macSilicon}>
                    <Link
                      href={downloadLinks.macSilicon}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">
                        Download for (Apple Silicon)
                      </span>
                    </Link>
                  </SelectItem>
                )}
                {downloadLinks.macIntel && (
                  <SelectItem value={downloadLinks.macIntel}>
                    <Link
                      href={downloadLinks.macIntel}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download for (Intel Chip)</span>
                    </Link>
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Linux Button */}
          <Select>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Download for Linux" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Download for Linux</SelectLabel>
                {downloadLinks.linuxAppImage && (
                  <SelectItem value={downloadLinks.linuxAppImage}>
                    <Link
                      href={downloadLinks.linuxAppImage}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (AppImage)</span>
                    </Link>
                  </SelectItem>
                )}
                {downloadLinks.linuxDeb && (
                  <SelectItem value={downloadLinks.linuxDeb}>
                    <Link
                      href={downloadLinks.linuxDeb}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (Debian)</span>
                    </Link>
                  </SelectItem>
                )}
                {downloadLinks.linuxTar && (
                  <SelectItem value={downloadLinks.linuxTar}>
                    <Link
                      href={downloadLinks.linuxTar}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (x64 TAR)</span>
                    </Link>
                  </SelectItem>
                )}
                {downloadLinks.linuxRPM && (
                  <SelectItem value={downloadLinks.linuxRPM}>
                    <Link
                      href={downloadLinks.linuxRPM}
                      className="flex items-center space-x-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span className="text-sm">Download (RPM)</span>
                    </Link>
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <VersionTolatDownloads tag_name={tag_name} />
    </div>
  );
};

export default DownloadApp;
