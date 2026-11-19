// src/pages/AboutPage.tsx
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// Switched to perfectly filled, solid Ionicons
import {
  IoLogoGithub,
  IoGlobe,
  IoHeart,
  IoEye,
  IoPeople,
  IoShieldCheckmark,
  IoOpenOutline, // Kept outline ONLY for the tiny 10px external arrow to keep it sharp
  IoLogoWindows,
  IoLogoApple,
  IoBarChart,
  IoColorPalette,
  IoTimer,
  IoDesktop,
  IoMedkit,
  IoTrendingUp,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { SiLinux } from "react-icons/si";
import { AppIcon } from "../AppIcon";
import { useAccentColor } from "../../contexts/AccentColorContext";
import { PRICING_URL } from "../../lib/links";

// ── Link card ────────────────────────────────────────────────────

function LinkCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <button
      onClick={() => open(href)}
      className="group flex items-center gap-3.5 rounded-xl border border-border/40 bg-transparent p-3 text-left transition-all hover:border-border/80 hover:bg-accent/30 active:scale-[0.98]"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-foreground/70 group-hover:text-foreground group-hover:bg-background shadow-sm transition-colors">
        <Icon className="text-[1.1rem]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-[13px] font-semibold text-foreground tracking-wide flex items-center gap-1.5">
          {title}
          <IoOpenOutline className="text-[10px] text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
        </h3>
        <p className="font-heading text-[11px] text-muted-foreground mt-0.5 truncate">
          {description}
        </p>
      </div>
    </button>
  );
}

// ── Feature card ─────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-1.5 rounded-lg transition-colors hover:bg-muted/30">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${bgClass} ${colorClass}`}
      >
        <Icon className="text-[1.1rem]" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="font-heading text-[13px] font-semibold text-foreground tracking-wide">
          {title}
        </h3>
        <p className="font-heading text-[12px] text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ── Benefit Pill ──

function BenefitPill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-2.5 py-1">
      <Icon className="text-[12px] text-foreground/60" />
      <span className="font-heading text-[11px] font-medium text-foreground/80">
        {text}
      </span>
    </div>
  );
}

// ── Platform badge ───────────────────────────────────────────────

function PlatformBadge({
  icon: Icon,
  name,
}: {
  icon: React.ElementType;
  name: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1.5 border border-border/30">
      <Icon className="text-[12px] text-foreground/60" />
      <span className="font-heading text-[10px] font-medium tracking-wide text-foreground/80">
        {name}
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────

const AboutPage = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");
  const { accentHex } = useAccentColor();

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <div className="mx-auto max-w-4xlxl space-y-7 py-2 px-1">
      {/* ── Header / Hero ──────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
            <AppIcon
              color={accentHex}
              className="relative size-14 rounded-xl p-1.5 shadow-sm border border-border/30 bg-background"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                blinkeye
              </h1>
              {version && (
                <span className="font-heading inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  v{version}
                </span>
              )}
            </div>
            <a
              href="https://blinkeye.app"
              target="_blank"
              rel="noreferrer"
              className="font-heading text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit mt-0.5"
            >
              blinkeye.app
            </a>
          </div>
        </div>

        <p className="font-heading text-[13px] leading-relaxed text-muted-foreground max-w-[600px]">
          {t("about.tagline")}
        </p>
      </div>

      {/* ── Features Grid ────────────────────────── */}
      <section className="space-y-4 pt-2 border-t border-border/30">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {t("about.coreFeatures")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureCard
            icon={IoEye}
            title={t("about.features.rule202020")}
            description={t("about.features.rule202020Desc")}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-500/10"
          />
          <FeatureCard
            icon={IoBarChart}
            title={t("about.features.usageStatistics")}
            description={t("about.features.usageStatisticsDesc")}
            colorClass="text-orange-600 dark:text-orange-400"
            bgClass="bg-orange-500/10"
          />
          <FeatureCard
            icon={IoTimer}
            title={t("about.features.pomodoroWorkday")}
            description={t("about.features.pomodoroWorkdayDesc")}
            colorClass="text-sky-600 dark:text-sky-400"
            bgClass="bg-sky-500/10"
          />
          <FeatureCard
            icon={IoColorPalette}
            title={t("about.features.themes")}
            description={t("about.features.themesDesc")}
            colorClass="text-rose-600 dark:text-rose-400"
            bgClass="bg-rose-500/10"
          />
          <FeatureCard
            icon={IoDesktop}
            title={t("about.features.screenSavers")}
            description={t("about.features.screenSaversDesc")}
            colorClass="text-indigo-600 dark:text-indigo-400"
            bgClass="bg-indigo-500/10"
          />
          <FeatureCard
            icon={IoShieldCheckmark}
            title={t("about.features.privacyFirst")}
            description={t("about.features.privacyFirstDesc")}
            colorClass="text-violet-600 dark:text-violet-400"
            bgClass="bg-violet-500/10"
          />
        </div>
      </section>

      {/* ── Health & Productivity Benefits ────────── */}
      <section className="space-y-3 pt-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {t("about.howHelps")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <BenefitPill
            icon={IoMedkit}
            text={t("about.benefits.cvs")}
          />
          <BenefitPill
            icon={IoCheckmarkCircle}
            text={t("about.benefits.posture")}
          />
          <BenefitPill icon={IoTrendingUp} text={t("about.benefits.focus")} />
          <BenefitPill icon={IoHeart} text={t("about.benefits.wellness")} />
          <BenefitPill icon={IoTimer} text={t("about.benefits.habits")} />
        </div>
      </section>

      {/* ── Links & Support ──────────────────────── */}
      <section className="space-y-3 pt-2 border-t border-border/30">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {t("about.supportProject")}
        </h2>
        <p className="font-heading text-[12px] text-muted-foreground mb-3 leading-relaxed">
          {t("about.supportText")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <LinkCard
            icon={IoHeart}
            title={t("about.getPremium")}
            description={t("about.getPremiumDesc")}
            href={PRICING_URL}
          />
          <LinkCard
            icon={IoLogoGithub}
            title={t("about.sourceCode")}
            description={t("about.sourceCodeDesc")}
            href="https://github.com/nomandhoni-cs/blink-eye"
          />
          <LinkCard
            icon={IoGlobe}
            title={t("about.website")}
            description={t("about.websiteDesc")}
            href="https://blinkeye.app"
          />
          <LinkCard
            icon={IoPeople}
            title={t("about.community")}
            description={t("about.communityDesc")}
            href="https://tally.so/r/wo0ZrN"
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="flex items-center justify-between border-t border-border/30 pt-4 pb-2 mt-4">
        <div className="flex items-center gap-1.5">
          <PlatformBadge
            icon={IoLogoWindows}
            name={t("about.platforms.windows")}
          />
          <PlatformBadge icon={IoLogoApple} name={t("about.platforms.macos")} />
          <PlatformBadge icon={SiLinux} name={t("about.platforms.linux")} />
        </div>

        <div className="text-right">
          <p className="font-heading text-[11px] text-muted-foreground">
            {t("about.builtBy")}{" "}
            <button
              onClick={() => open("https://github.com/nomandhoni-cs")}
              className="font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              Noman Dhoni
            </button>
          </p>
          <p className="font-heading text-[10px] text-muted-foreground/50 mt-0.5">
            {t("about.license")} © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
