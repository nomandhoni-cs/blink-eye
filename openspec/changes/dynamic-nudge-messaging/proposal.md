## Why

The premium nudge window (planned in `premium-purchase-reminder`) is only as convincing as its words — and today's copy story is 21 near-identical static lines in `src/lib/supportMessages.ts` ("Your support unlocks premium features" × N). A fixed message shown every time feels robotic, gets ignored, and wastes the user's own success story. Personalized, friendly, ever-changing copy that mirrors the user's real stats converts far better than a generic ask.

## What Changes

- Define a friendly-casual tone of voice for all nudge copy: warm, plain-spoken, a little playful, never guilty-trippy or corporate — written like a friend who noticed your good habit, not a paywall.
- Personalize every nudge with the user's live stats from sources that already exist: `get_break_stats` (`totalBreaksCompleted`, `breakStreak`/`bestBreakStreak`), today's screen time (`UserScreenTime.db` via the existing time-count path), install age + `days_remaining` from `get_trial_info` — e.g. "48 full breaks together 🎉", "6-day streak — your eyes thank you".
- Frame the ask around open-source support, not feature-lock: "Blink Eye is free and open source — going premium keeps it that way and unlocks themes + multi-monitor" rather than "pay or lose out".
- Make messaging dynamic: a template pool per variant (`trial_ending` / `expired` / `winback`) with `{slots}` filled at show-time, plus rotation rules (never repeat the previous message, cooldown per template) so consecutive nudges months apart still feel fresh.
- Cover the stat edge cases explicitly: brand-new users with zeros (celebrate the start, never show "0 breaks"), missing/unavailable stats (graceful generic-but-warm fallback), milestone moments (streak records, 50/100-break club) that earn a special celebratory template.
- Keep all copy local and offline (bundled templates, no server, no tracking) with the pool structured so future multilingual support can swap it out.

## Capabilities

### New Capabilities
- `nudge-messaging`: tone of voice, stat-personalized template pool with slot filling, per-variant template sets, rotation/freshness rules, milestone templates, fallback copy, and open-source support framing for the premium nudge.

### Modified Capabilities
- None — `openspec/specs/` is empty and this adds a new capability. It fills the "variant copy" open question of the `premium-purchase-reminder` change (apply that change's window first, or together; its Decision 5 copy becomes this engine's output).

## Impact

- Frontend: new message-pool module (templates + tone guide as code comments), `/premium_nudge` window component renders the composed message, reads `get_break_stats` / time-count / trial info for slot values; `src/lib/supportMessages.ts` static list retired or kept as fallback pool.
- Backend (Tauri/Rust): no new commands expected — reuses `get_break_stats`, `get_trial_info`, existing screen-time reads; only if a needed stat (e.g., lifetime break minutes) proves unavailable does a tiny read-only accessor get added.
- Systems: none — copy composes at nudge show-time inside the existing `maybe_show_premium_nudge` flow; no change to triggers, caps, or trial/license logic.
