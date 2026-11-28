"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { usePlatform, type Platform } from "@/utils/usePlatform";

export type PlatformDownloads = {
  windowsSetup: string | null;
  windowsMSI: string | null;
  macIntel: string | null;
  macSilicon: string | null;
  linuxAppImage: string | null;
  linuxDeb: string | null;
  linuxTar: string | null;
  linuxRPM: string | null;
};

type Props = {
  downloads: PlatformDownloads;
  fallbackHref: string;
  buttonText: string;
};

type SupportedPlatform = Exclude<Platform, "unknown">;

const platformDetails: Record<
  SupportedPlatform,
  { label: string; icon: typeof WindowsIcon }
> = {
  windows: { label: "Windows", icon: WindowsIcon },
  mac: { label: "macOS", icon: MacIcon },
  linux: { label: "Linux", icon: LinuxIcon },
};

const buttonClassName =
  "inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#FE4C55] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e83b45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4C55] focus-visible:ring-offset-2 sm:px-5";

export function PlatformDownloadButton({
  downloads,
  fallbackHref,
  buttonText,
}: Props) {
  const detected = usePlatform();

  const preferredDownloads: Record<SupportedPlatform, string | null> = {
    windows: downloads.windowsSetup || downloads.windowsMSI,
    // Prefer the current Apple Silicon installer; expose the Intel build below.
    mac: downloads.macSilicon || downloads.macIntel,
    linux:
      downloads.linuxAppImage ||
      downloads.linuxDeb ||
      downloads.linuxRPM ||
      downloads.linuxTar,
  };

  const availablePlatforms = (
    Object.keys(platformDetails) as SupportedPlatform[]
  ).filter((platform) => preferredDownloads[platform]);

  if (availablePlatforms.length === 0) {
    return (
      <Link href={fallbackHref} className={buttonClassName}>
        <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
        {buttonText}
      </Link>
    );
  }

  const selectedPlatform =
    detected !== "unknown" && preferredDownloads[detected]
      ? detected
      : null;

  if (!selectedPlatform) {
    return (
      <div className="flex w-full flex-col gap-2 md:w-[250px]">
        {availablePlatforms.map((platform) => {
          const { label, icon: Icon } = platformDetails[platform];
          return (
            <a
              key={platform}
              href={preferredDownloads[platform]!}
              className={buttonClassName}
            >
              <Icon className="h-4 w-4 shrink-0 fill-current text-white" />
              <span>Download for {label}</span>
              <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
            </a>
          );
        })}
        {downloads.macIntel && downloads.macIntel !== preferredDownloads.mac && (
          <a
            href={downloads.macIntel}
            className="pt-1 text-center text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            Intel Mac download
          </a>
        )}
      </div>
    );
  }

  const { label, icon: Icon } = platformDetails[selectedPlatform];
  const selectedHref = preferredDownloads[selectedPlatform]!;
  const alternateMacHref =
    selectedPlatform === "mac"
      ? selectedHref === downloads.macSilicon
        ? downloads.macIntel
        : downloads.macSilicon
      : null;

  return (
    <div className="flex w-full flex-col items-start gap-2 md:w-[250px]">
      <a href={selectedHref} className={buttonClassName}>
        <Icon className="h-4 w-4 shrink-0 fill-current text-white" />
        <span>Download for {label}</span>
        <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
      </a>
      {alternateMacHref && alternateMacHref !== selectedHref && (
        <a
          href={alternateMacHref}
          className="pt-1 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
        >
          {alternateMacHref === downloads.macIntel ? "Intel Mac download" : "Apple Silicon Mac download"}
        </a>
      )}
    </div>
  );
}
