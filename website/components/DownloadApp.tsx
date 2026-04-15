"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { DownloadIcon } from "lucide-react";

import { LinuxIcon, WindowsIcon, MacIcon } from "@/utils/mac-win-linicon";
import DownloadDropdown from "./DownloadDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EmptyButtonWitLink } from "./ui/EmptyButtonWitLink";
import { getDownloadLinks } from "@/utils/getReleaseData";

export default function DownloadApp({ latestRelease }: { latestRelease?: any }) {
  const rawLinks = getDownloadLinks(latestRelease?.assets || []);

  const downloadLinks: Record<string, string | undefined> = {
    windowsSetup: rawLinks.windowsSetup || undefined,
    windowsMSI: rawLinks.windowsMSI || undefined,
    macIntel: rawLinks.macIntel || undefined,
    macSilicon: rawLinks.macSilicon || undefined,
    linuxAppImage: rawLinks.linuxAppImage || undefined,
    linuxDeb: rawLinks.linuxDeb || undefined,
    linuxTar: rawLinks.linuxTar || undefined,
    linuxRPM: rawLinks.linuxRPM || undefined,
  };

  return (
    <div className="w-full">
      <DownloadButtons downloadLinks={downloadLinks} />
    </div>
  );
}

const DownloadButtons = ({
  downloadLinks,
}: {
  downloadLinks: Record<string, string | undefined>;
}) => (
  /*
   * Layout Strategy:
   * - Mobile (default): flex-col, items-center (stacked, centered)
   * - Desktop (lg+): flex-row, justify-center (row, centered)
   * - Each button has w-full on mobile, w-auto on desktop
   * - max-w-sm on mobile prevents buttons from being too wide on tablets
   */
  <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-5 w-full">
    {/* WINDOWS */}
    <DownloadOption
      name="Windows"
      icon={<WindowsIcon className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />}
      mainLink={downloadLinks.windowsSetup}
      dropdownLinks={[
        { href: downloadLinks.windowsSetup, label: "Download (EXE)" },
        { href: downloadLinks.windowsMSI, label: "Download (MSI)" },
      ]}
    />

    {/* MAC */}
    <MacDownloadButton downloadLinks={downloadLinks} />

    {/* LINUX */}
    <DownloadOption
      name="Linux"
      icon={<LinuxIcon className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />}
      mainLink={downloadLinks.linuxAppImage}
      dropdownLinks={[
        { href: downloadLinks.linuxAppImage, label: "AppImage" },
        { href: downloadLinks.linuxDeb, label: "Debian (.deb)" },
        { href: downloadLinks.linuxRPM, label: "RPM (.rpm)" },
        { href: downloadLinks.linuxTar, label: "Tar.gz" },
      ]}
    />
  </div>
);

// Split-Button for Windows & Linux
const DownloadOption = ({
  name,
  icon,
  mainLink,
  dropdownLinks,
}: {
  name: string;
  icon: React.ReactNode;
  mainLink?: string;
  dropdownLinks: { href?: string; label: string }[];
}) => {
  // Filter out undefined/null links
  const validLinks = dropdownLinks.filter(
    (link): link is { href: string; label: string } => !!link.href
  );
  const hasDropdown = validLinks.length > 1;

  return (
    /*
     * Sizing Strategy:
     * - Mobile: w-full + max-w-sm (full width but capped)
     * - Desktop: w-auto (shrink to content)
     */
    <div
      className={`
        flex items-stretch bg-[#FE4C55] text-black 
        h-14 lg:h-16 rounded-full shadow-lg hover:shadow-xl 
        transition-all w-full max-w-sm lg:w-auto lg:max-w-none
        focus-within:ring-2 focus-within:ring-[#FE4C55] focus-within:ring-offset-2 
        dark:focus-within:ring-offset-background
      `}
    >
      {mainLink ? (
        <Link
          href={mainLink}
          className={`
            flex flex-1 items-center justify-center gap-2 
            px-5 lg:px-6 hover:bg-black/5 active:bg-black/10 
            transition-colors
            ${hasDropdown ? "rounded-l-full" : "rounded-full"}
          `}
        >
          {icon}
          <span className="text-sm lg:text-base font-heading whitespace-nowrap">
            Download for {name}
          </span>
        </Link>
      ) : (
        <div
          className={`
            flex flex-1 items-center justify-center gap-2 
            px-5 lg:px-6 opacity-50 cursor-not-allowed
            ${hasDropdown ? "rounded-l-full" : "rounded-full"}
          `}
        >
          {icon}
          <span className="text-sm lg:text-base font-semibold whitespace-nowrap">
            {name} (Coming Soon)
          </span>
        </div>
      )}

      {/* Dropdown section - only show if multiple valid links */}
      {hasDropdown && (
        <>
          <div className="w-px bg-black/15 my-3" />
          <div className="w-11 lg:w-12 shrink-0 flex">
            <DownloadDropdown links={validLinks} />
          </div>
        </>
      )}
    </div>
  );
};

// Mac Popover Button
const MacDownloadButton = ({
  downloadLinks,
}: {
  downloadLinks: Record<string, string | undefined>;
}) => {
  const hasMacLinks = downloadLinks.macSilicon || downloadLinks.macIntel;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            flex items-center justify-center gap-2 
            bg-[#FE4C55] text-black h-14 lg:h-16 
            px-5 lg:px-6 rounded-full shadow-lg hover:shadow-xl 
            transition-all w-full max-w-sm lg:w-auto lg:max-w-none
            font-semibold focus:outline-none focus-visible:ring-2 
            focus-visible:ring-[#FE4C55] focus-visible:ring-offset-2
            dark:focus-visible:ring-offset-background
            ${hasMacLinks ? "hover:bg-[#FE4C55]/90 active:bg-[#FE4C55]/80" : "opacity-50 cursor-not-allowed"}
          `}
          disabled={!hasMacLinks}
        >
          <MacIcon className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
          <span className="text-sm lg:text-base whitespace-nowrap">
            {hasMacLinks ? "Download for MacOS" : "MacOS (Coming Soon)"}
          </span>
        </button>
      </PopoverTrigger>

      {hasMacLinks && (
        <PopoverContent
          align="center"
          sideOffset={12}
          className="w-[calc(100vw-2rem)] sm:w-[480px] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border shadow-2xl z-50"
        >
          <div className="space-y-4">
            <h4 className="font-bold text-lg sm:text-xl">
              MacOS Installation Instructions
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-muted-foreground">
              <li>
                Download the appropriate{" "}
                <strong className="text-foreground">.dmg</strong> file for your Mac.
              </li>
              <li>
                <strong className="text-foreground">Right-Click</strong> the app and
                select <strong className="text-foreground">Open</strong>.
              </li>
              <li>
                Click <strong className="text-foreground">Open</strong> again if a
                security warning appears.
              </li>
            </ol>

            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border bg-muted">
              <Image
                src="https://utfs.io/f/93hqarYp4cDdTJXpHonKyaMH6AqBZiwkW31xt0ESzPTU5Gcl"
                alt="MacOS installation instructions"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 480px"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              * First-time users may need to right-click and select &quot;Open&quot;
              to bypass Gatekeeper.
            </p>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-4 border-t">
            {downloadLinks.macSilicon && (
              <EmptyButtonWitLink
                label="Apple Silicon"
                icon={<DownloadIcon className="w-4 h-4" />}
                href={downloadLinks.macSilicon}
                className="flex-1"
              />
            )}
            {downloadLinks.macIntel && (
              <EmptyButtonWitLink
                label="Intel Processor"
                icon={<DownloadIcon className="w-4 h-4" />}
                href={downloadLinks.macIntel}
                className="flex-1"
              />
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};