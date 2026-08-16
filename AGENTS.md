# Agents

## Tauri Command Documentation

When modifying Tauri commands in `src-tauri/src/*.rs`, do both:

### 1. Rust Doc Comment

Add a `///` doc comment above the `#[tauri::command]` function:

```rust
/// Brief description of what the command does.
///
/// # Parameters
/// - `key` — Description
///
/// # Returns
/// `()` on success, or error string on failure.
#[tauri::command]
pub fn my_command(key: String) -> Result<(), String> {
    // ...
}
```

### 2. API Doc Entry

Update `docs/tauri-commands-api.md` with the command's TypeScript signature:

```markdown
### `command_name`

\`\`\`ts
invoke("command_name", { param: type }) → ReturnType
\`\`\`

One-sentence description.

**Parameters:**
- `param` — Description

**Returns:**
\`\`\`ts
interface ReturnType {
  field: type   // description
}
\`\`\`
```

### Rules

- Keep Rust doc comments concise — one line + optional params/returns.
- The API doc entry targets frontend developers — use TypeScript types.
- If the command is internal-only (no frontend invoke), note that and skip the API doc.
- Update the Table of Contents when adding new commands.
- Update the command count in the Architecture Overview table when adding/removing commands.

## Database Interactions

When writing/reading config or settings from the frontend, use Rust commands that access `appconfig.db` instead of Tauri store JSON files.

### After saving reminder settings

Always call after updating `blinkEyeReminderInterval`, `blinkEyeReminderDuration`, or `blinkEyeReminderScreenText`:

```ts
await invoke("update_reminder_setting", { key: "blinkEyeReminderInterval", value: String(interval) });
await invoke("refresh_reminder_scheduler_settings"); // Required: reloads settings in the Rust scheduler
```

### Preferred pattern for config reads

Use `invoke("get_reminder_settings")` instead of reading from `store.json`:

```ts
const settings: {
  intervalMins: number | null;
  durationSecs: number | null;
  reminderText: string | null;
  backgroundStyle: string | null;
} = await invoke("get_reminder_settings");
```

### Avoid

- `store.json` for reminder settings — use `appconfig.db` via Rust commands
- Direct `Database.load("sqlite:appconfig.db")` from TS for config — use Rust commands instead
