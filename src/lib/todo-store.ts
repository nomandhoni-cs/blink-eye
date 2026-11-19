/**
 * Shared to-do persistence for the main window, the break overlay, the
 * onboarding screen and the task alert. All of them read the same
 * `UserLocalTodoList.db`; nothing here is gated by a license.
 *
 * Outside Tauri (web preview / tests) the same API is backed by localStorage
 * so the flow stays usable and demonstrable.
 */

import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";

export const TODO_DB_FILE = "UserLocalTodoList.db";

export type TaskStatus = "pending" | "done";

export interface Task {
  id: number;
  title: string;
  details?: string | null;
  /** Legacy rows use a locale date string; new rows store `YYYY-MM-DD`. */
  deadline?: string | null;
  reminder_time?: string | null;
  status: TaskStatus;
  created_at: string;
  /** Local ISO datetime `YYYY-MM-DDTHH:mm` used by the reminder engine. */
  due_at?: string | null;
  /** Minutes before `due_at` to show the popup (0 = at the due time). */
  reminder_lead_minutes?: number | null;
}

export interface TaskInput {
  title: string;
  details?: string | null;
  deadline?: string | null;
  reminderTime?: string | null;
  dueAt?: string | null;
  reminderLeadMinutes?: number | null;
}

/** Options offered in onboarding and the Todo List. */
export const LEAD_MINUTE_OPTIONS = [0, 5, 10, 30, 60] as const;

export const TASK_REMINDERS_ENABLED_KEY = "todoTaskRemindersEnabled";
export const QUIET_START_KEY = "todoQuietStartHour";
export const QUIET_END_KEY = "todoQuietEndHour";
export const DEFAULT_QUIET_START_HOUR = 22;
export const DEFAULT_QUIET_END_HOUR = 8;

const LOCAL_TASKS_KEY = "blink-eye:todo-tasks";
const SETTINGS_PREFIX = "blink-eye:setting:";

export const isTauriRuntime = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const inTauri = isTauriRuntime;

// ── Date helpers ────────────────────────────────────────────────────────────

const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD` in local time (never `toISOString()`, which shifts by UTC). */
export function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The shared TimePicker emits 12-hour values (`09:45 AM`). Store one 24-hour
 * form so SQLite, the Rust scheduler and the popup all agree on the moment.
 */
export function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.trim();
  const twelveHour = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(text);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();
    if (hours < 1 || hours > 12 || minutes > 59) return null;
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours < 12) hours += 12;
    return `${pad(hours)}:${pad(minutes)}`;
  }
  if (!/^\d{1,2}:\d{2}$/.test(text)) return null;
  const [hours, minutes] = text.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

/** Combine the calendar picker date with a picked time into a local ISO value. */
export function toLocalDateTime(
  date: Date | string | null | undefined,
  time: string | null | undefined,
): string | null {
  const normalized = normalizeTime(time);
  if (!date || !normalized) return null;
  const parsed = date instanceof Date ? date : parseDeadline(date);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return `${toLocalDate(parsed)}T${normalized}`;
}

/**
 * Parse both the new `YYYY-MM-DD` format and the locale strings written by
 * older builds. An unrecognised legacy value returns null rather than a wrong
 * date — the reminder engine must never nag about a misparsed task.
 */
export function parseDeadline(value?: string | null): Date | null {
  if (!value) return null;
  const text = value.trim();
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (isoDay) {
    const [, y, m, d] = isoDay;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}/.exec(text);
  if (isoDateTime) return parseDeadline(text.slice(0, 10));

  // Legacy rows stored `toLocaleDateString()`. Read the numeric forms in a
  // way that handles both MDY and DMY; only truly ambiguous values fall back
  // to the runtime's locale parsing.
  const numeric = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(text);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    const rawYear = Number(numeric[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    let month: number;
    let day: number;
    if (first > 12 && second <= 12) {
      day = first;
      month = second;
    } else if (second > 12 && first <= 12) {
      month = first;
      day = second;
    } else {
      const fallback = new Date(text);
      if (Number.isNaN(fallback.getTime())) return null;
      month = fallback.getMonth() + 1;
      day = fallback.getDate();
    }
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Parse `YYYY-MM-DDTHH:mm` as a local wall-clock time. */
export function parseLocalDateTime(value?: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number);
  const date = new Date(y, m - 1, d, h, min, 0, 0);
  // Reject impossible dates such as February 30th.
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

/** Display helper that keeps ISO dates in the user's local day. */
export function formatTaskDate(
  value: string | Date | null | undefined,
  locale: string,
): string {
  const date = value instanceof Date ? value : parseDeadline(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Database ────────────────────────────────────────────────────────────────

let ready: Promise<void> | null = null;

/** Idempotent schema setup, safe to call from any screen. */
export function ensureTodoDatabase(): Promise<void> {
  if (!inTauri()) return Promise.resolve();
  if (!ready) {
    ready = (async () => {
      const db = await Database.load(`sqlite:${TODO_DB_FILE}`);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          details TEXT,
          deadline TEXT,
          reminder_time TEXT,
          due_at TEXT,
          reminder_lead_minutes INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        )
      `);
      // Idempotent migration for databases created by older builds (or by the
      // Rust scheduler) — never drop or rewrite existing tasks.
      for (const statement of [
        "ALTER TABLE todos ADD COLUMN reminder_time TEXT",
        "ALTER TABLE todos ADD COLUMN due_at TEXT",
        "ALTER TABLE todos ADD COLUMN reminder_lead_minutes INTEGER NOT NULL DEFAULT 0",
      ]) {
        try {
          await db.execute(statement);
        } catch {
          // Column already exists.
        }
      }
      await db.execute(`
        CREATE TABLE IF NOT EXISTS task_reminder_events (
          task_id INTEGER NOT NULL,
          kind TEXT NOT NULL,
          day TEXT NOT NULL,
          action_key TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          PRIMARY KEY (task_id, kind, day)
        )
      `);
      try {
        await db.execute(
          "ALTER TABLE task_reminder_events ADD COLUMN action_key TEXT NOT NULL DEFAULT ''",
        );
      } catch {
        // Column already exists.
      }
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

function readLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function writeLocalTasks(tasks: Task[]): void {
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
}

async function db(): Promise<Database> {
  await ensureTodoDatabase();
  return Database.load(`sqlite:${TODO_DB_FILE}`);
}

export async function fetchTasks(): Promise<Task[]> {
  if (!inTauri()) return readLocalTasks();
  const database = await db();
  return database.select<Task[]>(
    "SELECT * FROM todos ORDER BY (status = 'done'), id DESC",
  );
}

export async function getTask(id: number): Promise<Task | null> {
  const tasks = await fetchTasks();
  return tasks.find((task) => task.id === id) ?? null;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const title = input.title.trim();
  if (!title) throw new Error("Task title is required");

  if (!inTauri()) {
    const tasks = readLocalTasks();
    const task: Task = {
      id: Math.max(0, ...tasks.map((item) => item.id)) + 1,
      title,
      details: input.details?.trim() || null,
      deadline: input.deadline || null,
      reminder_time: normalizeTime(input.reminderTime),
      due_at: input.dueAt || null,
      reminder_lead_minutes: input.reminderLeadMinutes ?? 0,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    writeLocalTasks([task, ...tasks]);
    return task;
  }

  const database = await db();
  await database.execute(
    `INSERT INTO todos
       (title, details, deadline, reminder_time, due_at,
        reminder_lead_minutes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      title,
      input.details?.trim() || null,
      input.deadline || null,
      normalizeTime(input.reminderTime),
      input.dueAt || null,
      input.reminderLeadMinutes ?? 0,
      new Date().toISOString(),
    ],
  );
  return (await fetchTasks())[0] ?? null;
}

export async function updateTask(
  id: number,
  patch: Partial<Task>,
): Promise<void> {
  if (!inTauri()) {
    writeLocalTasks(
      readLocalTasks().map((task) =>
        task.id === id
          ? {
              ...task,
              ...(patch.title !== undefined && { title: patch.title.trim() }),
              ...(patch.details !== undefined && { details: patch.details || null }),
              ...(patch.deadline !== undefined && { deadline: patch.deadline || null }),
              ...(patch.reminder_time !== undefined && {
                reminder_time: normalizeTime(patch.reminder_time),
              }),
              ...(patch.due_at !== undefined && { due_at: patch.due_at || null }),
              ...(patch.reminder_lead_minutes !== undefined && {
                reminder_lead_minutes: patch.reminder_lead_minutes ?? 0,
              }),
            }
          : task,
      ),
    );
    return;
  }

  const database = await db();
  const current = await getTask(id);
  if (!current) return;
  await database.execute(
    `UPDATE todos SET title = ?, details = ?, deadline = ?,
       reminder_time = ?, due_at = ?, reminder_lead_minutes = ? WHERE id = ?`,
    [
      patch.title?.trim() ?? current.title,
      patch.details !== undefined ? patch.details || null : current.details ?? null,
      patch.deadline !== undefined ? patch.deadline || null : current.deadline ?? null,
      patch.reminder_time !== undefined
        ? normalizeTime(patch.reminder_time)
        : current.reminder_time ?? null,
      patch.due_at !== undefined ? patch.due_at || null : current.due_at ?? null,
      patch.reminder_lead_minutes !== undefined
        ? patch.reminder_lead_minutes ?? 0
        : current.reminder_lead_minutes ?? 0,
      id,
    ],
  );
}

export async function setTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<void> {
  if (!inTauri()) {
    writeLocalTasks(
      readLocalTasks().map((task) => (task.id === id ? { ...task, status } : task)),
    );
    return;
  }
  const database = await db();
  await database.execute("UPDATE todos SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteTask(id: number): Promise<void> {
  if (!inTauri()) {
    writeLocalTasks(readLocalTasks().filter((task) => task.id !== id));
    return;
  }
  const database = await db();
  await database.execute("DELETE FROM todos WHERE id = ?", [id]);
}

export interface ReminderEventRecord {
  taskId: number;
  kind: "due" | "nudge";
  /** Exact due_at for a due reminder, empty for a daily nudge. */
  actionKey: string;
}

/**
 * Read the durable de-duplication log for a local day. localStorage is only a
 * cache: the SQLite table survives cache clears, so a popup cannot repeat just
 * because browser storage was reset.
 */
export async function fetchReminderEvents(
  day: string,
): Promise<ReminderEventRecord[]> {
  if (!inTauri()) return [];
  try {
    const database = await db();
    return await database.select<ReminderEventRecord[]>(
      `SELECT task_id AS taskId, kind, action_key AS actionKey
         FROM task_reminder_events WHERE day = ?`,
      [day],
    );
  } catch (error) {
    console.error("[todos] Could not read reminder history:", error);
    return [];
  }
}

/** Recorded for the engine's de-duplication; also useful for future history UI. */
export async function recordReminderEvent(
  taskId: number,
  kind: "due" | "nudge",
  day: string,
  actionKey = "",
): Promise<void> {
  if (!inTauri()) return;
  const database = await db();
  await database.execute(
    `INSERT OR IGNORE INTO task_reminder_events
       (task_id, kind, day, action_key, created_at) VALUES (?, ?, ?, ?, ?)`,
    [taskId, kind, day, actionKey, new Date().toISOString()],
  );
}

// ── Settings (appconfig.db, with a preview fallback) ───────────────────────

export async function getTodoSetting(
  key: string,
  fallback: string,
): Promise<string> {
  if (!inTauri()) {
    return localStorage.getItem(SETTINGS_PREFIX + key) ?? fallback;
  }
  try {
    const value = await invoke<string | null>("get_config_string", { key });
    return value ?? fallback;
  } catch (error) {
    console.error(`[todos] Could not read setting ${key}:`, error);
    return localStorage.getItem(SETTINGS_PREFIX + key) ?? fallback;
  }
}

export async function setTodoSetting(key: string, value: string): Promise<void> {
  localStorage.setItem(SETTINGS_PREFIX + key, value);
  if (!inTauri()) return;
  await invoke("update_reminder_setting", { key, value });
}
