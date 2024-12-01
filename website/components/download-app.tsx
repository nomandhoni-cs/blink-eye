// import { CONFIG } from "@/configs/site";

import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { fetchReleaseData } from "@/utils/fetch-github-release";
import { LinuxIcon, WindowsIcon, MacIcon } from "@/utils/mac-win-linicon";
import DownloadDropdown from "./DownloadDropdown";
import DownloadButton from "./ui/download-button";
import { getDownloadLinks } from "@/utils/getReleaseData";
import { CopyButton } from "./copy-button";

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
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading text-center mb-8">
          Download Free & Start Now
        </h2>
        <div className="space-y-4">
          <DownloadButtons downloadLinks={downloadLinks} />

          <div className="space-y-2 flex flex-col items-center">
            {/* For Homebrew section */}
            <h2 className="text-xl sm:text-3xl text-center font-heading">
              For Homebrew - MacOS
            </h2>

            <p className="text-sm text-muted-foreground text-center">
              If you're using Homebrew, you can install Blink Eye using the
              command below:
            </p>

            {/* Homebrew command block */}
            <pre className="flex items-center justify-between rounded-lg border-4 border-[#FE4C55] bg-[#FE4C55]/10 p-4 text-center max-w-xl">
              <code className="font-bold text-sm whitespace-nowrap">{`brew tap nomandhoni-cs/blinkeye && brew install --cask blinkeye`}</code>
              <CopyButton
                value={`brew tap nomandhoni-cs/blinkeye && brew install --cask blinkeye`}
              />
            </pre>
          </div>

          <SupportedPlatforms />
          <ReleaseInfo tag_name={tag_name} />
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;

const DownloadButtons = ({ downloadLinks }) => (
  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
    <DownloadOption
      name="Windows"
      icon={<WindowsIcon />}
      mainLink={downloadLinks.windowsSetup}
      dropdownLinks={[
        { href: downloadLinks.windowsSetup, label: "Download (EXE)" },
        { href: downloadLinks.windowsMSI, label: "Download (MSI)" },
      ]}
    />
    <DownloadOption
      name="MacOS"
      icon={<MacIcon />}
      mainLink={downloadLinks.macSilicon}
      dropdownLinks={[
        { href: downloadLinks.macSilicon, label: "Download (Apple Silicon)" },
        { href: downloadLinks.macIntel, label: "Download (Intel Chip)" },
      ]}
    />
    <DownloadOption
      name="Linux"
      icon={<LinuxIcon />}
      mainLink={downloadLinks.linuxDeb}
      dropdownLinks={[
        { href: downloadLinks.linuxAppImage, label: "Download (AppImage)" },
        { href: downloadLinks.linuxDeb, label: "Download (Debian)" },
        { href: downloadLinks.linuxTar, label: "Download (Tar.gz)" },
        { href: downloadLinks.linuxRPM, label: "Download (RPM)" },
      ]}
    />
  </div>
);

const DownloadOption = ({ name, icon, mainLink, dropdownLinks }) => (
  <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
    {mainLink && (
      <DownloadButton
        href={mainLink}
        label={`Download for ${name}`}
        icon={icon}
      />
    )}
    <DownloadDropdown links={dropdownLinks} />
  </div>
);

const SupportedPlatforms = () => (
  <p className="text-sm text-center">
    Supports macOS Intel/M Chip (ARM) | Windows 10, 11 (MSI, EXE) | Linux
    (Debian, AppImage, RPM, TAR)
  </p>
);

const ReleaseInfo = ({ tag_name }) => (
  <div className="text-center space-x-1 md:space-y-2 flex flex-col items-center">
    <Link href="/changelog" className="text-base font-semibold">
      Release Notes
    </Link>
    <VersionTolatDownloads tag_name={tag_name} />
  </div>
);
