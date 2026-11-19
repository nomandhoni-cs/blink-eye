#!/usr/bin/env node
/**
 * Build locale catalogs by merging a partial overlay on top of the English
 * base catalog. Usage:
 *   node scripts/i18n-overlay.mjs <locale-code> <overlay.json>
 *
 * The overlay only needs to contain translated keys; anything it omits keeps
 * the English text, so partial translations are safe and stay reviewable.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const localesDir = path.join(root, "src", "i18n", "locales");
const base = JSON.parse(
  fs.readFileSync(path.join(localesDir, "en.json"), "utf8"),
);

function merge(target, overlay) {
  const out = { ...target };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = merge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

const [, , code, overlayPath] = process.argv;
if (!code || !overlayPath) {
  console.error("usage: node scripts/i18n-overlay.mjs <locale-code> <overlay.json>");
  process.exit(1);
}

const overlay = JSON.parse(fs.readFileSync(overlayPath, "utf8"));
const merged = merge(base, overlay);
const target = path.join(localesDir, `${code}.json`);
fs.writeFileSync(target, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log(`wrote ${target}`);
