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

const platformDetails: Record<Exclude<Platform, "unknown">, { label: string; icon: typeof WindowsIcon }> = {
  windows: { label: "Windows", icon: WindowsIcon },
  mac: { label: "macOS", icon: MacIcon },
  linux: { label: "Linux", icon: LinuxIcon },
};

const buttonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FE4C55] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e83b45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4C55] focus-visible:ring-offset-2";

export function PlatformDownloadButton({ downloads, fallbackHref, buttonText }: Props) {
  const detected = usePlatform();

  const preferredDownloads: Record<Exclude<Platform, "unknown">, string | null> = {
    windows: downloads.windowsSetup || downloads.windowsMSI,
    // Prefer the current Apple Silicon installer; expose the Intel build below.
    mac: downloads.macSilicon || downloads.macIntel,
    linux:
      downloads.linuxAppImage ||
      downloads.linuxDeb ||
      downloads.linuxRPM ||
      downloads.linuxTar,
  };

  const availablePlatforms = (Object.keys(platformDetails) as Exclude<Platform, "unknown">[])
    .filter((platform) => preferredDownloads[platform]);

  if (availablePlatforms.length === 0) {
    return (
      <Link href={fallbackHref} className={buttonClassName}>
        <Download aria-hidden="true" className="h-4 w-4" />
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
      <div className="flex flex-wrap items-center gap-3">
        {availablePlatforms.map((platform) => {
          const { label, icon: Icon } = platformDetails[platform];
          return (
            <a
              key={platform}
              href={preferredDownloads[platform]!}
              className={buttonClassName}
            >
              <Icon className="h-4 w-4 fill-current text-white" />
              Download for {label}
            </a>
          );
        })}
        {downloads.macIntel && downloads.macIntel !== preferredDownloads.mac && (
          <a
            href={downloads.macIntel}
            className="text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <a href={selectedHref} className={buttonClassName}>
        <Icon className="h-4 w-4 fill-current text-white" />
        Download for {label}
        <Download aria-hidden="true" className="h-4 w-4" />
      </a>
      {alternateMacHref && (
        <a
          href={alternateMacHref}
          className="text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
        >
          {alternateMacHref === downloads.macIntel ? "Intel Mac" : "Apple Silicon Mac"}
        </a>
      )}
    </div>
  );
}
