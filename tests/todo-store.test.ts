import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  formatTaskDate,
  normalizeTime,
  parseDeadline,
  parseLocalDateTime,
  toLocalDate,
  toLocalDateTime,
} from "../src/lib/todo-store";

/**
 * The Rust scheduler owns reminder decisions. These tests pin the date
 * helpers that feed it: a wrong local date would mean a missed or early
 * reminder, and legacy tasks must keep working after the schema migration.
 */
describe("todo date helpers", () => {
  test("ISO days stay on their local calendar day", () => {
    const parsed = parseDeadline("2026-11-19");
    assert.ok(parsed);
    assert.equal(toLocalDate(parsed), "2026-11-19");
  });

  test("legacy locale strings are read without UTC shifting", () => {
    assert.equal(toLocalDate(parseDeadline("11/19/2026")!), "2026-11-19");
    assert.equal(toLocalDate(parseDeadline("19/11/2026")!), "2026-11-19");
    assert.equal(parseDeadline("not a date"), null);
  });

  test("due time combines the picked day with the wall-clock time", () => {
    const date = new Date(2026, 10, 19, 12, 0);
    assert.equal(toLocalDateTime(date, "09:45"), "2026-11-19T09:45");
    assert.equal(toLocalDateTime("2026-11-19", "09:45"), "2026-11-19T09:45");
    assert.equal(toLocalDateTime(date, ""), null);
    assert.equal(toLocalDateTime(date, "25:00"), null);
  });

  test("the shared TimePicker's 12-hour values are normalized", () => {
    assert.equal(normalizeTime("09:45 AM"), "09:45");
    assert.equal(normalizeTime("09:45 PM"), "21:45");
    assert.equal(normalizeTime("12:30 AM"), "00:30");
    assert.equal(normalizeTime("12:30 PM"), "12:30");
    assert.equal(toLocalDateTime("2026-11-19", "09:45 AM"), "2026-11-19T09:45");
    assert.equal(normalizeTime("25:00"), null);
  });

  test("impossible local datetimes are rejected", () => {
    assert.equal(parseLocalDateTime("2026-02-30T09:00"), null);
    const valid = parseLocalDateTime("2026-11-19T09:45");
    assert.equal(valid?.getHours(), 9);
  });

  test("display formatting keeps the selected day", () => {
    const formatted = formatTaskDate("2026-11-19", "en");
    assert.match(formatted, /Nov/);
    assert.match(formatted, /19/);
  });
});

/**
 * The popup resolves messageKey through i18n. In particular, a "coming up"
 * reminder must carry both interpolations in every shipped translation we
 * maintain by hand; a missing placeholder would render a literal {{minutes}}.
 */
interface LocaleMessages {
  onboarding: Record<string, string | string[]> & {
    todoSetupTitle: string;
    todoRequired: string;
    todoSetupPlaceholder: string;
    todoSetupRemindersShort: string;
    todoSetupExamples: string[];
  };
  todo: Record<string, string>;
  taskAlert: Record<string, string>;
}

describe("task reminder translations", () => {
  const locale = (code: string): LocaleMessages => {
    const path = fileURLToPath(new URL(`../src/i18n/locales/${code}.json`, import.meta.url));
    return JSON.parse(readFileSync(path, "utf8")) as LocaleMessages;
  };

  for (const code of ["en", "bn"]) {
    test(`${code} has translated onboarding and lead-time reminder copy`, () => {
      const messages = locale(code);
      assert.ok(messages.onboarding.todoSetupTitle.length > 0);
      assert.ok(messages.onboarding.todoRequired.length > 0);
      assert.ok(messages.todo.remindBefore.length > 0);
      assert.ok(messages.todo.remindAtTime.length > 0);
      assert.ok(messages.todo.minutesBefore.includes("{{minutes}}"));
      assert.ok(messages.taskAlert.beforeEyebrow.length > 0);
      assert.match(messages.taskAlert.beforeMessage, /\{\{minutes\}\}/);
      assert.match(messages.taskAlert.beforeMessage, /\{\{title\}\}/);
    });
  }

  test("onboarding no longer describes the required task as optional", () => {
    assert.doesNotMatch(locale("en").onboarding.todoSetupPlaceholder, /optional/i);
  });
});

/**
 * The onboarding screen renders these strings directly. A missing key in any
 * shipped locale would silently fall back to English, so assert full coverage
 * (including the rotating examples and every interpolation token).
 */
describe("onboarding copy in every locale", () => {
  const localeDir = fileURLToPath(new URL("../src/i18n/locales/", import.meta.url));
  const codes = readdirSync(localeDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length));

  const required: Array<[keyof LocaleMessages, string]> = [
    ["onboarding", "steps.todo"],
    ["onboarding", "todoSetupTitle"],
    ["onboarding", "todoSetupSubtitle"],
    ["onboarding", "todoSetupPlaceholder"],
    ["onboarding", "todoRequired"],
    ["onboarding", "todoSetupAdded"],
    ["onboarding", "todoSetupFree"],
    ["onboarding", "todoSetupRemindersTitle"],
    ["onboarding", "todoSetupRemindersDesc"],
    ["onboarding", "todoSetupRemindersShort"],
    ["onboarding", "todoSetupTimeHint"],
    ["todo", "addTask"],
    ["todo", "addTaskPlaceholder"],
    ["todo", "quickAddHint"],
    ["todo", "markDone"],
    ["todo", "remindBefore"],
    ["todo", "remindAtTime"],
    ["todo", "minutesBefore"],
    ["taskAlert", "beforeEyebrow"],
    ["taskAlert", "beforeMessage"],
    ["taskAlert", "dueEyebrow"],
    ["taskAlert", "dueMessage"],
    ["taskAlert", "doneEyebrow"],
    ["taskAlert", "doneMessage"],
    ["taskAlert", "nudgeEyebrow"],
    ["taskAlert", "nudgeMessageA"],
    ["taskAlert", "nudgeMessageB"],
    ["taskAlert", "nudgeMessageC"],
    ["taskAlert", "previewEyebrow"],
    ["taskAlert", "markDone"],
    ["taskAlert", "openList"],
    ["taskAlert", "dismiss"],
  ];

  const lookup = (
    messages: LocaleMessages,
    section: keyof LocaleMessages,
    key: string,
  ): string | string[] | undefined => {
    let node: unknown = messages[section];
    for (const part of key.split(".")) {
      if (typeof node !== "object" || node === null) return undefined;
      node = (node as Record<string, unknown>)[part];
    }
    return node as string | string[] | undefined;
  };

  const placeholders: Array<[keyof LocaleMessages, string, string[]]> = [
    ["onboarding", "todoSetupExamples", []],
    ["todo", "minutesBefore", ["{{minutes}}"]],
    ["todo", "markDone", ["{{title}}"]],
    ["taskAlert", "beforeMessage", ["{{title}}", "{{minutes}}"]],
  ];

  for (const code of codes) {
    test(`${code} has complete, translated onboarding and reminder copy`, () => {
      const path = fileURLToPath(new URL(`../src/i18n/locales/${code}.json`, import.meta.url));
      const messages = JSON.parse(readFileSync(path, "utf8")) as LocaleMessages;

      for (const [section, key] of required) {
        const value = lookup(messages, section, key);
        assert.ok(
          typeof value === "string" && value.trim().length > 0,
          `${code}: ${section}.${key} is missing`,
        );
      }

      for (const [section, key, tokens] of placeholders) {
        const value = lookup(messages, section, key);
        if (key === "todoSetupExamples") {
          assert.ok(Array.isArray(value), `${code}: ${section}.${key} must be a list`);
          assert.equal(value.length, 5, `${code}: expected five rotating examples`);
          for (const example of value) {
            assert.ok(
              typeof example === "string" && example.trim().length > 0,
              `${code}: example must not be empty`,
            );
          }
          continue;
        }
        for (const token of tokens) {
          assert.ok(
            typeof value === "string" && value.includes(token),
            `${code}: ${section}.${key} is missing ${token}`,
          );
        }
      }
    });
  }
});
