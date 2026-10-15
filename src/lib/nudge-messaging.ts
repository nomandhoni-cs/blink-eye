import Database from "@tauri-apps/plugin-sql";

// =============================================================================
// Nudge messaging — dynamic, stat-personalized copy for the premium nudge.
// =============================================================================
//
// TONE OF VOICE (the whole module lives by this):
// - Warm, casual, plain-spoken. Write like a friend who noticed your good
//   habit — never like a paywall, never like a marketing email.
// - Second person ("you", "your"). One concrete true number per message.
// - At most one emoji per message. Short sentences.
// - No guilt, no threats, no fake urgency, no countdown timers.
// - The ask is always open-source support ("keeps Blink Eye free for
//   everyone"), never ransom ("pay or lose out").
// - New users get celebrated ("day one of kinder eyes"), never shown zeros.
// - Snoozes, skips, and missed breaks are NEVER mentioned anywhere.
//
// STRUCTURE (for future multilingual support):
// - Every template has a stable `id`; copy swaps per locale without touching
//   logic. Slots are named (`{streak}`, `{totalBreaks}`, …) and filled at
//   show-time. Each locale ships its own pool plus its own BANNED_PHRASES.

export type NudgeVariant = "trial_ending" | "expired" | "winback";

export type NudgeTier = "milestone" | "streak" | "cumulative" | "relevance" | "fallback";

/// Stats the copy may touch. These are the "core things you can relate with
/// a user": effort (breaks), identity (streak), care (screen hours protected),
/// gentle urgency (days left, trial pool only), belonging (tenure).
export interface NudgeStats {
  totalBreaks: number;
  streak: number;
  bestStreak: number;
  screenHoursToday: number | null;
  daysLeft: number | null;
  tenureDays: number | null;
}

export interface NudgeTemplate {
  id: string;
  variants: NudgeVariant[];
  tier: NudgeTier;
  /// Milestone key this template celebrates (tier "milestone" only).
  milestone?: string;
  headline: string;
  body: string;
  cta: string;
}

export interface ComposedMessage {
  templateId: string;
  headline: string;
  body: string;
  cta: string;
}

/// Persisted freshness state (JSON in `premiumNudgeMessageBag` config key).
export interface BagState {
  bags: Record<string, string[]>;
  lastId: string | null;
}

/// Phrases no pooled string may contain (English pool). Enforced by tests —
/// add a line, and the suite checks it automatically.
export const BANNED_PHRASES: string[] = [
  "last chance",
  "act now",
  "don't miss out",
  "dont miss out",
  "you'll lose",
  "lose access",
  "pay now",
  "buy now",
  "or else",
  "hurry",
  "lazy",
  "wasting",
  "shame on",
  "you're ignoring",
  "final warning",
];

/// Every `{slot}` any template may use. Tests reject unknown slots.
export const KNOWN_SLOTS: string[] = [
  "totalBreaks",
  "streak",
  "bestStreak",
  "screenHours",
  "daysLeft",
  "daysLeftNote",
  "tenureDays",
];

export const STREAK_MIN = 2;
export const BREAKS_MIN = 5;
export const SCREEN_HOURS_MIN = 1;
export const STREAK_MILESTONES = [5, 10, 30];
const BREAK_CLUBS: Array<{ min: number; max: number; key: string }> = [
  { min: 50, max: 60, key: "club-50" },
  { min: 100, max: 115, key: "club-100" },
  { min: 250, max: 275, key: "club-250" },
];

export const TEMPLATES: NudgeTemplate[] = [
  // ---- Shared milestone celebrations (work in every variant) ----
  {
    id: "ms-streak-5",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "streak-5",
    headline: "5-day streak — that's a habit 🌟",
    body: "Most people never make it past day two. Premium is our high-five back: themes, multi-monitor, and keeping Blink Eye free for everyone.",
    cta: "Support Blink Eye",
  },
  {
    id: "ms-streak-10",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "streak-10",
    headline: "Double digits: {streak} days! 🎉",
    body: "{streak} days of looking away on purpose. That's discipline. Going premium supports the open-source project behind your streak.",
    cta: "Support Blink Eye",
  },
  {
    id: "ms-streak-30",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "streak-30",
    headline: "{streak} days. A full month of kinder eyes 🏆",
    body: "A whole month of showing up for yourself. Premium members keep this free for the next person starting day one.",
    cta: "Support Blink Eye & unlock premium",
  },
  {
    id: "ms-club-50",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "club-50",
    headline: "{totalBreaks} full breaks together 💛",
    body: "That's the 50-break club — {totalBreaks} times you chose your eyes over your screen. Premium is how you keep the club running.",
    cta: "Support Blink Eye",
  },
  {
    id: "ms-club-100",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "club-100",
    headline: "{totalBreaks} breaks. Triple digits! 🌟",
    body: "One hundred times you paused on purpose. Blink Eye is free and open source — premium keeps it that way.",
    cta: "Support Blink Eye & unlock premium",
  },
  {
    id: "ms-club-250",
    variants: ["trial_ending", "expired", "winback"],
    tier: "milestone",
    milestone: "club-250",
    headline: "{totalBreaks} breaks. Legend status 🏆",
    body: "Few people ever reach {totalBreaks} full breaks. You're the reason this project exists — premium is the tip jar.",
    cta: "Support Blink Eye",
  },
  // ---- trial_ending: gentle urgency + warmth ----
  {
    id: "te-streak-1",
    variants: ["trial_ending"],
    tier: "streak",
    headline: "Look at you, {streak} days in a row 🎉",
    body: "That's a real habit forming.{daysLeftNote} Premium keeps your toolkit sharp — themes, multi-monitor, and more.",
    cta: "View premium",
  },
  {
    id: "te-streak-2",
    variants: ["trial_ending"],
    tier: "streak",
    headline: "{streak}-day streak — your eyes thank you",
    body: "Keep it rolling.{daysLeftNote} Going premium supports Blink Eye and unlocks everything.",
    cta: "View premium",
  },
  {
    id: "te-cum-1",
    variants: ["trial_ending"],
    tier: "cumulative",
    headline: "{totalBreaks} breaks together 💛",
    body: "That's {totalBreaks} times you chose your eyes.{daysLeftNote} Premium keeps Blink Eye free for everyone.",
    cta: "View premium",
  },
  {
    id: "te-cum-2",
    variants: ["trial_ending"],
    tier: "cumulative",
    headline: "You've shown up {totalBreaks} times",
    body: "Consistency like that deserves the full toolkit.{daysLeftNote} Themes, multi-monitor, and our thanks.",
    cta: "Support Blink Eye",
  },
  {
    id: "te-rel-1",
    variants: ["trial_ending"],
    tier: "relevance",
    headline: "{screenHours} hours of screen time today",
    body: "And you still looked away. That's the whole game.{daysLeftNote} Premium helps us keep it going.",
    cta: "View premium",
  },
  {
    id: "te-fb-1",
    variants: ["trial_ending"],
    tier: "fallback",
    headline: "Your trial is almost up",
    body: "Thanks for spending these days with us.{daysLeftNote} Blink Eye is free and open source — premium keeps it that way.",
    cta: "View premium",
  },
  {
    id: "te-fb-2",
    variants: ["trial_ending"],
    tier: "fallback",
    headline: "A little note before your trial ends",
    body: "No pressure, just thanks.{daysLeftNote} If Blink Eye helped your eyes, premium is how you help the project back.",
    cta: "Support Blink Eye",
  },
  // ---- expired: welcome-back + "look what you built" ----
  {
    id: "ex-streak-1",
    variants: ["expired"],
    tier: "streak",
    headline: "{streak}-day streak and counting 🎉",
    body: "Your trial ended, but your habit doesn't have to. Support Blink Eye to unlock premium extras.",
    cta: "Support Blink Eye",
  },
  {
    id: "ex-streak-2",
    variants: ["expired"],
    tier: "streak",
    headline: "{streak} days of showing up for your eyes",
    body: "That streak is yours, trial or not. Premium is how you keep the project behind it alive.",
    cta: "Support Blink Eye & unlock premium",
  },
  {
    id: "ex-cum-1",
    variants: ["expired"],
    tier: "cumulative",
    headline: "{totalBreaks} breaks — look how far you've come 💛",
    body: "Every one of those was a gift to your future self. Premium keeps the gifts coming, for you and everyone.",
    cta: "Support Blink Eye",
  },
  {
    id: "ex-cum-2",
    variants: ["expired"],
    tier: "cumulative",
    headline: "You've taken {totalBreaks} proper breaks",
    body: "Not many people can say that. Unlock themes and multi-monitor — and keep Blink Eye free for all.",
    cta: "View premium",
  },
  {
    id: "ex-rel-1",
    variants: ["expired"],
    tier: "relevance",
    headline: "{screenHours} hours in front of a screen today",
    body: "Good thing someone reminds you to look away. That someone runs on premium support.",
    cta: "Support Blink Eye",
  },
  {
    id: "ex-fb-1",
    variants: ["expired"],
    tier: "fallback",
    headline: "Your trial ended — your breaks don't have to",
    body: "Blink Eye stays free, trial or not. Premium just unlocks extras and supports the project.",
    cta: "Support Blink Eye",
  },
  {
    id: "ex-fb-2",
    variants: ["expired"],
    tier: "fallback",
    headline: "Still here, still blinking 💛",
    body: "Day one of the rest of your (well-rested) eyes. Premium is there whenever you want it.",
    cta: "View premium",
  },
  // ---- winback: missed-you + support framing ----
  {
    id: "wb-streak-1",
    variants: ["winback"],
    tier: "streak",
    headline: "{streak} days straight — we noticed 🎉",
    body: "We missed you around here. Premium is still yours whenever you want it — and it keeps Blink Eye free.",
    cta: "View premium",
  },
  {
    id: "wb-streak-2",
    variants: ["winback"],
    tier: "streak",
    headline: "That {streak}-day streak suits you",
    body: "Come back to the full toolkit: themes, multi-monitor, and the warm feeling of supporting open source.",
    cta: "Support Blink Eye",
  },
  {
    id: "wb-cum-1",
    variants: ["winback"],
    tier: "cumulative",
    headline: "{totalBreaks} breaks and counting 💛",
    body: "You've been at this a while — respect. Premium is our way of saying thanks back.",
    cta: "Support Blink Eye",
  },
  {
    id: "wb-cum-2",
    variants: ["winback"],
    tier: "cumulative",
    headline: "Remember your first break?",
    body: "You've taken {totalBreaks} since then. Premium keeps the next {totalBreaks} coming — for you and for free.",
    cta: "View premium",
  },
  {
    id: "wb-rel-1",
    variants: ["winback"],
    tier: "relevance",
    headline: "{screenHours} screen hours today — same as ever",
    body: "Some things never change, and that's why we're still here. Premium keeps us here.",
    cta: "Support Blink Eye",
  },
  {
    id: "wb-fb-1",
    variants: ["winback"],
    tier: "fallback",
    headline: "Long time no blink 💛",
    body: "Blink Eye is still free, still open source, still reminding. Premium is how you keep it that way.",
    cta: "View premium",
  },
  {
    id: "wb-fb-2",
    variants: ["winback"],
    tier: "fallback",
    headline: "The kettle's on",
    body: "Pull up a chair and take a proper break. Premium extras are waiting whenever you'd like them.",
    cta: "Support Blink Eye",
  },
];

function safeInt(value: number | null, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : fallback;
}

/// Which milestone (if any) the stats currently celebrate.
export function milestoneFor(stats: NudgeStats): string | null {
  const streak = safeInt(stats.streak);
  const total = safeInt(stats.totalBreaks);
  for (const m of STREAK_MILESTONES) {
    if (streak === m) return `streak-${m}`;
  }
  for (const club of BREAK_CLUBS) {
    if (total >= club.min && total < club.max) return club.key;
  }
  return null;
}

function daysLeftNote(stats: NudgeStats): string {
  const days = stats.daysLeft;
  if (days === null || !Number.isFinite(days) || days < 1 || days > 3) return "";
  return ` You have ${days} ${days === 1 ? "day" : "days"} of premium left — make ${days === 1 ? "it" : "them"} count.`;
}

/// Fill every `{slot}` in a string. Total function: unknown slots are left
/// as-is (tests forbid them in pooled copy), numbers always render safely.
export function fillSlots(text: string, stats: NudgeStats): string {
  const values: Record<string, string> = {
    totalBreaks: String(safeInt(stats.totalBreaks)),
    streak: String(safeInt(stats.streak)),
    bestStreak: String(safeInt(stats.bestStreak)),
    screenHours: String(safeInt(stats.screenHoursToday)),
    daysLeft: String(safeInt(stats.daysLeft)),
    daysLeftNote: daysLeftNote(stats),
    tenureDays: String(safeInt(stats.tenureDays)),
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

function poolFor(variant: NudgeVariant): NudgeTemplate[] {
  return TEMPLATES.filter((t) => t.variants.includes(variant));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/// Draw one template id from the per-variant+tier bag. The bag is persisted
/// (fresh webview every spawn, so in-memory bags can't survive) — draws are
/// without replacement, the bag refills + reshuffles on exhaustion, and a
/// refill never starts with the previously shown template when alternatives
/// exist. `random` is injectable for deterministic tests.
export function pickFromBag(
  candidateIds: string[],
  state: BagState,
  bagKey: string,
  random: () => number = Math.random,
): { id: string; state: BagState } {
  let bag = (state.bags[bagKey] ?? []).filter((id) => candidateIds.includes(id));
  if (bag.length === 0) {
    bag = shuffle(candidateIds, random);
    if (bag.length > 1 && bag[0] === state.lastId) {
      [bag[0], bag[1]] = [bag[1], bag[0]];
    }
  }
  const id = bag.shift() as string;
  return {
    id,
    state: { bags: { ...state.bags, [bagKey]: bag }, lastId: id },
  };
}

function wantedTier(stats: NudgeStats): NudgeTier {
  if (milestoneFor(stats) !== null) return "milestone";
  if (safeInt(stats.streak) >= STREAK_MIN) return "streak";
  if (safeInt(stats.totalBreaks) >= BREAKS_MIN) return "cumulative";
  if (
    stats.screenHoursToday !== null &&
    Number.isFinite(stats.screenHoursToday) &&
    stats.screenHoursToday >= SCREEN_HOURS_MIN
  ) {
    return "relevance";
  }
  return "fallback";
}

/// Compose the message for a nudge show: pick the strongest true tier,
/// draw fresh from its bag, fill slots. Pure and fully testable — the window
/// supplies stats and persists the returned bag state.
export function composeNudgeMessage(
  variant: NudgeVariant,
  stats: NudgeStats,
  bagState: BagState = { bags: {}, lastId: null },
  random: () => number = Math.random,
): { message: ComposedMessage; bagState: BagState } {
  const pool = poolFor(variant);
  const milestone = milestoneFor(stats);
  let tier = wantedTier(stats);
  let candidates = pool.filter(
    (t) =>
      t.tier === tier &&
      (tier !== "milestone" || t.milestone === milestone),
  );
  if (candidates.length === 0) {
    tier = "fallback";
    candidates = pool.filter((t) => t.tier === "fallback");
  }
  // Guaranteed non-empty: every variant pool ships ≥1 fallback template.
  const picked = pickFromBag(
    candidates.map((t) => t.id),
    bagState,
    `${variant}:${tier}`,
    random,
  );
  const template = candidates.find((t) => t.id === picked.id) as NudgeTemplate;
  return {
    message: {
      templateId: template.id,
      headline: fillSlots(template.headline, stats),
      body: fillSlots(template.body, stats),
      cta: template.cta,
    },
    bagState: picked.state,
  };
}

/// Today's screen-on hours from `UserScreenTime.db` (same query as
/// `useTimeCount`). Returns null when unreadable — the composer then falls
/// through to warmer tiers instead of rendering garbage.
export async function getTodayScreenHours(): Promise<number | null> {
  try {
    const db = await Database.load("sqlite:UserScreenTime.db");
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const records = (await db.select(
      "SELECT first_timestamp, second_timestamp FROM time_data WHERE date = ?",
      [dateStr],
    )) as Array<{ first_timestamp: number; second_timestamp: number }>;
    let totalMs = 0;
    for (const record of records) {
      const diff = record.second_timestamp - record.first_timestamp;
      if (diff > 0) totalMs += diff;
    }
    return Math.floor(totalMs / (3600 * 1000));
  } catch {
    return null;
  }
}

// =============================================================================
// Highlights — the "your Blink Eye story" recap shown above the ask.
// =============================================================================
//
// Same voice rules as the copy: only true, positive numbers. Zeros never
// render (a tile with 0 is dropped, a missing hero falls back to the logo).

export interface NudgeHero {
  /// Number to count up to.
  value: number;
  /// What the number counts ("breaks taken together").
  label: string;
  /// Felt translation of the number, or null when it would be meaningless.
  caption: string | null;
}

export type NudgeTileKind = "streak" | "bestStreak" | "tenure";

export interface NudgeTile {
  kind: NudgeTileKind;
  value: string;
  label: string;
}

export interface NudgeHighlights {
  hero: NudgeHero | null;
  tiles: NudgeTile[];
}

/// Human phrase for the total eye-rest time, e.g. "45 minutes", "7.3 hours".
export function formatRestTime(totalSeconds: number): string | null {
  const secs = safeInt(totalSeconds);
  if (secs < 60) return null;
  const minutes = Math.round(secs / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hours = secs / 3600;
  const shown = hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours);
  return `${shown} ${shown === 1 ? "hour" : "hours"}`;
}

/// Pick the recap the window celebrates. `breakSecs` is the configured break
/// length (null when unknown — the rest-time caption is then omitted).
export function nudgeHighlights(stats: NudgeStats, breakSecs: number | null): NudgeHighlights {
  const total = safeInt(stats.totalBreaks);
  const streak = safeInt(stats.streak);
  const best = safeInt(stats.bestStreak);
  const tenure = stats.tenureDays === null ? 0 : safeInt(stats.tenureDays);

  let hero: NudgeHero | null = null;
  if (total >= BREAKS_MIN) {
    const rest = breakSecs !== null && breakSecs > 0 ? formatRestTime(total * breakSecs) : null;
    hero = {
      value: total,
      label: total === 1 ? "break taken together" : "breaks taken together",
      caption: rest ? `≈ ${rest} your eyes got to rest` : null,
    };
  } else if (tenure >= 1) {
    hero = {
      value: tenure + 1,
      label: "days of kinder eyes",
      caption: "Every habit starts somewhere — yours started here.",
    };
  }

  const tiles: NudgeTile[] = [];
  if (streak >= 1) {
    tiles.push({ kind: "streak", value: `${streak}`, label: "day streak" });
  }
  if (best > streak && best >= STREAK_MIN) {
    tiles.push({ kind: "bestStreak", value: `${best}`, label: "best streak" });
  }
  if (tenure >= 1 && hero?.label !== "days of kinder eyes") {
    tiles.push({ kind: "tenure", value: `${tenure}`, label: tenure === 1 ? "day together" : "days together" });
  }
  return { hero, tiles };
}
