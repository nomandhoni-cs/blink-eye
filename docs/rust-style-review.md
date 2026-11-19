# Rust style and correctness review

Scope: all Rust sources under `src-tauri/src/` (nine files, ~5.5k lines),
reviewed against the [Google Rust Style Guide](https://google.github.io/styleguide/rustguide.html)
and the public Rust style rules it defers to.

## Scope notes

The guide marks several rules `[chrome]` or `[fuchsia]`. This is a Cargo/Tauri
application, not Chromium code, so those environment-specific rules (small
crates, flat `rust_library` layout, "no async/await", Fuchsia mutexes) were not
forced. The general rules on formatting, imports, ownership, naming, docs,
`must_use`, panics, assertions, and unsafe code were applied.

## Applied style changes

- Added `src-tauri/rustfmt.toml` with `max_width = 100` and edition 2021;
  formatted every Rust file. No Rust line now exceeds 100 columns.
- Split imports so each `use` targets one module; moved trait imports
  (`FromStr`, `Manager`, `Emitter`, `NotificationExt`) into the functions that
  need them.
- Added `//!` module docs and `///` docs for public functions, structs, and
  fields that lacked them.
- Replaced bare `unwrap()` with contextual `expect()` in tests and avoided
  startup panics in app setup.
- Added `#[must_use]` to pure helpers whose ignored return value is a bug.
- Added context strings to assertions where the reason for the assertion was
  not obvious.
- Replaced `&PathBuf` with `&Path`, removed an unnecessary `Arc<Pool<Sqlite>>`,
  and extracted two root-module commands into `app_commands.rs`.
- Renamed FFI declarations to snake_case Rust names using `#[link_name]`, and
  added `SAFETY:` comments plus a technical justification for every `unsafe`
  block.

## Correctness fixes

| Area | Fix |
|------|-----|
| `lib.rs` | Removed duplicate updater and notification plugin registrations. Setup errors now propagate; the spawned screen-time task logs directory failures instead of panicking. |
| `crypto.rs` | Removed logging of the first characters of the install password and encrypted license values. Config commands now create the `config` table when missing. A NULL `last_validated` column is tolerated instead of failing the whole license read. |
| `premium_nudge.rs` / `task_reminders.rs` | The premium nudge and task pop-up now treat each other as conflicting windows, so only one ask is visible at a time. |
| `screen_time_tracker/mod.rs` | Removed shared ownership that was not needed; FFI calls are documented and use idiomatic Rust names. |
| Tests | `unwrap()` calls now carry context; key assertions explain the invariant being checked. |

## Verification

- `rustfmt --check` passes for every Rust file with the new configuration.
- No Rust line exceeds the configured 100-column limit.
- `npm run test:todo` — 9/9 passed; `npx tsc --noEmit -p tsconfig.app.json`
  and `npm run build` passed. No frontend source changed in this pass.
- `cargo check` / `cargo test` could not run in this sandbox because outbound
  access to crates.io is blocked. Please run them locally (or in CI) before
  release; the changes are limited to formatting, docs, attributes, error
  handling, import layout, and the small behavior fixes listed above.

## Manual QA after `cargo test`

1. Launch the app and confirm tray, updates, notifications, autostart, and
   global shortcuts still initialize.
2. Trigger a break and a task reminder; confirm only one pop-up is visible and
   the break still wins over the premium nudge.
3. Export/import user data and check the license activation screen.
4. On macOS/Windows, confirm screen-time tracking still records sessions
   (the display-power FFI names were changed via `#[link_name]`).
