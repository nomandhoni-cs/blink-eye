# Premium Protection — Hardening Roadmap

Audit date: 2026-08-16. This document captures the findings of the premium-feature
security audit and the phased plan to fix them. The license server lives in a
separate repo (`api.blinkeye.app`); changes needed there are called out explicitly
under **Server contract**.

---

## Current state (audit summary)

### What is properly protected today

| Feature | Enforcement |
|---|---|
| Multi-Monitor reminders | Rust re-checks `is_multi_monitor_enabled && is_premium` at every break (`reminder_scheduler.rs`) |
| Premium reminder backgrounds | Rust forces `"default"` for non-premium at break start |
| Workday scheduling | Rust ignores workday config unless premium |
| Snooze limits | Enforced in Rust (`snooze_tracker.rs`) |
| License reads | Frontend reads via `invoke("get_license_info")`, not direct SQL |

The scheduler re-evaluates premium status every 30s — that design is sound.

### What is broken

**The trust root collapses at the storage layer.** The "paid" predicate is
`decrypt(status) == "active"`, and everything needed to forge that is local:

1. **Self-grant via invoke** — `update_license_fields` accepts `status` as a
   writable column. Any webview can run
   `invoke("update_license_fields", { fields: { status: "active" } })` and Rust
   encrypts + stores it. `store_license_data` does the same with fabricated JSON.
   Neither verifies anything with the server.
2. **Key beside the ciphertext** — the AES password (`unique_nano_id`) is stored
   in plaintext in `basicapplicationdata.db`, same directory as the license DB,
   with a hardcoded salt (`unique_salt`). The encryption is obfuscation only.
3. **Frontend-owned validation** — Rust never talks to `api.blinkeye.app`.
   `LicenseValidationComponent.tsx` writes its own verdict:
   - the `if (!response.ok)` disable branch is dead code (earlier branches return first)
   - network errors are swallowed → blocking the API in a firewall = permanent premium
   - 7-day grace, and `last_validated` is itself writable → extendable forever
   - runs once per launch only
4. **Trial resets** — deleting `basicapplicationdata.db` recreates a fresh trial
   on next launch; pinning the clock inside the 7-day window makes it never expire;
   the DB is copyable between machines (no hardware binding).
5. **Frontend-only gates** — Screen Savers (`ScreenSaverWindow.tsx` has no check,
   `/screenSaverWindow` route unguarded), Usage Time page, strict mode
   (`skip_reminder` never checks `is_strict_mode`), and snooze limits are
   user-writable config (`0` = unlimited).
6. **Hygiene** — `get_license_info` logs the password preview + ciphertext to
   stdout; CSP disabled (`"csp": "null"`); asset protocol exposes `$APPDATA/*`
   including the license DB; sql plugin allows raw SQL from ~30 windows;
   `DebugPremiumPanel` is imported (ships in bundle) though commented out;
   `.env` with `VITE_HANDSHAKE_PASSWORD` is committed to the repo.

### Reality check

On a desktop app the user owns the machine — perfect protection is impossible;
a determined person can patch the binary. The realistic goal is:
**server-authoritative validation + signed tokens + enough friction that paying
is easier than cracking.** Phase 1 achieves that.

---

## Phase 1 — Kill the self-grant (highest impact)

### 1.1 Signed license tokens (server + client)

The server signs every license verdict; the app verifies the signature before
trusting anything. This kills forged invokes, DB tampering, and offline replay
in one move.

**Server contract (`api.blinkeye.app`):**

- Generate an Ed25519 keypair once. Keep the private key server-side only.
- Embed the **public key** in the app binary (Rust constant).
- `/activate-license` and `/validate-license` responses gain a `token` field:

```jsonc
{
  "valid": true,
  "license_key": { "status": "active", "expires_at": "2027-01-01", ... },
  "meta": { "store_id": 134128, ... },
  "token": {
    "payload": {
      "license_key": "XXXX-XXXX",
      "status": "active",
      "expires_at": "2027-01-01T00:00:00Z",
      "issued_at": "2026-08-16T12:00:00Z",   // server time — defeats clock tricks
      "instance_name": "MacBook-Pro"
    },
    "signature": "<base64 Ed25519 signature over canonical JSON of payload>"
  }
}
```

- Canonical JSON = sorted keys, no whitespace (document the exact serialization
  so both sides agree byte-for-byte).
- Optional later: bind `instance_name`/machine fingerprint into the payload.

**Client (Rust) changes:**

- New module `license_token.rs`: verify signature with the embedded public key
  (`ed25519-dalek` or `ring`), check `issued_at` is recent, check `expires_at`.
- New command `apply_license_token(token_json)` — the **only** write path to
  `blink_eye_license.db`. Verify → encrypt → store. Frontend passes the raw
  server response; it can no longer fabricate fields.
- `is_paid_user()` additionally checks `expires_at > now`.
- Delete or lock down `store_license_data` / `update_license_fields`:
  remove `status`, `last_validated`, `expires_at` from `ALLOWED_COLUMNS`
  (or remove the commands entirely once activation/validation move to Rust).

### 1.2 Move validation into Rust

- New Rust command `validate_license()` that calls `api.blinkeye.app/validate-license`
  itself (reqwest), verifies the token, and applies it. The frontend only
  triggers it and displays the result — it never writes the verdict.
- Scheduler calls it on startup and every ~6h (it already refreshes settings
  every 30s; add a daily/hourly validation cadence).
- Grace policy (decide and document): e.g. if the last *successful* validation
  is older than 14 days, downgrade to trial. Store `last_validated` from the
  **signed token's `issued_at`**, not client time.
- Fix/remove the dead `!response.ok` branch in `LicenseValidationComponent.tsx`
  once Rust owns validation (the component becomes a thin trigger).

### 1.3 Stop leaking secrets

- Remove the password/ciphertext `println!`s from `get_license_info`.
- Rotate `VITE_HANDSHAKE_PASSWORD`, move it out of the committed `.env`
  (CI secrets), and consider replacing the shared password with per-request
  signing since the handshake secret is extractable from the JS bundle anyway.

**Effort:** ~2–3 days client-side; server-side is one signing helper + two
response changes.

---

## Phase 2 — Trial hardening

1. **Clock-pinning detection** — store a `last_seen_timestamp` (encrypted) on
   every scheduler tick. If `now < last_seen - tolerance`, treat as tampering:
   expire the trial (same treatment as the existing `clock_manipulated` flag,
   but enforced, not just a dialog).
2. **DB deletion ≠ trial reset** — `ensure_install_data` currently recreates a
   fresh install row when the DB is missing. Options:
   - keep a second copy of the install date elsewhere (e.g. keychain on macOS,
     DPAPI-protected file on Windows) and restore the older date, or
   - treat "DB missing but app config present" as tampering and start in
     trial-expired state.
3. **Machine binding (optional)** — include a hardware fingerprint hash in the
   signed token payload so copied DBs don't validate. Weigh against legitimate
   hardware upgrades; a soft binding (warn, don't hard-block) is usually enough.

**Effort:** ~1–2 days.

---

## Phase 3 — Close frontend-only gates

1. **Strict mode in Rust** — `skip_reminder` must check `is_strict_mode` and
   reject `snoozed: true` (and optionally reject skipping entirely) when active.
   Hiding the button in JS is not enforcement.
2. **Snooze limits** — move `snoozesAllowedPerSession/PerDay` out of
   user-writable config, or make `update_reminder_setting` reject those keys
   for non-premium users.
3. **Screen Savers** — add a premium check before spawning
   `/screenSaverWindow` (Rust command that verifies premium before opening the
   window, mirroring the reminder spawn path).
4. **Usage Time limits** — if `usageTimeLimit`/`screenOnTimeLimit` are meant to
   be premium features, enforce them in `screen_time_tracker` (Rust); today
   nothing reads them.
5. **Config import** — `import_user_data` restores `appconfig.db` wholesale;
   scrub premium-only keys on import for non-premium users (the three
   scheduler gates already survive this, but future keys may not).

**Effort:** ~1 day.

---

## Phase 4 — Hygiene & attack-surface reduction

1. **Capabilities** — remove `sql:allow-execute/select/load` from windows that
   don't need raw SQL (all reminder overlays, alert, screensaver windows).
   Config access should flow through Rust commands only (already the AGENTS.md
   rule).
2. **Asset protocol scope** — drop `$APPDATA/blink_eye_license.db` and the
   blanket `$APPDATA/*` from the scope; whitelist only what the asset protocol
   genuinely serves.
3. **CSP** — replace `"csp": "null"` with a real policy
   (`default-src 'self'; ...`) once the app's legitimate sources are inventoried.
4. **Dead code** — delete the `DebugPremiumPanel` import (and file) so it can't
   ship; delete `PrivateRoutet.tsx` or actually use it for premium routes.
5. **Route guards** — wrap premium routes (`/multimonitor`, `/workday`,
   `/screenSavers`, `/usagetime`) in a `RequirePremium` component that renders
   the upsell instead of the page (defense in depth; Rust gates remain the
   real enforcement).

**Effort:** ~1 day.

---

## Suggested order

| Order | Phase | Why |
|---|---|---|
| 1 | 1.1 + 1.2 | Removes the one-line self-grant; everything else is pointless while this exists |
| 2 | 1.3 | Cheap, stops active leaks |
| 3 | 3.1 (strict mode) | Small, closes the most visible bypass |
| 4 | 2 | Trial abuse is the most common real-world crack |
| 5 | 3.2–3.5, 4 | Polish + defense in depth |

## Out of scope / accepted risks

- Binary patching by a determined attacker (mitigated only by making the app
  worth less than the effort; code signing + obfuscation raise the bar slightly).
- The `idle` crate question and other non-security audit items.

## Related files

- `src-tauri/src/crypto.rs` — license storage/encryption commands
- `src-tauri/src/reminder_scheduler.rs` — premium gates (`has_premium_access`)
- `src-tauri/src/snooze_tracker.rs` — snooze enforcement + daily break history
- `src/components/LicenseValidationComponent.tsx` — current (frontend) validation
- `src/components/window/ActivateLicense.tsx` — activation flow
- `src/contexts/PremiumFeaturesContext.tsx` — frontend gate context
- `docs/tauri-commands-api.md` — command signatures (update when commands change)
