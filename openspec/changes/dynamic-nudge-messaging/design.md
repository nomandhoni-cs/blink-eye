## Context

The `premium-purchase-reminder` change plans a standalone `premium_nudge` window with three copy variants (`trial_ending` / `expired` / `winback`), but leaves the actual words as an open question. Today's copy story is 21 near-identical static strings in `src/lib/supportMessages.ts` — a fixed message every time trains users to ignore it. The personalization inputs already exist: `get_break_stats` (Rust, `snooze_tracker.rs` on `appconfig.db`) yields `totalBreaksCompleted`, `breakStreak`/`bestBreakStreak`; `get_trial_info` yields install age and `days_remaining`; today's screen time comes from `UserScreenTime.db` via the existing time-count path. The nudge window is a frontend webview (`/premium_nudge` route), so all three reads are reachable at show-time with existing invokes.

## Goals / Non-Goals

**Goals:**
- Every nudge reads like a friendly note about *your* progress, never a form letter: warm, casual, concrete numbers, open-source support framing.
- No two consecutive nudges ever show the same message, even months apart.
- Zero-stat and missing-stat cases always degrade to warm copy — never "0 breaks", never `undefined`.
- All copy local/offline and structured (keyed templates + named slots) so future multilingual support swaps the pool without touching logic.

**Non-Goals:**
- Server-generated or LLM copy (offline, deterministic, zero cost, zero privacy review).
- A/B testing framework or analytics pings — rotation is for freshness, not experimentation.
- Changing nudge triggers, caps, trial/license logic, checkout, or paywall contents (owned by `premium-purchase-reminder`).
- Full multilingual pools now — structure-ready only.

## Decisions

### 1. Compose the message at show-time in the nudge window (frontend TS), not in Rust
- **What:** A `nudge-messaging` TS module exposes `composeNudgeMessage(variant, stats) → { templateId, headline, body, cta }`. The `/premium_nudge` component calls it on mount with fresh invokes; Rust stays presentation-free.
- **Why:** Copy is presentation — it needs styling (bold numbers), pluralization, and previewability that belong in the view layer. Every stat already has a TS invoke path, and keeping strings out of Rust keeps future i18n a frontend-only swap.
- **Alternative considered:** Rust composes and returns the final string — rejected (localization-hostile, bakes English into the backend, can't style slots).

### 2. Slot-based template pools, one pool per variant
- **What:** Templates shaped as `{ id, variants: [...], headline, body, slots: ("totalBreaks"|"streak"|"bestStreak"|"screenHours"|"daysLeft"|"tenureDays")[], cta }`. Pools: `trial_ending` (gentle urgency + warmth, may use `{daysLeft}`), `expired` (welcome-back + "look what you built"), `winback` (missed-you + support framing). The CTA always frames open-source support ("Support Blink Eye & unlock premium — themes, multi-monitor, and keeping it free for everyone"), never threats or fake countdowns.
- **Why:** Emotional register differs per segment — trial-ending urgency copy shown to an expired user reads as nagging, and win-back warmth shown pre-expiry wastes urgency. Variant pools make the wrong-register bug structurally impossible.
- **Alternative considered:** One flat pool for all variants — rejected (mixes registers; every render would need ad-hoc variant guards).

### 3. Personalization hierarchy: milestone → streak → cumulative → relevance → fallback
- **What:** Pick the strongest true proof point: (a) milestone just hit (new best streak, 50/100/250-break club) → celebratory template; (b) `streak ≥ 2` → identity line ("6-day streak — that's a habit"); (c) `totalBreaks ≥ 5` → cumulative line ("48 full breaks together"); (d) screen time today → care line ("3h of screen time, and you still looked away"); (e) otherwise warm fallback that never mentions numbers. Trial-ending appends the days-left note only when `days_remaining ≤ 3`.
- **Why:** Identity ("you're someone who takes breaks") and milestones convert better than raw counts, and the hierarchy guarantees the single most flattering *true* fact is always the one shown.
- **Alternative considered:** Always show all stats — rejected (cluttered card, dilutes the emotional punch, small window).

### 4. Freshness via shuffle-bag + never-repeat-last + per-template cooldown
- **What:** Per variant, keep a shuffle-bag (random order without replacement, reshuffle on exhaustion). Persist `lastTemplateId` in the existing nudge state; on compose, redraw while the pick equals the last shown. Templates also carry a cooldown (e.g., not again within 2 shows).
- **Why:** Pure random repeats ~1/N of the time and nudges are 72h+ apart — a repeat after months apart feels broken ("didn't I see this?"). Shuffle-bag gives guaranteed variety with zero server and testable determinism (inject the picker in tests).
- **Alternative considered:** Pure `Math.random()` per show — rejected (visible repeats); server-driven rotation — rejected (privacy/offline goals).

### 5. Tone rules enforced as code, not vibes
- **What:** A tone guide lives as the module's doc comment plus a banned-phrase list (`last chance`, `act now`, `you'll lose`, guilt words like `lazy`, `ignore`) checked in unit tests — every pooled string must pass. Voice: second person, one concrete number, at most one emoji, short sentences. New-user copy celebrates the start ("Day one of kinder eyes — nice").
- **Why:** Tone drifts the moment a second contributor adds a line; a lintable list keeps "friendly casual" from decaying into marketing-speak.
- **Alternative considered:** Style guide in docs only — rejected (unenforced guides rot; tests don't).

### 6. Core user-touching facts mapped to slots
- **What:** The only stats copy may touch: breaks completed (effort), streak/best streak (identity), screen hours protected today (care received), days left (gentle urgency, trial pool only), tenure (belonging: "3 weeks together"). Snooze counts and skipped breaks are NEVER referenced — the nudge must not know about failures.
- **Why:** The request asks what "core things you can touch and relate with a user" — effort, identity, care, belonging. Surfacing snoozes/skips would feel like surveillance and punish the exact behavior the app exists to help with.
- **Alternative considered:** Using snooze/skip data for "we noticed you snooze" copy — rejected (creepy, shaming, review poison).

## Risks / Trade-offs

- [Risk] Stats unreadable in the nudge window (DB hiccup, fresh profile) → Mitigation: fallback requirement — warm generic copy, and compose never renders `undefined`/`NaN` (slot fill is total: every slot has a formatter with a safe default).
- [Risk] "0 breaks" shaming new users → Mitigation: thresholds (`streak ≥ 2`, `totalBreaks ≥ 5`) gate every stat line; below threshold the hierarchy falls through to celebration-of-start copy.
- [Risk] Pool exhausts over a 10-lifetime-show cap and repeats anyway → Mitigation: ≥8 templates per variant plus ever-changing slot values, so even a repeated template reads differently; shuffle-bag maximizes distance between repeats.
- [Risk] Banned-phrase list is English-only and blocks future i18n → Mitigation: list lives beside the English pool and is per-locale by construction (each locale ships its own pool + its own list).
- [Risk] Two changes touching the nudge window diverge → Mitigation: this change outputs exactly what `premium-purchase-reminder` Decision 5 consumes (`composeNudgeMessage` contract); apply window-first or together, and the window renders whatever the composer returns.

## Migration Plan

- Additive: new module + pool; `supportMessages.ts` stays untouched as the interim fallback until the pool lands, then is retired to fallback-only or removed.
- Rollout behind the existing `premiumNudgeEnabled` kill-switch (no new flag); rollback = revert to static fallback line.
- No DB migration: `lastTemplateId` rides inside the existing nudge-state record.

## Open Questions

- Pool size per variant (propose 8–10) and emoji policy (propose max one, or zero — maintainer call).
- Whether CTA button text also rotates from a small set (propose yes: 3 variants) or stays fixed for recognizability.
- Final wording sign-off stays with the maintainer — the pool file is designed for easy word-tweaks without logic changes.
