import { describe, it, expect } from "vitest";
import {
  TEMPLATES,
  BANNED_PHRASES,
  KNOWN_SLOTS,
  composeNudgeMessage,
  pickFromBag,
  milestoneFor,
  fillSlots,
  nudgeHighlights,
  formatRestTime,
  type BagState,
  type NudgeStats,
  type NudgeVariant,
} from "./nudge-messaging";

const emptyBag = (): BagState => ({ bags: {}, lastId: null });
const noRandom = () => 0;

function stats(overrides: Partial<NudgeStats> = {}): NudgeStats {
  return {
    totalBreaks: 0,
    streak: 0,
    bestStreak: 0,
    screenHoursToday: null,
    daysLeft: null,
    tenureDays: null,
    ...overrides,
  };
}

function tierOf(templateId: string): string {
  return TEMPLATES.find((t) => t.id === templateId)?.tier ?? "unknown";
}

describe("tone of voice", () => {
  it("no pooled string contains banned language", () => {
    for (const t of TEMPLATES) {
      const text = `${t.headline} ${t.body} ${t.cta}`.toLowerCase();
      for (const banned of BANNED_PHRASES) {
        expect(text, `${t.id} contains "${banned}"`).not.toContain(banned);
      }
    }
  });

  it("composes a warm, concrete message for an engaged user", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 48, streak: 6 }),
      emptyBag(),
      noRandom,
    );
    expect(message.headline).toContain("6");
    expect(`${message.headline} ${message.body}`).toMatch(/you|your/i);
  });
});

describe("stat personalization hierarchy", () => {
  it("celebrates a fresh streak milestone over everything else", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 200, streak: 10, bestStreak: 10 }),
      emptyBag(),
      noRandom,
    );
    expect(message.templateId).toBe("ms-streak-10");
  });

  it("celebrates break-count clubs", () => {
    const { message } = composeNudgeMessage(
      "winback",
      stats({ totalBreaks: 102, streak: 1 }),
      emptyBag(),
      noRandom,
    );
    expect(message.templateId).toBe("ms-club-100");
  });

  it("prefers streak identity over raw cumulative counts", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 200, streak: 6 }),
      emptyBag(),
      noRandom,
    );
    expect(tierOf(message.templateId)).toBe("streak");
  });

  it("uses cumulative proof for steady users without a streak", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 48, streak: 1 }),
      emptyBag(),
      noRandom,
    );
    expect(tierOf(message.templateId)).toBe("cumulative");
    expect(`${message.headline} ${message.body}`).toContain("48");
  });

  it("adds the days-left note only in trial_ending, phrased warmly", () => {
    const trial = composeNudgeMessage(
      "trial_ending",
      stats({ totalBreaks: 0, streak: 0, daysLeft: 2 }),
      emptyBag(),
      noRandom,
    );
    expect(trial.message.body).toContain("2 days");

    const one = composeNudgeMessage(
      "trial_ending",
      stats({ totalBreaks: 0, streak: 0, daysLeft: 1 }),
      emptyBag(),
      noRandom,
    );
    expect(one.message.body).toContain("1 day of premium left");

    for (const variant of ["expired", "winback"] as NudgeVariant[]) {
      const { message } = composeNudgeMessage(
        variant,
        stats({ totalBreaks: 48, streak: 1, daysLeft: 2 }),
        emptyBag(),
        noRandom,
      );
      expect(message.body, variant).not.toContain("premium left");
    }
  });

  it("celebrates new users instead of showing zeros", () => {
    const { message } = composeNudgeMessage("expired", stats(), emptyBag(), noRandom);
    expect(tierOf(message.templateId)).toBe("fallback");
    expect(`${message.headline} ${message.body}`).not.toMatch(/\b0 breaks\b/);
  });
});

describe("variant pools", () => {
  it("every variant has at least one fallback template", () => {
    for (const variant of ["trial_ending", "expired", "winback"] as NudgeVariant[]) {
      expect(
        TEMPLATES.filter((t) => t.variants.includes(variant) && t.tier === "fallback").length,
        variant,
      ).toBeGreaterThan(0);
    }
  });

  it("a compose call never returns another variant's template", () => {
    for (const variant of ["trial_ending", "expired", "winback"] as NudgeVariant[]) {
      for (let i = 0; i < 20; i++) {
        const { message } = composeNudgeMessage(
          variant,
          stats({ totalBreaks: 48, streak: 1, screenHoursToday: 3 }),
        );
        const template = TEMPLATES.find((t) => t.id === message.templateId);
        expect(template?.variants, `${variant} drew ${message.templateId}`).toContain(variant);
      }
    }
  });

  it("expired copy never uses trial-countdown language", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 48, streak: 1, daysLeft: 2 }),
      emptyBag(),
      noRandom,
    );
    expect(message.body).not.toContain("premium left");
  });
});

describe("freshness", () => {
  it("never repeats the previously shown template on refill", () => {
    const { id } = pickFromBag(
      ["te-streak-1", "te-streak-2"],
      { bags: {}, lastId: "te-streak-1" },
      "trial_ending:streak",
      noRandom,
    );
    expect(id).toBe("te-streak-2");
  });

  it("never shows the same message twice in a row across shows", () => {
    let bag = emptyBag();
    let last = "";
    for (let i = 0; i < 30; i++) {
      const { message, bagState } = composeNudgeMessage(
        "expired",
        stats({ totalBreaks: 48, streak: 1 }),
        bag,
      );
      expect(message.templateId, `show ${i}`).not.toBe(last);
      last = message.templateId;
      bag = bagState;
    }
  });

  it("refills the bag on exhaustion and keeps dealing", () => {
    const candidates = ["a", "b"];
    let state = emptyBag();
    const seen = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const picked = pickFromBag(candidates, state, "k", noRandom);
      seen.add(picked.id);
      state = picked.state;
    }
    expect(seen).toEqual(new Set(["a", "b"]));
  });
});

describe("fallback safety", () => {
  it("fallback templates contain no numeric slots (only the days-note)", () => {
    for (const t of TEMPLATES.filter((t) => t.tier === "fallback")) {
      const slots = [...`${t.headline} ${t.body}`.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const slot of slots) {
        expect(slot, `${t.id} uses {${slot}}`).toBe("daysLeftNote");
      }
    }
  });

  it("never renders undefined, NaN, or null with missing stats", () => {
    for (const variant of ["trial_ending", "expired", "winback"] as NudgeVariant[]) {
      const { message } = composeNudgeMessage(
        variant,
        stats({ screenHoursToday: NaN, daysLeft: NaN }),
        emptyBag(),
        noRandom,
      );
      const text = `${message.headline} ${message.body} ${message.cta}`;
      expect(text).not.toMatch(/undefined|NaN|null/);
    }
  });

  it("every slot used in pooled copy is a known slot", () => {
    for (const t of TEMPLATES) {
      const slots = [...`${t.headline} ${t.body}`.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const slot of slots) {
        expect(KNOWN_SLOTS, `${t.id} uses {${slot}}`).toContain(slot);
      }
    }
  });
});

describe("open-source support framing", () => {
  it("every CTA references support or premium — never pressure verbs", () => {
    for (const t of TEMPLATES) {
      expect(t.cta, t.id).toMatch(/support|premium/i);
      expect(t.cta.toLowerCase(), t.id).not.toMatch(/buy now|pay\b|or else/);
    }
  });
});

describe("failure stats stay out of copy", () => {
  it("no template mentions snoozing, skipping, or missed breaks", () => {
    // Behavior words only — warm lines like "we missed you" are fine.
    const failureWords = [
      "snooze",
      "snoozed",
      "snoozing",
      "skipped",
      "skipping",
      "missed break",
      "missed breaks",
      "failed",
    ];
    for (const t of TEMPLATES) {
      const text = `${t.headline} ${t.body} ${t.cta}`.toLowerCase();
      for (const word of failureWords) {
        expect(text, `${t.id} contains "${word}"`).not.toContain(word);
      }
    }
  });

  it("heavy snoozers still get clean copy", () => {
    const { message } = composeNudgeMessage(
      "expired",
      stats({ totalBreaks: 48, streak: 1 }),
      emptyBag(),
      noRandom,
    );
    expect(`${message.headline} ${message.body}`.toLowerCase()).not.toMatch(/snooz|skip/);
  });
});

describe("milestoneFor", () => {
  it("detects streak milestones and break clubs", () => {
    expect(milestoneFor(stats({ streak: 5 }))).toBe("streak-5");
    expect(milestoneFor(stats({ streak: 30 }))).toBe("streak-30");
    expect(milestoneFor(stats({ totalBreaks: 55 }))).toBe("club-50");
    expect(milestoneFor(stats({ totalBreaks: 249 }))).toBeNull();
    expect(milestoneFor(stats({ totalBreaks: 260 }))).toBe("club-250");
  });
});

describe("fillSlots", () => {
  it("fills every known slot safely", () => {
    const filled = fillSlots(
      "{totalBreaks} {streak} {bestStreak} {screenHours} {daysLeft}{daysLeftNote} {tenureDays}",
      stats({ totalBreaks: 48, streak: 6, bestStreak: 7, screenHoursToday: 3, daysLeft: 2, tenureDays: 20 }),
    );
    expect(filled).toBe("48 6 7 3 2 You have 2 days of premium left — make them count. 20");
  });
});

describe("highlights recap", () => {
  it("celebrates breaks with a felt rest-time caption", () => {
    const h = nudgeHighlights(stats({ totalBreaks: 876, streak: 7, bestStreak: 113, tenureDays: 140 }), 30);
    expect(h.hero?.value).toBe(876);
    expect(h.hero?.caption).toBe("≈ 7.3 hours your eyes got to rest");
    expect(h.tiles.map((t) => t.kind)).toEqual(["streak", "bestStreak", "tenure"]);
  });

  it("never renders zeros", () => {
    const h = nudgeHighlights(stats(), 20);
    expect(h.hero).toBeNull();
    expect(h.tiles).toEqual([]);
  });

  it("new users get celebrated by tenure, not empty counts", () => {
    const h = nudgeHighlights(stats({ totalBreaks: 2, tenureDays: 4 }), 20);
    expect(h.hero?.label).toBe("days of kinder eyes");
    expect(h.hero?.value).toBe(5);
    expect(h.tiles.some((t) => t.kind === "tenure")).toBe(false);
  });

  it("drops the caption when break length is unknown", () => {
    expect(nudgeHighlights(stats({ totalBreaks: 40 }), null).hero?.caption).toBeNull();
  });

  it("formats rest time for humans", () => {
    expect(formatRestTime(30)).toBeNull();
    expect(formatRestTime(60)).toBe("1 minute");
    expect(formatRestTime(45 * 60)).toBe("45 minutes");
    expect(formatRestTime(3600)).toBe("1 hour");
    expect(formatRestTime(26_280)).toBe("7.3 hours");
    expect(formatRestTime(50 * 3600)).toBe("50 hours");
  });

  it("highlight copy stays inside the tone rules", () => {
    const h = nudgeHighlights(stats({ totalBreaks: 2, tenureDays: 1 }), 20);
    const text = `${h.hero?.label} ${h.hero?.caption}`.toLowerCase();
    for (const banned of BANNED_PHRASES) expect(text).not.toContain(banned);
  });
});
