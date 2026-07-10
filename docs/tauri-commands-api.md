# Blink Eye — Tauri Command API Reference

All commands are invoked from the frontend via `invoke("command_name", { ...args })` from `@tauri-apps/api/core`.

---

## Architecture Overview

The app has three Rust modules that expose Tauri commands:

| Module | Responsibility | Commands |
|--------|---------------|----------|
| `lib.rs` | App setup, tray menu, greeting | `greet`, `check_minimized_argument` |
| `crypto.rs` | Encryption, install data, license, config, trial | 10 commands |
| `reminder_scheduler.rs` | Break scheduling, tray timer, window spawning | 4 commands |

**Data flow:**

```
Frontend (React/TypeScript)
  │  invoke("command_name", { args })
  ▼
Tauri IPC Bridge
  │
  ▼
Rust Commands
  ├── crypto.rs: encrypts/decrypts data, reads SQLite
  ├── reminder_scheduler.rs: runs 1s tick loop, spawns windows
  └── lib.rs: manages tray menu, app lifecycle
```

**Scheduler flow:**

```
reminder_scheduler.rs (tokio async loop, 1s tick)
  │
  ├── Reads settings from appconfig.db
  ├── Checks screen on/off (screen_time_tracker)
  ├── Checks workday window (chrono)
  ├── Sends countdown to tray via mpsc channel
  ├── Shows "before alert" 15s before break
  └── Spawns WebviewWindow when break starts
        │
        ├── Primary:   /reminder-{style}.html?config=...
        └── Secondary: /reminder-{style}.html?minimal=true&config=...
              (same per-style entry; overlay omitted when minimal=true)
```

---

## Table of Contents

- [lib.rs](#librs)
  - [greet](#greet)
  - [check_minimized_argument](#check_minimized_argument)
- [crypto.rs](#cryptors)
  - [ensure_install_data](#ensure_install_data)
  - [get_install_date](#get_install_date)
  - [get_license_info](#get_license_info)
  - [store_license_data](#store_license_data)
  - [update_license_fields](#update_license_fields)
  - [get_config_bool](#get_config_bool)
  - [get_config_string](#get_config_string)
  - [get_reminder_settings](#get_reminder_settings)
  - [update_reminder_setting](#update_reminder_setting)
  - [get_trial_info](#get_trial_info)
- [reminder_scheduler.rs](#reminder_schedulerrs)
  - [skip_reminder](#skip_reminder)
  - [refresh_reminder_scheduler_settings](#refresh_reminder_scheduler_settings)
  - [show_reminder_now](#show_reminder_now)
  - [get_next_reminder_info](#get_next_reminder_info)

---

## lib.rs

### `greet`

```ts
invoke("greet", { name: string }) → string
```

Returns a greeting message. Used for testing Tauri IPC.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `name` | `string` | Name to greet |

**Returns:** `string` — e.g. `"Hello, John! You've been greeted from Rust!"`

---

### `check_minimized_argument`

```ts
invoke("check_minimized_argument") → string
```

Checks if the app was launched with the `--minimized` CLI argument (used by autostart).

**Parameters:** None

**Returns:** `"minimized"` or `"fullScreen"`

---

## crypto.rs

### `ensure_install_data`

```ts
invoke("ensure_install_data") → void
```

Initializes the install date on first launch. Creates the `user_data` table in `basicapplicationdata.db`, generates a random 21-character password, encrypts today's date, and stores it. No-ops if data already exists.

Called automatically at app startup and during onboarding.

**Parameters:** None

**Returns:** `void`

**Errors:** Returns `Err(String)` if DB operations or encryption fails.

---

### `get_install_date`

```ts
invoke("get_install_date") → string | null
```

Retrieves and decrypts the install date from `basicapplicationdata.db`.

**Parameters:** None

**Returns:** `string | null` — Decrypted date in `YYYY-MM-DD` format, or `null` if not found.

---

### `get_license_info`

```ts
invoke("get_license_info") → LicenseInfo
```

Retrieves and decrypts license data from `blink_eye_license.db`. Uses the encryption password stored in `basicapplicationdata.db`.

**Parameters:** None

**Returns:**

```ts
interface LicenseInfo {
  license_key: string | null  // Full decrypted license key
  status: string | null       // "active", "inactive", "disabled", etc.
  is_paid: boolean            // true if status === "active"
  last_validated: string | null // YYYY-MM-DD of last validation
}
```

---

### `store_license_data`

```ts
invoke("store_license_data", { data: LicenseApiPayload }) → void
```

Stores full license data from the LemonSqueezy API response. Encrypts all fields before writing to `blink_eye_license.db`.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `data` | `object` | Raw API response from `/activate-license` |

Expected shape of `data`:

```ts
{
  license_key: {
    key: string,
    status: string,
    activation_limit: string,
    activation_usage: string,
    created_at: string,
    expires_at: string,
    test_mode: string
  },
  meta: {
    store_id: number,
    order_id: string,
    order_item_id: string,
    variant_name: string,
    product_name: string,
    customer_name: string,
    customer_email: string
  },
  instance?: {
    name: string
  }
}
```

**Returns:** `void`

**Errors:** `Err("No encryption password found in user_data")` if install data is missing.

---

### `update_license_fields`

```ts
invoke("update_license_fields", { fields: Record<string, string> }) → void
```

Updates specific license fields with encrypted values. Used for status updates and validation date tracking.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `fields` | `object` | Key-value pairs to update. Keys must be valid column names in the `licenses` table. |

Example:

```ts
await invoke("update_license_fields", {
  fields: {
    status: "active",
    last_validated: "2026-07-07"
  }
})
```

**Returns:** `void`

**Valid column names:** `license_key`, `status`, `activation_limit`, `activation_usage`, `created_at`, `expires_at`, `test_mode`, `instance_name`, `store_id`, `order_id`, `order_item_id`, `variant_name`, `product_name`, `customer_name`, `customer_email`, `last_validated`

---

### `get_config_bool`

```ts
invoke("get_config_bool", { key: string, default_value: boolean }) → boolean
```

Reads a boolean value from the `config` table in `appconfig.db`. Generic — accepts any key.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `key` | `string` | Config key to look up (e.g. `"usingStrictMode"`, `"useCircleProgressTimerStyle"`) |
| `default_value` | `boolean` | Value to return if key doesn't exist |

**Returns:** `boolean`

---

### `get_config_string`

```ts
invoke("get_config_string", { key: string }) → string | null
```

Reads a string value from the `config` table in `appconfig.db`. Generic — accepts any key.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `key` | `string` | Config key to look up |

**Returns:** `string | null`

---

### `get_reminder_settings`

```ts
invoke("get_reminder_settings") → ReminderSettingsInfo
```

Reads reminder configuration from `appconfig.db`. Returns all four reminder fields together (interval, duration, text, background style). Wrapper around `get_config_string` for convenience.

**Parameters:** None

**Returns:**

```ts
interface ReminderSettingsInfo {
  intervalMins: number | null     // Break interval in minutes
  durationSecs: number | null     // Break duration in seconds
  reminderText: string | null     // Text shown during breaks
  backgroundStyle: string | null  // Theme/style ID for reminder windows
}
```

---

### `update_reminder_setting`

```ts
invoke("update_reminder_setting", { key: string, value: string }) → void
```

Sets a value for any key in the `config` table of `appconfig.db`. Upserts (insert or update). 

Despite the name, this is the **generic write path** for appconfig.db — used for any setting, not only reminder-related ones.

**Reminders/scheduling keys:**
- `blinkEyeReminderInterval` — break interval in minutes
- `blinkEyeReminderDuration` — break duration in seconds
- `blinkEyeReminderScreenText` — break message
- `pomodoroStyleBreak` — Pomodoro mode flag (`"true"` / `"false"`)
- `previousBlinkEyeReminderDuration` / `previousBlinkEyeReminderInterval` — saved values before Pomodoro toggle

**Style keys:**
- `reminderBackgroundStyle` — selected background for break windows
- `reminderBackgroundStylePreview` — preview-only style (until saved)
- `screenSaverBackgroundStyle` — screensaver style

**Autostart keys:**
- `isRunOnStartUpEnabledByDefault` — whether the user has been auto-enabled once

**Other keys:**
- `usageTimeLimit` — daily usage limit in hours (chart)

**Parameters:**
- `key` — Config key string
- `value` — New value as string (numbers are converted via `String(x)` before invoking)

**Returns:** `void`

> ⚠️ After updating `blinkEyeReminderInterval`, `blinkEyeReminderDuration`, or `blinkEyeReminderScreenText`, also call `refresh_reminder_scheduler_settings` so the scheduler picks up the changes without restarting.

---

### `get_trial_info`

```ts
invoke("get_trial_info") → TrialInfo
```

Computes trial status from the stored install date. 7-day trial window.

**Parameters:** None

**Returns:**

```ts
interface TrialInfo {
  install_date: string | null    // YYYY-MM-DD
  days_remaining: number         // 0 if expired or no data
  is_active: boolean             // true if trial is ongoing
  clock_manipulated: boolean     // true if system clock is before install date
}
```

---

## reminder_scheduler.rs

### `skip_reminder`

```ts
invoke("skip_reminder") → void
```

Skips the current break/reminder and closes all reminder windows.

**Parameters:** None

**Returns:** `void`

---

### `refresh_reminder_scheduler_settings`

```ts
invoke("refresh_reminder_scheduler_settings") → void
```

Reloads reminder settings (`reminderBackgroundStyle`, `blinkEyeReminderInterval`, `blinkEyeReminderDuration`, `blinkEyeReminderScreenText`, workday config) from `appconfig.db` and reschedules the next reminder without restarting.

**When to call:**
After any write to `blinkEyeReminderInterval`, `blinkEyeReminderDuration`, `blinkEyeReminderScreenText`, or `pomodoroStyleBreak`. Without this call the running scheduler keeps using the cached settings until next reload.

**Example:**
```ts
await invoke("update_reminder_setting", { key: "blinkEyeReminderInterval", value: "25" });
await invoke("refresh_reminder_scheduler_settings");
```

**Parameters:** None

**Returns:** `void`

---

### `show_reminder_now`

```ts
invoke("show_reminder_now") → void
```

Immediately shows a reminder window (bypasses the timer).

**Parameters:** None

**Returns:** `void`

---

### `get_next_reminder_info`

```ts
invoke("get_next_reminder_info") → NextReminderInfo
```

Returns the current state of the reminder scheduler including time until next break.

**Parameters:** None

**Returns:**

```ts
interface NextReminderInfo {
  nextReminderInSecs: number  // seconds until next break (0 if on break or imminent)
  intervalSecs: number        // total interval between breaks (e.g. 1200 = 20 min)
  isOnBreak: boolean          // whether a break is currently active
  isInsideWorkday: boolean    // whether we're within configured workday hours
  durationSecs: number        // break duration in seconds (e.g. 20)
}
```

**Example:**

```ts
const info = await invoke("get_next_reminder_info");
// { nextReminderInSecs: 847, intervalSecs: 1200, isOnBreak: false, ... }
// → next break in ~14 minutes
```

---

## Database Schema

### `basicapplicationdata.db` → `user_data`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INTEGER` | Always `1` |
| `unique_nano_id` | `TEXT` | 21-char random password (encryption key) |
| `data` | `TEXT` | JSON `EncryptedPayload` containing the install date |

### `blink_eye_license.db` → `licenses`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INTEGER` | Always `1` |
| `license_key` | `TEXT` | Encrypted license key |
| `status` | `TEXT` | Encrypted status |
| `activation_limit` | `TEXT` | Encrypted |
| `activation_usage` | `TEXT` | Encrypted |
| `created_at` | `TEXT` | Encrypted |
| `expires_at` | `TEXT` | Encrypted |
| `test_mode` | `TEXT` | Encrypted |
| `instance_name` | `TEXT` | Encrypted |
| `store_id` | `TEXT` | Encrypted |
| `order_id` | `TEXT` | Encrypted |
| `order_item_id` | `TEXT` | Encrypted |
| `variant_name` | `TEXT` | Encrypted |
| `product_name` | `TEXT` | Encrypted |
| `customer_name` | `TEXT` | Encrypted |
| `customer_email` | `TEXT` | Encrypted |
| `last_validated` | `TEXT` | Encrypted |

### `appconfig.db` → `config`

Generic key/value store for all app settings. Replaces the legacy Tauri `store.json`, `ReminderThemeStyle.json`, `ReminderThemePreviewStyle.json`, `ScreenSaverStyle.json`, and `initialSetupConfig.json` files.

| Column | Type | Description |
|--------|------|-------------|
| `key` | `TEXT` (PRIMARY KEY) | Config key |
| `value` | `TEXT` | Config value (stored as string; numbers/booleans are stringified) |

**Known keys:**

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `blinkEyeReminderInterval` | number | `20` | Break interval (minutes) |
| `blinkEyeReminderDuration` | number | `20` | Break duration (seconds) |
| `blinkEyeReminderScreenText` | string | `"Pause! Look into..."` | Break message |
| `previousBlinkEyeReminderDuration` | number | `20` | Saved duration before Pomodoro |
| `previousBlinkEyeReminderInterval` | number | `20` | Saved interval before Pomodoro |
| `pomodoroStyleBreak` | bool | `"false"` | Pomodoro mode flag |
| `reminderBackgroundStyle` | string | `"default"` | Selected reminder background |
| `reminderBackgroundStylePreview` | string | `"default"` | Preview-only reminder style |
| `screenSaverBackgroundStyle` | string | `"freesprit"` | Selected screensaver style |
| `isRunOnStartUpEnabledByDefault` | bool | `"true"` | AutoStart once-enabled flag |
| `usageTimeLimit` | number | `8` | Daily usage limit (hours) |
| `screenOnTimeLimit` | number | `8` | Daily screen-on limit (hours) |
| `usingStrictMode` | bool | `"false"` | Hide Skip button during break |
| `useCircleProgressTimerStyle` | bool | `"true"` | Circular vs linear timer |
| `isMultiMonitorEnabled` | bool | `"false"` | Show breaks on all monitors |
| `isWorkdayEnabled` | bool | `"false"` | Restrict breaks to workday |
| `isUpdateAvailable` | bool | `"false"` | Update available toast flag |
| `isUserOnboarded` | bool | `"false"` | Onboarding state |
| `blinkEyeWorkday` | JSON | Mon–Fri 9–17 | Per-day start/end hours |
| `accentColor` / `selectedTheme` | string | — | UI accent / theme setting |

---

### Encryption Format

All encrypted values use `EncryptedPayload`:

```json
{
  "iv": [12 random bytes],
  "data": [ciphertext + 16-byte auth tag]
}
```

Algorithm: AES-256-GCM with PBKDF2-derived key (100k iterations, SHA-256, salt `"unique_salt"`).
