import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  entryForStyle,
  resolvePreviewStyle,
  SHUFFLE_STYLE,
} from "../backgrounds/registry";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Flame, Check, Shuffle } from "lucide-react";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { useTrigger } from "../contexts/TriggerReRender";
import { cn } from "../lib/utils";

// Clean scene previews — static artwork with no reminder overlay
import defaultThumb from "../assets/thumbnails/default-clean.webp";
import auroraThumb from "../assets/thumbnails/aurora-clean.webp";
import freespritThumb from "../assets/thumbnails/free-spirit-clean.webp";
import particleThumb from "../assets/thumbnails/particle-wave-clean.webp";
import starryThumb from "../assets/thumbnails/starry-background-clean.webp";
import beamThumb from "../assets/thumbnails/beam-of-life-clean.webp";
import meteorThumb from "../assets/thumbnails/shooting-meteor-clean.webp";
import gradientThumb from "../assets/thumbnails/plain-gradient-clean.webp";
import canvasThumb from "../assets/thumbnails/canvas-shapes-clean.webp";
import iridescenceLight from "../assets/thumbnails/iridescence-light.webp";
import iridescenceDark from "../assets/thumbnails/iridescence-dark.webp";
import balatroLight from "../assets/thumbnails/balatro-light.webp";
import balatroDark from "../assets/thumbnails/balatro-dark.webp";
import acidSquaresLight from "../assets/thumbnails/acid-squares-light.webp";
import acidSquaresDark from "../assets/thumbnails/acid-squares-dark.webp";
import antigravityLight from "../assets/thumbnails/antigravity-light.webp";
import antigravityDark from "../assets/thumbnails/antigravity-dark.webp";
import ballpitLight from "../assets/thumbnails/ballpit-light.webp";
import ballpitDark from "../assets/thumbnails/ballpit-dark.webp";
import crtWarpLight from "../assets/thumbnails/crt-warp-light.webp";
import crtWarpDark from "../assets/thumbnails/crt-warp-dark.webp";
import darkVeilLight from "../assets/thumbnails/dark-veil-light.webp";
import darkVeilDark from "../assets/thumbnails/dark-veil-dark.webp";
import ditherLight from "../assets/thumbnails/dither-light.webp";
import ditherDark from "../assets/thumbnails/dither-dark.webp";
import dotGridLight from "../assets/thumbnails/dot-grid-light.webp";
import dotGridDark from "../assets/thumbnails/dot-grid-dark.webp";
import faultyTerminalLight from "../assets/thumbnails/faulty-terminal-light.webp";
import faultyTerminalDark from "../assets/thumbnails/faulty-terminal-dark.webp";
import ferrofluidLight from "../assets/thumbnails/ferrofluid-light.webp";
import ferrofluidDark from "../assets/thumbnails/ferrofluid-dark.webp";
import floatingLinesLight from "../assets/thumbnails/floating-lines-light.webp";
import floatingLinesDark from "../assets/thumbnails/floating-lines-dark.webp";
import galaxyLight from "../assets/thumbnails/galaxy-light.webp";
import galaxyDark from "../assets/thumbnails/galaxy-dark.webp";

type ThemeThumbnail = string | { light: string; dark: string };

const thumbMap: Record<string, ThemeThumbnail> = {
  default: defaultThumb,
  aurora: auroraThumb,
  freesprit: freespritThumb,
  particleBackground: particleThumb,
  starryBackground: starryThumb,
  beamoflife: beamThumb,
  shootingmeteor: meteorThumb,
  plainGradientAnimation: gradientThumb,
  canvasShapes: canvasThumb,
  iridescence: { light: iridescenceLight, dark: iridescenceDark },
  balatro: { light: balatroLight, dark: balatroDark },
  acidSquares: { light: acidSquaresLight, dark: acidSquaresDark },
  antigravity: { light: antigravityLight, dark: antigravityDark },
  ballpit: { light: ballpitLight, dark: ballpitDark },
  crtWarp: { light: crtWarpLight, dark: crtWarpDark },
  darkVeil: { light: darkVeilLight, dark: darkVeilDark },
  dither: { light: ditherLight, dark: ditherDark },
  dotGrid: { light: dotGridLight, dark: dotGridDark },
  faultyTerminal: { light: faultyTerminalLight, dark: faultyTerminalDark },
  ferrofluid: { light: ferrofluidLight, dark: ferrofluidDark },
  floatingLines: { light: floatingLinesLight, dark: floatingLinesDark },
  galaxy: { light: galaxyLight, dark: galaxyDark },
};

const styles = [
  { value: "default", label: "Default" },
  // Not a scene of its own — the Rust scheduler picks a new scene every break.
  { value: SHUFFLE_STYLE, label: "Shuffle" },
  { value: "aurora", label: "Aurora" },
  { value: "freesprit", label: "Free Spirit" },
  { value: "particleBackground", label: "Infinite Wave Background" },
  { value: "starryBackground", label: "Starry Background" },
  { value: "beamoflife", label: "Beam of Life" },
  { value: "shootingmeteor", label: "Shooting Meteor" },
  { value: "plainGradientAnimation", label: "Plain Gradient Animation" },
  // { value: "polygonAnimation", label: "Polygon Animation" },
  { value: "canvasShapes", label: "Bouncy Balls" },
  { value: "iridescence", label: "Iridescence" },
  { value: "balatro", label: "Balatro" },
  { value: "acidSquares", label: "Acid Squares" },
  { value: "antigravity", label: "Antigravity" },
  { value: "ballpit", label: "Ballpit" },
  { value: "crtWarp", label: "CRT Warp" },
  { value: "darkVeil", label: "Dark Veil" },
  { value: "dither", label: "Dither" },
  { value: "dotGrid", label: "Dot Grid" },
  { value: "faultyTerminal", label: "Faulty Terminal" },
  { value: "ferrofluid", label: "Ferrofluid" },
  { value: "floatingLines", label: "Floating Lines" },
  { value: "galaxy", label: "Galaxy" },
];

/** Two-by-two collage of scene thumbnails, hinting at the shuffle rotation. */
function ShufflePreview() {
  const collage = [
    thumbMap.aurora,
    thumbMap.galaxy,
    thumbMap.balatro,
    thumbMap.particleBackground,
  ].map((thumb) => (typeof thumb === "string" ? thumb : thumb.dark));

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2">
      {collage.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
        <Shuffle className="h-8 w-8 text-white drop-shadow-md" strokeWidth={2.5} />
      </div>
    </div>
  );
}

export default function ReminderStyles() {
  const { canAccessPremiumFeatures } = usePremiumFeatures();
  const { triggerUpdate } = useTrigger();
  const [backgroundStyle, setBackgroundStyle] =
    useState<string>(SHUFFLE_STYLE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackgroundStyle = async () => {
      try {
        const savedStyle = await invoke<string | null>("get_config_string", { key: "reminderBackgroundStyle" });
        if (savedStyle) {
          setBackgroundStyle(savedStyle);
        }
      } catch (err) {
        console.error("Error fetching background style:", err);
        setError("Failed to load saved theme. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackgroundStyle();
  }, []);

  /**
   * Selecting a card previews it fullscreen. Premium users also persist it;
   * free users only update the preview-only key, so picking a card can never
   * unlock a scene for the real scheduler.
   */
  const handleSelectTheme = async (selectedStyle: string) => {
    try {
      setIsLoading(true);
      if (canAccessPremiumFeatures) {
        await invoke("update_reminder_setting", { key: "reminderBackgroundStyle", value: selectedStyle });
        triggerUpdate();
      } else {
        await invoke("update_reminder_setting", {
          key: "reminderBackgroundStylePreview",
          value: selectedStyle,
        });
      }
      setBackgroundStyle(selectedStyle);
      openReminderWindow(selectedStyle);
      console.log("Background style selected:", selectedStyle);
    } catch (err) {
      console.error("Error saving theme:", err);
      setError("Failed to save theme. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openReminderWindow = (style: string) => {
    const isPremium = canAccessPremiumFeatures;
    // Free users only ever preview the blank default scene. `shuffle` has no
    // entry of its own, so a shuffle selection previews one random scene —
    // the same helper the scheduler uses to pick per break.
    const requestedStyle = isPremium
      ? resolvePreviewStyle(style, null)
      : "default";
    const entry = entryForStyle(requestedStyle);
    const webview = new WebviewWindow("reminder_monitor_0", {
      url: `/${entry}?config=${encodeURIComponent(JSON.stringify({ isPremium }))}`,
      title: "Take A Break Reminder - Blink Eye",
      fullscreen: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    });
    webview.once("tauri://error", (e) => {
      console.error("Error creating reminder window:", e);
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-heading tracking-tight">Background Style</h3>
        <p className="text-sm text-muted-foreground">
          Choose from 22 animated scenes for your break reminders. Select any
          card to preview it fullscreen. Shuffle shows a different scene on
          every break — pick one specific scene whenever you want to settle
          down.
        </p>
        {!canAccessPremiumFeatures && (
          <p className="text-xs text-muted-foreground/80">
            Free and expired-trial accounts break on the blank default screen.
            A license unlocks every scene, including Shuffle.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {styles.map((style) => {
          // Free users see the blank default scene on every break, so a saved
          // `shuffle` is shown honestly as "not active" for them.
          const isActive = canAccessPremiumFeatures
            ? backgroundStyle === style.value
            : style.value === "default";
          const preview = thumbMap[style.value];
          return (
            <div
              key={style.value}
              role="button"
              tabIndex={0}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl border bg-card text-card-foreground transition-all duration-300 ease-out outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary shadow-md ring-1 ring-primary"
                  : "border-border shadow-sm hover:border-primary/50 hover:shadow-md"
              )}
              onClick={() => handleSelectTheme(style.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectTheme(style.value);
                }
              }}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {style.value === SHUFFLE_STYLE ? (
                  <ShufflePreview />
                ) : typeof preview === "string" ? (
                  <img
                    src={preview}
                    alt={`${style.label} preview`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <img
                      src={preview.light}
                      alt={`${style.label} light mode preview`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                      loading="lazy"
                    />
                    <img
                      src={preview.dark}
                      alt={`${style.label} dark mode preview`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">Light</span>
                    <span className="absolute bottom-2 right-2 rounded bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">Dark</span>
                  </>
                )}
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Premium Badge */}
                {style.value !== "default" && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-amber-500/30 bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 shadow-sm backdrop-blur-md dark:text-amber-400">
                    <Flame className="h-3 w-3" />
                    Premium
                  </div>
                )}

                {/* Active Checkmark Badge */}
                {isActive && (
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="truncate text-sm font-medium tracking-tight">
                  {style.label}
                </h4>
                {style.value === SHUFFLE_STYLE && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    A new scene every break
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
