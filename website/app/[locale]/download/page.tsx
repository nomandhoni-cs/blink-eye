import React from "react";
import { getDownloadLinks } from "@/utils/getReleaseData";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { SEO } from "@/configs/seo";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGithubStats } from "@/utils/fetch-github-release";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Download,
  Shield,
  Star,
  Terminal,
  CheckCircle2,
} from "lucide-react";
import GradientBackground from "@/components/GradientBackground";
import Command from "@/components/Command";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "downloadPage" });
    const appInfo = await getTranslations({ locale, namespace: "Metadata" });

    return {
      title: t("title") + " | " + appInfo("appName"),
      description: t("description"),
      applicationName: appInfo("appName"),
      openGraph: {
        title: t("title") + " | " + appInfo("appName"),
        description: t("description"),
        url: "https://blinkeye.app/en/download",
        type: "website",
        images: [
          {
            url: "https://utfs.io/f/93hqarYp4cDdoi04u4derHR0E5Och9U3PASy1oYVvwiMlx6D",
            width: 1280,
            height: 720,
            alt: t("title") + " | " + appInfo("appName"),
          },
        ],
        siteName: appInfo("appName"),
      },
      twitter: { site: SEO.twitter },
    };
  } catch {
    return {
      title: "Download",
      description:
        "Download Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
      applicationName: SEO.title,
      keywords: SEO.keywords,
      openGraph: {
        title: "Download",
        description:
          "Download Break Reminder, Eye Care Reminder app for Linux, MacOS, Windows",
        url: "https://blinkeye.app/en/download",
        type: "website",
        images: [
          {
            url: "https://utfs.io/f/93hqarYp4cDdoi04u4derHR0E5Och9U3PASy1oYVvwiMlx6D",
            width: 1280,
            height: 720,
            alt: SEO.description,
          },
        ],
        siteName: "Blink Eye",
      },
      twitter: { site: SEO.twitter },
    };
  }
};

const DownloadPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

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

  const githubStats = await fetchGithubStats();

  if (githubStats?.latestRelease?.assets) {
    downloadLinks = getDownloadLinks(githubStats.latestRelease.assets);
  }

  const { tagName, totalDownloads } = githubStats;

  return (
    <div className="w-full">
      {/* ===== Hero ===== */}
      <section className="relative isolate w-full">
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
          aria-hidden="true"
        >
          <GradientBackground
            position="top"
            rotate={30}
            fromColor="#ff80b5"
            toColor="#FE4C55"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Version Badge */}
            {tagName && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/80 backdrop-blur-sm text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-muted-foreground">
                  Latest:{" "}
                  <span className="font-semibold text-foreground">
                    {tagName}
                  </span>
                </span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight">
              Download <span className="text-[#FE4C55]">Blink Eye</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Choose your platform below. Free, open source, and built for your
              health.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#FE4C55]" />
                <span className="font-semibold text-foreground">
                  {totalDownloads.toLocaleString()}
                </span>{" "}
                downloads
              </span>
              <span className="hidden sm:inline w-px h-4 bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Trusted by{" "}
                <span className="font-semibold text-foreground">25,000++</span>{" "}
                users
              </span>
              <span className="hidden sm:inline w-px h-4 bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Open Source
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Platform Cards ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Windows */}
          <PlatformCard
            title="Windows"
            icon={<WindowsIcon className="w-8 h-8" />}
            subtitle="Windows 10 or later · 64-bit"
            featured
            downloads={[
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
            ]}
          />

          {/* macOS */}
          <PlatformCard
            title="macOS"
            icon={<MacIcon className="w-8 h-8" />}
            subtitle="macOS 11 Big Sur or later"
            downloads={[
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
            ]}
          />

          {/* Linux */}
          <PlatformCard
            title="Linux"
            icon={<LinuxIcon className="w-8 h-8" />}
            subtitle="Most modern distributions"
            downloads={[
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
            ]}
          />
        </div>
      </section>

      {/* ===== macOS Gatekeeper ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <GatekeeperNotice />
      </section>

      {/* ===== CLI Install ===== */}
      <section className="relative isolate w-full">
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
          aria-hidden="true"
        >
          <GradientBackground
            position="bottom"
            rotate={0}
            fromColor="#FE4C55"
            toColor="#9089fc"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/80 backdrop-blur-sm text-sm mb-6">
              <Terminal className="w-4 h-4 text-[#FE4C55]" />
              <span className="text-muted-foreground font-medium">
                Prefer the command line?
              </span>
            </div>
          </div>
          <Command />
        </div>
      </section>

      {/* ===== System Requirements ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12">
          System Requirements
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <RequirementCard
            icon={<WindowsIcon className="w-6 h-6" />}
            title="Windows"
            items={[
              "Windows 10 or later",
              "64-bit processor",
              "~50 MB disk space",
            ]}
          />
          <RequirementCard
            icon={<MacIcon className="w-6 h-6" />}
            title="macOS"
            items={[
              "macOS 11 Big Sur+",
              "Apple Silicon or Intel",
              "~50 MB disk space",
            ]}
          />
          <RequirementCard
            icon={<LinuxIcon className="w-6 h-6" />}
            title="Linux"
            items={[
              "Ubuntu 20.04+ / Fedora 34+",
              "64-bit processor",
              "~50 MB disk space",
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default DownloadPage;

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

interface DownloadEntry {
  href: string | null;
  label: string;
  tag?: string;
  primary?: boolean;
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
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-lg ${featured
        ? "border-[#FE4C55]/30 shadow-md shadow-[#FE4C55]/5 bg-[#FE4C55]/[0.02] dark:bg-[#FE4C55]/[0.04]"
        : "border-border bg-card"
        }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#FE4C55] text-black text-xs font-semibold">
          Most Popular
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`p-3 rounded-xl ${featured
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
              className={`group flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${d.primary
                ? "bg-[#FE4C55] text-black hover:bg-[#FE4C55]/90 hover:shadow-md hover:shadow-[#FE4C55]/20 active:scale-[0.98]"
                : "bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-foreground/10"
                }`}
            >
              <span className="flex items-center gap-3">
                <Download
                  className={`w-4 h-4 ${d.primary ? "text-black/70" : "text-muted-foreground"
                    }`}
                />
                <span className="flex flex-col items-start">
                  <span>{d.label}</span>
                  {d.tag && (
                    <span
                      className={`text-xs ${d.primary ? "text-black/50" : "text-muted-foreground"
                        }`}
                    >
                      {d.tag}
                    </span>
                  )}
                </span>
              </span>
              <ArrowUpRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${d.primary ? "text-black/50" : "text-muted-foreground"
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

function GatekeeperNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] p-6 sm:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Text */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-heading font-bold text-lg">
              macOS Gatekeeper Notice
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Blink Eye is not yet notarized with Apple (requires $99/year). macOS
            may show a security warning on first launch. To open:
          </p>

          <ol className="space-y-3">
            {[
              <>
                <strong className="text-foreground">Right-click</strong> the app
                in Finder
              </>,
              <>
                Select{" "}
                <strong className="text-foreground">Open</strong> from the menu
              </>,
              <>
                Click{" "}
                <strong className="text-foreground">Open</strong> in the dialog
              </>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Screenshot */}
        <div className="md:w-80 lg:w-96 shrink-0">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted">
            <Image
              src="https://utfs.io/f/93hqarYp4cDdTJXpHonKyaMH6AqBZiwkW31xt0ESzPTU5Gcl"
              alt="How to open Blink Eye on macOS"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Right-click → Open bypasses Gatekeeper
          </p>
        </div>
      </div>
    </div>
  );
}

function RequirementCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow">
      <div className="p-3 rounded-xl bg-muted mb-4">{icon}</div>
      <h3 className="font-heading font-bold text-lg mb-5">{title}</h3>
      <ul className="space-y-3 w-full">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}