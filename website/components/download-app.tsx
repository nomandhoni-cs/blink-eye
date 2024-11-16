import * as React from "react";
// import { CONFIG } from "@/configs/site";

import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { fetchReleaseData } from "@/utils/fetch-github-release";
import { LinuxIcon, WindowsIcon, MacIcon } from "@/utils/mac-win-linicon";
import DownloadDropdown from "./DownloadDropdown";
import DownloadButton from "./ui/download-button";
import { getDownloadLinks } from "@/utils/getReleaseData";

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
    downloadLinks = getDownloadLinks(releaseData.assets);
  } catch (error) {
    console.error("Error fetching release data:", error);
  }

  return (
    <div className="relative max-w-6xl h-full py-8 rounded-xl">
      <div className="relative z-10 flex flex-col justify-center items-center space-y-4">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Download Now
        </h2>
        <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full px-4">
          {/* Platform Row */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {/* Windows Button */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.windowsSetup && (
                <DownloadButton
                  href={downloadLinks.windowsSetup}
                  label="Download for Windows"
                  icon={<WindowsIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.windowsSetup!,
                    label: "Download (EXE)",
                  },
                  {
                    href: downloadLinks.windowsMSI!,
                    label: "Download (MSI)",
                  },
                ]}
              />
            </div>
            {/* MacOS Download Options */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.macSilicon && (
                <DownloadButton
                  href={downloadLinks.macSilicon}
                  label="Download for MacOS"
                  icon={<MacIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.macSilicon!,
                    label: "Download (Apple Silicon)",
                  },
                  {
                    href: downloadLinks.macIntel!,
                    label: "Download (Intel Chip)",
                  },
                ]}
              />
            </div>
            {/* Linux Download Options */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.linuxDeb && (
                <DownloadButton
                  href={downloadLinks.linuxDeb}
                  label="Download for Linux"
                  icon={<LinuxIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.linuxAppImage!,
                    label: "Download (AppImage)",
                  },
                  { href: downloadLinks.linuxDeb!, label: "Download (Debian)" },
                  { href: downloadLinks.linuxTar!, label: "Download (Tar.gz)" },
                  { href: downloadLinks.linuxRPM!, label: "Download (RPM)" },
                ]}
              />
            </div>
          </div>
        </div>
        <span className="text-sm px-8">
          Supports macOS Intel/M Chip (ARM) | Windows 10, 11 (MSI, EXE) | Linux
          (Debian, AppImage, RPM, TAR)
        </span>
        <Link href="/changelog" className="text-base font-semibold">
          Release Notes
        </Link>
        <VersionTolatDownloads tag_name={tag_name} />
      </div>
    </div>
  );
};

export default DownloadApp;
