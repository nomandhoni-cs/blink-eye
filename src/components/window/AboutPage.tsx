// src/pages/AboutPage.tsx
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import {
  IoLogoGithub,
  IoGlobeOutline,
  IoHeartOutline,
  IoEyeOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoOpenOutline,
  IoLogoWindows,
  IoLogoApple,
} from "react-icons/io5";
import { SiLinux } from "react-icons/si";
import logo from "../../assets/new-icon.svg";

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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-1">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
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

// ── Platform badge ───────────────────────────────────────────────

function PlatformBadge({
  icon: Icon,
  name,
}: {
  icon: React.ElementType;
  name: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/30 px-2.5 py-1.5 border border-border/30">
      <Icon className="text-[13px] text-foreground/60" />
      <span className="font-heading text-[11px] font-medium tracking-wide text-foreground/80">
        {name}
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────

const AboutPage = () => {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    // max-w-2xl with tight left alignment, minimal padding
    <div className="mx-auto max-w-2xl space-y-7 py-2 px-1">
      {/* ── Header / Hero (Inline) ──────────────── */}
      <div className="flex flex-col gap-4">
        {/* Inline Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
            <img
              src={logo}
              alt="Blink Eye"
              draggable={false}
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

        <p className="font-heading text-[13px] leading-relaxed text-muted-foreground max-w-lg">
          A minimalist eye care reminder designed around the 20-20-20 rule.
          Protect your eyes with gentle, timely break reminders.
        </p>
      </div>

      {/* ── Why Blink Eye ────────────────────────── */}
      <section className="space-y-4 pt-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Features & Philosophy
        </h2>
        <div className="grid gap-5">
          <FeatureCard
            icon={IoEyeOutline}
            title="20-20-20 Rule"
            description="Every 20 minutes, look at something 20 feet away for 20 seconds. Blink Eye automates the reminder so you never forget."
          />
          <FeatureCard
            icon={IoShieldCheckmarkOutline}
            title="Privacy First"
            description="Runs entirely on your device. No accounts, no tracking, no data collection. Your usage stays yours."
          />
          <FeatureCard
            icon={IoPeopleOutline}
            title="Open Source"
            description="Community-driven and fully transparent. Inspect the code, suggest features, or contribute directly."
          />
        </div>
      </section>

      {/* ── Links ────────────────────────────────── */}
      <section className="space-y-3 pt-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Resources
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <LinkCard
            icon={IoGlobeOutline}
            title="Website"
            description="Features and updates"
            href="https://blinkeye.app"
          />
          <LinkCard
            icon={IoLogoGithub}
            title="GitHub"
            description="Source code and contributions"
            href="https://github.com/nomandhoni-cs/blink-eye"
          />
          <LinkCard
            icon={IoHeartOutline}
            title="Support"
            description="Help keep the project alive"
            href="https://blinkeye.app/pricing"
          />
          <LinkCard
            icon={IoPeopleOutline}
            title="Community"
            description="Join the conversation"
            href="https://tally.so/r/wo0ZrN"
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="flex items-center justify-between border-t border-border/30 pt-5 pb-2 mt-4">
        <div className="flex items-center gap-2">
          <PlatformBadge icon={IoLogoWindows} name="Windows" />
          <PlatformBadge icon={IoLogoApple} name="macOS" />
          <PlatformBadge icon={SiLinux} name="Linux" />
        </div>

        <div className="text-right">
          <p className="font-heading text-[11px] text-muted-foreground">
            Built by{" "}
            <button
              onClick={() => open("https://github.com/nomandhoni-cs")}
              className="font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              Noman Dhoni
            </button>
          </p>
          <p className="font-heading text-[10px] text-muted-foreground/50 mt-0.5">
            MIT License © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
