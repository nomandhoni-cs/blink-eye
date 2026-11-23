import { describe, expect, test } from "bun:test";
import {
  buildBackgroundEntry,
  DEFAULT_BACKGROUND_ENTRY,
  entryForStyle,
  normalizeStyle,
  pickShuffleStyle,
  resolvePreviewStyle,
  SHUFFLE_POOL,
  SHUFFLE_STYLE,
} from "../src/backgrounds/registry";

/**
 * `shuffle` is the default for new installs: every break shows a different
 * animated scene, then the user can settle on one. These tests pin the two
 * rules that keep it honest — it never falls back to the blank default scene,
 * and it never repeats the immediately previous scene.
 */
describe("reminder background shuffle", () => {
  test("shuffle pool covers every scene except the blank default", () => {
    expect(SHUFFLE_POOL).not.toContain("default");
    expect(SHUFFLE_POOL).not.toContain(SHUFFLE_STYLE);
    expect(SHUFFLE_POOL.length).toBeGreaterThan(1);
  });

  test("every shuffled scene maps to a real entry file", () => {
    for (const style of SHUFFLE_POOL) {
      expect(entryForStyle(style)).not.toBe(DEFAULT_BACKGROUND_ENTRY);
    }
  });

  test("never picks the blank default scene", () => {
    for (let i = 0; i < 500; i++) {
      expect(pickShuffleStyle()).not.toBe("default");
    }
  });

  test("never repeats the previous scene", () => {
    for (const previous of SHUFFLE_POOL) {
      for (let i = 0; i < 50; i++) {
        expect(pickShuffleStyle(previous)).not.toBe(previous);
      }
    }
  });

  test("honours the injected random source", () => {
    // `0` → first candidate, `0.999…` → last candidate; neither is `previous`.
    const first = pickShuffleStyle("aurora", () => 0);
    const last = pickShuffleStyle("aurora", () => 0.999_999);
    expect(first).not.toBe("aurora");
    expect(last).not.toBe("aurora");
    expect(first).not.toBe(last);
  });

  test("shuffle is preserved by the style normalizer", () => {
    expect(normalizeStyle(SHUFFLE_STYLE)).toBe(SHUFFLE_STYLE);
    expect(normalizeStyle("not-a-style")).toBe("default");
  });

  test("previews resolve shuffle to a concrete scene that can open", () => {
    const preview = resolvePreviewStyle(SHUFFLE_STYLE);
    expect(preview).not.toBe(SHUFFLE_STYLE);
    expect(preview).not.toBe("default");
    expect(entryForStyle(preview)).not.toBe(DEFAULT_BACKGROUND_ENTRY);
  });

  test("previews prefer the style the user just had", () => {
    expect(resolvePreviewStyle(SHUFFLE_STYLE, "galaxy")).toBe("galaxy");
    // A fallback that is itself `default` still yields a real scene.
    expect(resolvePreviewStyle(SHUFFLE_STYLE, "default")).not.toBe("default");
  });

  test("fixed styles pass through untouched", () => {
    expect(resolvePreviewStyle("balatro")).toBe("balatro");
    expect(resolvePreviewStyle("default")).toBe("default");
  });

  test("free users are gated to the blank default scene", () => {
    // Mirrors the `is_premium` gate in `start_break()` (reminder_scheduler.rs).
    const backgroundFor = (isPremium: boolean, saved) =>
      isPremium ? resolvePreviewStyle(saved) : "default";

    expect(backgroundFor(false, SHUFFLE_STYLE)).toBe("default");
    expect(backgroundFor(false, "galaxy")).toBe("default");
    expect(backgroundFor(true, "galaxy")).toBe("galaxy");
    expect(backgroundFor(true, SHUFFLE_STYLE)).not.toBe("default");
  });

  test("buildBackgroundEntry exposes the shuffle card without a scene", () => {
    const shuffleEntry = buildBackgroundEntry(SHUFFLE_STYLE);
    expect(shuffleEntry.entry).toBe(DEFAULT_BACKGROUND_ENTRY);
    expect(shuffleEntry.label).toBe("Shuffle");
  });
});
