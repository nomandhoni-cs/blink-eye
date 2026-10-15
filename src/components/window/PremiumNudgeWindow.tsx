import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  CalendarHeartIcon,
  FlameIcon,
  HeartIcon,
  TrophyIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import logo from "../../assets/newIcon.png";
import {
  composeNudgeMessage,
  getTodayScreenHours,
  nudgeHighlights,
  type BagState,
  type ComposedMessage,
  type NudgeHighlights,
  type NudgeTileKind,
  type NudgeVariant,
} from "../../lib/nudge-messaging";

interface LicenseInfo {
  is_paid: boolean;
}

interface TrialInfo {
  install_date: string | null;
  days_remaining: number;
  is_active: boolean;
}

interface BreakStats {
  breakStreak: number;
  bestBreakStreak: number;
  totalBreaksCompleted: number;
}

interface ReminderSettings {
  durationSecs: number | null;
}

const BAG_KEY = "premiumNudgeMessageBag";
const VARIANTS: NudgeVariant[] = ["trial_ending", "expired", "winback"];

const TILE_ICONS: Record<NudgeTileKind, typeof FlameIcon> = {
  streak: FlameIcon,
  bestStreak: TrophyIcon,
  tenure: CalendarHeartIcon,
};

/// Variant decided by Rust at spawn time (`?variant=`). Not re-derived from
/// `get_premium_nudge_state`: the spawn already recorded `shown`, so that
/// would report `session_cap` and wrongly close every real nudge.
function variantFromUrl(): NudgeVariant | null {
  const raw = new URLSearchParams(window.location.search).get("variant");
  return VARIANTS.find((v) => v === raw) ?? null;
}

function tenureDaysSince(installDate: string | null): number | null {
  if (!installDate) return null;
  const ms = Date.now() - Date.parse(`${installDate}T00:00:00`);
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.floor(ms / 86_400_000);
}

/// Ease-out count-up from 0 to `target`; jumps straight there when the
/// user prefers reduced motion.
function useCountUp(target: number, durationMs = 1400): number {
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduceMotion]);
  return reduceMotion ? target : value;
}

const FALLBACK_MESSAGE: ComposedMessage = {
  templateId: "window-fallback",
  headline: "Your eyes have a friend in you",
  body: "Every break you take is a small kindness to future you. Premium is how you look after the project back — and unlock themes and multi-monitor.",
  cta: "Support Blink Eye",
};

const HeroNumber = ({ value }: { value: number }) => {
  const shown = useCountUp(value);
  return (
    <span className="font-heading text-6xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
      {shown.toLocaleString()}
    </span>
  );
};

const PremiumNudgeWindow = () => {
  const [message, setMessage] = useState<ComposedMessage | null>(null);
  const [highlights, setHighlights] = useState<NudgeHighlights | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const variant = variantFromUrl();
        if (variant === null) throw new Error("missing nudge variant");
        const [license, trial, breaks, screenHours, rawBag, reminder] =
          await Promise.all([
            invoke<LicenseInfo>("get_license_info"),
            invoke<TrialInfo>("get_trial_info").catch(() => null),
            invoke<BreakStats>("get_break_stats").catch(() => null),
            getTodayScreenHours(),
            invoke<string | null>("get_config_string", { key: BAG_KEY }).catch(
              () => null,
            ),
            invoke<ReminderSettings>("get_reminder_settings").catch(() => null),
          ]);
        if (cancelled) return;
        // Race guard: the user may have activated a license between the
        // spawn decision and this window mounting. Never pitch to paid users.
        if (license.is_paid) {
          await getCurrentWebviewWindow().close();
          return;
        }
        let bag: BagState = { bags: {}, lastId: null };
        try {
          if (rawBag) {
            const parsed = JSON.parse(rawBag) as BagState;
            if (parsed && typeof parsed === "object") bag = parsed;
          }
        } catch {
          // Corrupt bag — start fresh rather than showing nothing.
        }
        const stats = {
          totalBreaks: breaks?.totalBreaksCompleted ?? 0,
          streak: breaks?.breakStreak ?? 0,
          bestStreak: breaks?.bestBreakStreak ?? 0,
          screenHoursToday: screenHours,
          daysLeft:
            trial !== null && trial.is_active ? trial.days_remaining : null,
          tenureDays: tenureDaysSince(trial?.install_date ?? null),
        };
        const composed = composeNudgeMessage(variant, stats, bag);
        if (cancelled) return;
        setMessage(composed.message);
        setHighlights(nudgeHighlights(stats, reminder?.durationSecs ?? null));
        // Persist freshness for the next show; best-effort, never blocks UI.
        invoke("update_reminder_setting", {
          key: BAG_KEY,
          value: JSON.stringify(composed.bagState),
        }).catch(() => {});
      } catch {
        // Stat reads failed — the composer path is unreachable, so fall back
        // to warm generic copy rather than a blank window.
        if (!cancelled) {
          setMessage(FALLBACK_MESSAGE);
          setHighlights({ hero: null, tiles: [] });
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeWith = async (event: "dismissed" | "snoozed") => {
    if (busy) return;
    setBusy(true);
    try {
      await invoke("close_premium_nudge", { event });
    } catch {
      await getCurrentWebviewWindow().close();
    }
  };

  const viewPremium = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await invoke("open_activate_license");
    } catch {
      await getCurrentWebviewWindow().close();
    }
  };

  const hero = highlights?.hero ?? null;
  const tiles = highlights?.tiles ?? [];
  const ready = message !== null;

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Warm wash behind the recap; also the drag handle on macOS. */}
      <div
        data-tauri-drag-region
        aria-hidden
        className="pointer-events-auto absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
      />
      <div data-tauri-drag-region className="relative h-9 shrink-0" />

      <main
        className={`relative flex flex-1 flex-col px-7 pb-6 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={logo}
            alt=""
            className="nudge-blink size-9 drop-shadow-sm"
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Your Blink Eye story
          </span>
        </div>

        {hero ? (
          <section className="mt-6" aria-label="Your progress">
            <HeroNumber value={hero.value} />
            <p className="mt-2 text-sm font-medium text-foreground/80">
              {hero.label}
            </p>
            {hero.caption && (
              <p className="mt-1 text-sm text-muted-foreground">
                {hero.caption}
              </p>
            )}
          </section>
        ) : (
          <div className="mt-6 h-2" />
        )}

        {tiles.length > 0 && (
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {tiles.map((tile) => {
              const Icon = TILE_ICONS[tile.kind];
              return (
                <li
                  key={tile.kind}
                  className="rounded-xl border border-border bg-card px-3 py-2.5"
                >
                  <Icon className="size-4 text-primary" aria-hidden />
                  <div className="mt-1.5 text-lg font-semibold leading-none tabular-nums">
                    {tile.value}
                  </div>
                  <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                    {tile.label}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-7">
          <h1 className="font-heading text-xl font-semibold leading-snug">
            {message?.headline}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {message?.body}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <Button
            onClick={viewPremium}
            disabled={busy || !ready}
            className="h-11 w-full text-[15px]"
          >
            <HeartIcon className="size-4" />
            {message?.cta ?? "View premium"}
          </Button>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() => closeWith("snoozed")}
              disabled={busy}
              variant="ghost"
              className="flex-1 text-muted-foreground"
            >
              Remind me next week
            </Button>
            <Button
              onClick={() => closeWith("dismissed")}
              disabled={busy}
              variant="ghost"
              className="flex-1 text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumNudgeWindow;
