/**
 * Single source of truth for the mapping between style names and Vite entry files.
 *
 * Why: Each background is a separate Vite entry (its own HTML + TSX bundle).
 * The Rust scheduler picks the right entry from this map. Adding a new
 * background = append a row here + drop one HTML/TSX file pair + register
 * the entry in vite.config.ts.
 *
 * Format: `"aurora" -> "reminder-aurora.html"`. The Vite input must match
 * the `entry_name` field in vite.config.ts.
 */

export type BackgroundStyle =
  | "default"
  | "shuffle"
  | "aurora"
  | "freesprit"
  | "beamoflife"
  | "particleBackground"
  | "starryBackground"
  | "shootingmeteor"
  | "plainGradientAnimation"
  | "canvasShapes"
  | "iridescence"
  | "balatro"
  | "acidSquares"
  | "antigravity"
  | "ballpit"
  | "crtWarp"
  | "darkVeil"
  | "dither"
  | "dotGrid"
  | "faultyTerminal"
  | "ferrofluid"
  | "floatingLines"
  | "galaxy";

export interface BackgroundEntry {
  /** Style key persisted in appconfig.db (`reminderBackgroundStyle`). */
  style: BackgroundStyle;
  /** Vite/Rollup input filename. */
  entry: string;
  /** Display label for the style picker UI. */
  label: string;
}

export const BACKGROUND_REGISTRY: BackgroundEntry[] = [
  { style: "default",               entry: "reminder-default.html",             label: "Default" },
  { style: "aurora",                entry: "reminder-aurora.html",              label: "Aurora" },
  { style: "freesprit",             entry: "reminder-freesprit.html",           label: "Free Spirit" },
  { style: "beamoflife",            entry: "reminder-beamoflife.html",          label: "Beam of Life" },
  { style: "particleBackground",    entry: "reminder-particles.html",           label: "Particle Wave" },
  { style: "starryBackground",      entry: "reminder-starry.html",              label: "Starry Background" },
  { style: "shootingmeteor",        entry: "reminder-meteor.html",              label: "Shooting Meteor" },
  { style: "plainGradientAnimation", entry: "reminder-gradient.html",          label: "Gradient Animation" },
  { style: "canvasShapes",          entry: "reminder-canvas.html",              label: "Bouncy Balls" },
  { style: "iridescence",            entry: "reminder-iridescence.html",         label: "Iridescence" },
  { style: "balatro",                entry: "reminder-balatro.html",             label: "Balatro" },
  { style: "acidSquares",            entry: "reminder-acidsquares.html",         label: "Acid Squares" },
  { style: "antigravity",             entry: "reminder-antigravity.html",         label: "Antigravity" },
  { style: "ballpit",                 entry: "reminder-ballpit.html",             label: "Ballpit" },
  { style: "crtWarp",                 entry: "reminder-crtwarp.html",             label: "CRT Warp" },
  { style: "darkVeil",                entry: "reminder-darkveil.html",            label: "Dark Veil" },
  { style: "dither",                  entry: "reminder-dither.html",              label: "Dither" },
  { style: "dotGrid",                 entry: "reminder-dotgrid.html",             label: "Dot Grid" },
  { style: "faultyTerminal",          entry: "reminder-faultyterminal.html",      label: "Faulty Terminal" },
  { style: "ferrofluid",              entry: "reminder-ferrofluid.html",          label: "Ferrofluid" },
  { style: "floatingLines",           entry: "reminder-floatinglines.html",       label: "Floating Lines" },
  { style: "galaxy",                  entry: "reminder-galaxy.html",              label: "Galaxy" },
];

export const DEFAULT_BACKGROUND_ENTRY = "reminder-default.html";

/**
 * Style key meaning "pick a random animated scene for every break".
 *
 * It is not a Vite entry: the Rust scheduler resolves it to one concrete
 * scene per break (a different one each time), so this key never reaches
 * `entryForStyle()`. Kept at the top of the picker so new installs taste the
 * full theme gallery before settling on one.
 */
export const SHUFFLE_STYLE = "shuffle" as const;

/** Scene keys that `shuffle` rotates through — every animated scene. */
export const SHUFFLE_POOL: BackgroundStyle[] = BACKGROUND_REGISTRY.filter(
  (background) => background.style !== "default",
).map((background) => background.style);

/**
 * Pick a random scene for a break, never repeating `previous`.
 *
 * `previous` is the scene the last shuffle break showed (or the current fixed
 * style when the user just switched to shuffle), so consecutive breaks always
 * look different. Mirrors `pick_shuffled_style()` in
 * `src-tauri/src/reminder_scheduler.rs`.
 */
export function pickShuffleStyle(
  previous?: string | null,
  random: () => number = Math.random,
): BackgroundStyle {
  // `default` is the blank screen, never shuffled in; `shuffle` is not a scene.
  const pool = SHUFFLE_POOL.filter((style) => style !== previous);
  const candidates = pool.length > 0 ? pool : SHUFFLE_POOL;
  const index = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(random() * candidates.length)),
  );
  return candidates[index] ?? "aurora";
}

/** Look up the entry filename for a given style. Falls back to default. */
export function entryForStyle(style: string | null | undefined): string {
  const match = BACKGROUND_REGISTRY.find((b) => b.style === style);
  return match ? match.entry : `${DEFAULT_BACKGROUND_ENTRY}`;
}

/**
 * Resolve a saved style to something that can be previewed or opened.
 *
 * `shuffle` has no entry of its own, so callers get a concrete scene:
 * `fallbackStyle` when it can be previewed, otherwise a random one.
 */
export function resolvePreviewStyle(
  style: string | null | undefined,
  fallbackStyle?: string | null,
  random: () => number = Math.random,
): BackgroundStyle {
  const normalized = normalizeStyle(style);
  if (normalized !== SHUFFLE_STYLE) return normalized;

  const fallback = normalizeStyle(fallbackStyle);
  if (fallback !== "default" && fallback !== SHUFFLE_STYLE) return fallback;
  return pickShuffleStyle(fallbackStyle, random);
}

/**
 * Display data for a style card.
 *
 * `shuffle` has no entry of its own, so it reports the default entry (the
 * picker draws a scene collage instead) and a friendly label.
 */
export function buildBackgroundEntry(style: string): BackgroundEntry {
  const match = BACKGROUND_REGISTRY.find((b) => b.style === style);
  if (match) return match;
  if (style === SHUFFLE_STYLE) {
    return {
      style: SHUFFLE_STYLE,
      entry: DEFAULT_BACKGROUND_ENTRY,
      label: "Shuffle",
    };
  }
  return {
    style: "default",
    entry: DEFAULT_BACKGROUND_ENTRY,
    label: "Default",
  };
}

/** Ensure style is in the registry; return canonical key or "default". */
export function normalizeStyle(style: string | null | undefined): BackgroundStyle {
  if (style === SHUFFLE_STYLE) return SHUFFLE_STYLE;
  const found = BACKGROUND_REGISTRY.find((b) => b.style === style);
  return (found?.style ?? "default") as BackgroundStyle;
}
