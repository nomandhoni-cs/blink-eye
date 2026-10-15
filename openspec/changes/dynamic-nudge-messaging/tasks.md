## 1. Message pool and composer module

- [x] 1.1 Create the `nudge-messaging` TS module with the `Template` shape (`id`, `variants`, headline/body with `{slots}`, CTA), three variant pools (`trial_ending`/`expired`/`winback`, ~8 templates each) written in the friendly-casual voice, and the module-level tone-guide doc comment.
- [x] 1.2 Implement `composeNudgeMessage(variant, stats)` with the milestone → streak (≥2) → cumulative (≥5) → screen-time relevance → warm fallback hierarchy, total slot filling (safe defaults, pluralization), and trial days-left note only for `trial_ending` with `days_remaining` 1–3.
- [x] 1.3 Implement freshness: per-variant shuffle-bag without replacement + reshuffle on exhaustion, never-repeat-`lastTemplateId` redraw, and per-template cooldown; make the picker injectable for deterministic tests.

## 2. Nudge-window wiring

- [x] 2.1 Wire the `/premium_nudge` component (from `premium-purchase-reminder`) to invoke `get_break_stats`, `get_trial_info`, and today's screen time on mount, call the composer, render headline/body/CTA with styled stat numbers, and persist the shown `templateId` in the nudge state.
- [x] 2.2 Implement the fallback path: any stat read failure or below-threshold stats renders the warm stat-free template with the support-framed CTA and no user-visible error.
- [x] 2.3 Retire `src/lib/supportMessages.ts` to fallback-only (or remove it) once the pool lands; keep `premiumNudgeEnabled` as the single kill-switch (no new flag).

## 3. Verification

- [x] 3.1 Unit-test every spec scenario: tone/banned-phrase rejection for all pooled strings, hierarchy picks (milestone/streak/cumulative/fallback/new-user celebration), variant-pool isolation, no back-to-back repeat, reshuffle fairness, fallback on failed reads, support-framed CTA present, snooze/skip words absent everywhere.
- [ ] 3.2 Manual QA in the nudge window: seeded Effect with a 6-day streak shows streak copy; a fresh profile shows start-celebration copy; two consecutive test shows never repeat; numbers render bold with no `undefined`/`NaN`. (Deferred: needs a running app — use `show_reminder_now` + the DebugPremiumPanel "Spawn nudge now" simulator.)
- [x] 3.3 Run `tsc`, `eslint`, and `openspec validate "dynamic-nudge-messaging"`; fix all findings.
