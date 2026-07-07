import React from "react";
import { getDownloadLinks } from "@/utils/getReleaseData";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { SEO } from "@/configs/seo";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchGithubStats } from "@/utils/fetch-github-release";
import Link from "next/link";
import {
  Download,
  Shield,
  Star,
  CheckCircle2,
} from "lucide-react";
import GradientBackground from "@/components/GradientBackground";
import Command from "@/components/Command";
import PlatformAwareCards from "@/components/PlatformAwareCards";

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
                Total Downloaded:{" "}
                <span className="font-semibold text-foreground">
                  {totalDownloads.toLocaleString()} times
                </span>
              </span>
              <span className="hidden sm:inline w-px h-4 bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Apple Notarized
              </span>
              <span className="hidden sm:inline w-px h-4 bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Open Source
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Platform Cards ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <PlatformAwareCards downloadLinks={downloadLinks} />
      </section>

      {/* ===== Apple Notarized Badge ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <NotarizedBadge />
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

function NotarizedBadge() {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-6 sm:p-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-xl bg-emerald-500/10">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-lg">
            Apple Notarized
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Blink Eye is notarized by Apple. No Gatekeeper warnings &mdash;
            install and run directly.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-background/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            macOS Intel &amp; Apple Silicon
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-background/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Windows 10, 11
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-background/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Linux (Debian, AppImage, RPM, Tar.gz)
          </span>
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