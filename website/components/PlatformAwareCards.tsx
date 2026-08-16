"use client";

import React from "react";
import Link from "next/link";
import { Download, ArrowUpRight } from "lucide-react";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { usePlatform, type Platform } from "@/utils/usePlatform";

interface DownloadEntry {
  href: string | null;
  label: string;
  tag?: string;
  primary?: boolean;
}

interface PlatformConfig {
  key: Platform;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  downloads: DownloadEntry[];
}

const PLATFORM_ORDER: Platform[] = ["windows", "mac", "linux"];

export default function PlatformAwareCards({
  downloadLinks,
}: {
  downloadLinks: { [key: string]: string | null };
}) {
  const detected = usePlatform();

  const platforms: PlatformConfig[] = [
    {
      key: "windows",
      title: "Windows",
      icon: <WindowsIcon className="w-8 h-8" />,
      subtitle: "Windows 10 or later · 64-bit",
      downloads: [
        {
          href: downloadLinks.windowsSetup,
          label: "Installer (EXE)",
          tag: "Recommended",
          primary: true,
        },
        {
          href: downloadLinks.windowsMSI,
          label: "MSI Package",
          tag: "Enterprise",
        },
      ],
    },
    {
      key: "mac",
      title: "macOS",
      icon: <MacIcon className="w-8 h-8" />,
      subtitle: "macOS 11 Big Sur or later",
      downloads: [
        {
          href: downloadLinks.macSilicon,
          label: "Apple Silicon",
          tag: "M1 / M2 / M3 / M4",
          primary: true,
        },
        {
          href: downloadLinks.macIntel,
          label: "Intel",
          tag: "x86_64",
        },
      ],
    },
    {
      key: "linux",
      title: "Linux",
      icon: <LinuxIcon className="w-8 h-8" />,
      subtitle: "Most modern distributions",
      downloads: [
        {
          href: downloadLinks.linuxAppImage,
          label: "AppImage",
          tag: "Universal",
          primary: true,
        },
        { href: downloadLinks.linuxDeb, label: "Debian", tag: ".deb" },
        { href: downloadLinks.linuxRPM, label: "RPM", tag: ".rpm" },
        {
          href: downloadLinks.linuxTar,
          label: "Tar.gz",
          tag: "Archive",
        },
      ],
    },
  ];

  const ordered =
    detected !== "unknown"
      ? [...platforms].sort((a, b) => {
          if (a.key === detected) return -1;
          if (b.key === detected) return 1;
          return 0;
        })
      : platforms;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {ordered.map((p) => (
        <PlatformCard
          key={p.key}
          title={p.title}
          icon={p.icon}
          subtitle={p.subtitle}
          downloads={p.downloads}
          featured={detected !== "unknown" && p.key === detected}
        />
      ))}
    </div>
  );
}

function PlatformCard({
  title,
  icon,
  subtitle,
  downloads,
  featured,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  downloads: DownloadEntry[];
  featured?: boolean;
}) {
  const valid = downloads.filter((d) => d.href !== null);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg ${
        featured
          ? "border-[#FE4C55]/30 shadow-md shadow-[#FE4C55]/5 bg-[#FE4C55]/[0.02] dark:bg-[#FE4C55]/[0.04]"
          : "border-border bg-card"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#FE4C55] text-black text-xs font-semibold">
          Your Platform
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`p-3 rounded-xl ${
            featured
              ? "bg-[#FE4C55]/10 text-[#FE4C55]"
              : "bg-muted text-foreground"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-heading font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-auto">
        {valid.length > 0 ? (
          valid.map((d) => (
            <Link
              key={d.label}
              href={d.href!}
              className={`group flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                d.primary
                  ? "bg-[#FE4C55] text-black hover:bg-[#FE4C55]/90 hover:shadow-md hover:shadow-[#FE4C55]/20 active:scale-[0.98]"
                  : "bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-foreground/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <Download
                  className={`w-4 h-4 ${
                    d.primary ? "text-black/70" : "text-muted-foreground"
                  }`}
                />
                <span className="flex flex-col items-start">
                  <span>{d.label}</span>
                  {d.tag && (
                    <span
                      className={`text-xs ${
                        d.primary ? "text-black/50" : "text-muted-foreground"
                      }`}
                    >
                      {d.tag}
                    </span>
                  )}
                </span>
              </span>
              <ArrowUpRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                  d.primary ? "text-black/50" : "text-muted-foreground"
                }`}
              />
            </Link>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground bg-muted/50 rounded-xl">
            Downloads coming soon
          </div>
        )}
      </div>
    </div>
  );
}
