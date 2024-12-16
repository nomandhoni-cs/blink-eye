// import { CONFIG } from "@/configs/site";
// import { CopyButton } from "./copy-button";

import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { fetchReleaseData } from "@/utils/fetch-github-release";
import { LinuxIcon, WindowsIcon, MacIcon } from "@/utils/mac-win-linicon";
import DownloadDropdown from "./DownloadDropdown";
import DownloadButton from "./ui/download-button";
import { getDownloadLinks } from "@/utils/getReleaseData";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Command from "./Command";
import { useTranslations } from "next-intl";

import Image from "next/image";
import {
  EmptyButtonWitLink,
  EmptyButtonWithoutLink,
} from "./ui/without-link-button";
import { DownloadIcon } from "lucide-react";

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
          <Command />
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
    <Popover>
      <PopoverTrigger asChild>
        <EmptyButtonWithoutLink label="Download for MacOS" icon={<MacIcon />} />
      </PopoverTrigger>
      <PopoverContent className="w-96 sm:w-[500px] max-w-lg p-2 my-6 ring-1 ring-[#FE4C55] ring-opacity-75 shadow-lg shadow-[#FE4C55]">
        <div className="space-y-2">
          <h4 className="font-bold text-lg">MacOS Installation Instructions</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Download the appropriate .dmg file for your Mac (Apple Silicon or
              Intel)
            </li>
            <li>
              Mouse Right Click then select <b>Open</b> to install without issue
            </li>
            <li>
              Then click <b>Open</b> again if a security warning appears
            </li>
            <Image
              src="https://utfs.io/f/93hqarYp4cDdTJXpHonKyaMH6AqBZiwkW31xt0ESzPTU5Gcl"
              alt="MacOS installation instructions"
              width={882}
              height={534}
              className="rounded-lg"
            />
          </ol>
          <p className="text-xs text-muted-foreground my-2">
            * First-time users may need to right-click and select
            &quot;Open&quot; to bypass Gatekeeper security
          </p>
        </div>
        <div className="flex justify-between items-center pt-4">
          <EmptyButtonWitLink
            label="Apple Silicon"
            icon={<DownloadIcon />}
            href={downloadLinks.macSilicon}
          />
          <EmptyButtonWitLink
            label="Intel Processor"
            icon={<DownloadIcon />}
            href={downloadLinks.macIntel}
          />
        </div>
      </PopoverContent>
    </Popover>

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

const SupportedPlatforms = () => {
  const t = useTranslations("DownloadApp");
  return <p className="text-sm text-center">{t("supportedPlatforms")}</p>;
};

const ReleaseInfo = ({ tag_name }) => (
  <div className="text-center space-x-1 md:space-y-2 flex flex-col items-center">
    <Link href="/changelog" className="text-base font-semibold">
      Release Notes
    </Link>
    <VersionTolatDownloads tag_name={tag_name} />
  </div>
);
