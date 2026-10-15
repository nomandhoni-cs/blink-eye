import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

/// Secondary nudge triggers that originate in the main window.
/// Primary triggers (`break_completed`/`break_dismissed`) are observed by the
/// Rust scheduler, which works even when this window is hidden in the tray.
///
/// Thin client by design: all eligibility, caps, conflict checks, and
/// spawning live in `maybe_show_premium_nudge`. This only forwards hints —
/// fire-and-forget, never blocking UI, never throwing.
export type NudgeTrigger = "stats_viewed" | "settings_saved" | "support_closed";

export function usePremiumNudge(): {
  fireTrigger: (trigger: NudgeTrigger) => void;
} {
  const fireTrigger = useCallback((trigger: NudgeTrigger) => {
    invoke("maybe_show_premium_nudge", { trigger }).catch((err) => {
      console.debug("[PremiumNudge] trigger ignored:", err);
    });
  }, []);

  return { fireTrigger };
}
