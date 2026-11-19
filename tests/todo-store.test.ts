import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  formatTaskDate,
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
