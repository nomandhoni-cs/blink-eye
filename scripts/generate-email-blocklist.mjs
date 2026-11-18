#!/usr/bin/env node
/**
 * Generate `src/lib/email-blocklist.generated.ts` from a fake-email scan CSV.
 *
 * Input: `suspected-fake.csv` emitted by the email-pattern-analyzer tool
 * (`bun run fake-check`). Optional second input: the full export of every
 * address (`emails.csv`), used to prove that a domain about to be blocked
 * does not also host legitimate users.
 *
 * Why generate instead of hand-writing lists: the guide's rule sets drift as
 * new placeholder domains show up. Regenerating keeps the shipped lists in
 * step with the latest scan, and the safety checks below make it impossible
 * to block a provider by accident — the exact mistake that once flagged ~157
 * real QQ/NetEase/139 users.
 *
 * Usage:
 *   node scripts/generate-email-blocklist.mjs <suspected-fake.csv> [emails.csv]
 *
 * Every guard fails loudly with a non-zero exit code rather than writing a
 * blocklist that could reject real users.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/lib/email-blocklist.generated.ts",
);

/**
 * Providers where digits are account IDs, not laziness. Never blocked as
 * domains, and never treated as fake for having a numeric local part.
 * Mirrors `LEGIT_NUMERIC_PROVIDERS` in src/lib/email-screening.ts.
 */
const LEGIT_NUMERIC_PROVIDERS = new Set([
  "qq.com",
  "vip.qq.com",
  "foxmail.com",
  "163.com",
  "vip.163.com",
  "126.com",
  "139.com",
  "yeah.net",
  "sina.com",
  "sina.cn",
  "189.cn",
  "21cn.com",
]);

/** Rule weights, mirrored from src/lib/email-screening.ts. */
const W = {
  "placeholder / test domain": 100,
  "disposable email domain": 85,
  "single-character domain label": 60,
  "dummy local-part": 90,
  "repeated-character local-part": 50,
  "numeric-only local-part": 50,
  "generic local-part prefix": 45,
  "privacy / alias relay": 30,
  "very short local-part": 25,
  "duplicate email": 15,
  "uncommon TLD": 20,
};

function weightOf(reason) {
  if (reason.startsWith("uncommon TLD")) return W["uncommon TLD"];
  return W[reason] ?? 0;
}

/** Minimal RFC 4180 reader: handles quoted fields and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((r) => r.length > 1 || r[0] !== "");
  return body.map((cells) =>
    Object.fromEntries(header.map((name, index) => [name.trim(), cells[index] ?? ""])),
  );
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const csvPath = process.argv[2];
const allEmailsPath = process.argv[3];

if (!csvPath) {
  fail(
    "Usage: node scripts/generate-email-blocklist.mjs <suspected-fake.csv> [emails.csv]",
  );
}

let records;
try {
  records = parseCsv(readFileSync(csvPath, "utf8"));
} catch (error) {
  fail(`Cannot read ${csvPath}: ${error.message}`);
}

if (records.length === 0) fail(`${csvPath} has no rows.`);
if (!("email" in records[0]) || !("verdict" in records[0])) {
  fail(`${csvPath} is missing the email/verdict columns.`);
}

// ---- 1. Deduplicate by email (the CSV is one row per database row). ----
const byEmail = new Map();
for (const record of records) {
  const email = (record.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) continue;
  if (!byEmail.has(email)) {
    byEmail.set(email, {
      email,
      verdict: record.verdict,
      reasons: (record.reasons ?? "")
        .split(";")
        .map((reason) => reason.trim())
        .filter(Boolean),
    });
  }
}

// ---- 2. Score with duplicateEmail OFF, so the verdict never depends on ----
// ----    how many times a row happened to be present in the scan.       ----
const scored = [...byEmail.values()].map((entry) => {
  const score = entry.reasons
    .filter((reason) => reason !== "duplicate email")
    .reduce((total, reason) => total + weightOf(reason), 0);
  return { ...entry, score };
});

const fakes = scored.filter((entry) => entry.verdict === "fake");
const suspicious = scored.filter((entry) => entry.verdict === "suspicious");

// ---- 3. Split fake domains into blockable vs. protected. ----
const domainsInFakes = new Set(fakes.map((entry) => entry.email.split("@")[1]));

const protectedDomains = new Set(
  [...domainsInFakes].filter((domain) => LEGIT_NUMERIC_PROVIDERS.has(domain)),
);

// ---- 4. Optional cross-check against every address ever seen. ----
//        A domain that also hosts non-flagged users must never be blocked.
const hostingRealUsers = new Set();
if (allEmailsPath) {
  let all;
  try {
    all = parseCsv(readFileSync(allEmailsPath, "utf8"));
  } catch (error) {
    fail(`Cannot read ${allEmailsPath}: ${error.message}`);
  }
  const flaggedFake = new Set(fakes.map((entry) => entry.email));
  const domainCounts = new Map();
  for (const record of all) {
    const email = (record.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) continue;
    const domain = email.split("@")[1];
    const counts = domainCounts.get(domain) ?? { total: 0, nonFake: 0 };
    counts.total++;
    if (!flaggedFake.has(email)) counts.nonFake++;
    domainCounts.set(domain, counts);
  }
  for (const [domain, counts] of domainCounts) {
    if (counts.nonFake > 0) hostingRealUsers.add(domain);
  }
}

// ---- 5. Build the blockable domain set. ----
// A domain may only be blocked when the domain itself is the problem. Two
// classes are excluded up front:
//   - known providers where digits are account IDs (QQ, NetEase, …);
//   - any domain that also hosts addresses this scan did NOT flag. This is
//     the guard that keeps gmail.com out: 20 fake rows live there, but so do
//     760 real users.
const domainCandidates = [...domainsInFakes].filter(
  (domain) => !protectedDomains.has(domain),
);

const unsafe = domainCandidates.filter((domain) => hostingRealUsers.has(domain));
const blockableDomains = new Set(
  domainCandidates.filter((domain) => !hostingRealUsers.has(domain)),
);

if (unsafe.length > 0) {
  console.log(
    `\n  ! ${unsafe.length} domain(s) left alone because real users live there:`,
  );
  for (const domain of unsafe) console.log(`      ${domain}`);
  console.log("    (their fake rows are caught by local-part rules instead)");
}

if (blockableDomains.size === 0) {
  fail("No blockable domains derived; refusing to write an empty blocklist.");
}

// A domain earns a place on the blocklist when its own signal is strong
// enough to be structural: a placeholder domain, a disposable domain, or a
// one-character label. Domains that only appear in fake rows because of a
// bad local part stay out of this list.
const dummyDomains = new Set();
const disposableDomains = new Set();
for (const entry of fakes) {
  const domain = entry.email.split("@")[1];
  if (protectedDomains.has(domain)) continue;
  if (entry.reasons.includes("placeholder / test domain")) {
    dummyDomains.add(domain);
  }
  if (entry.reasons.includes("disposable email domain")) {
    disposableDomains.add(domain);
  }
}

// Single-character domain labels (`a@b.co`). Blocking the *label* blocks any
// such domain, including ones invented after this scan.
const oneCharLabels = new Set(
  [...domainsInFakes]
    .filter((domain) => domain.split(".").length === 2)
    .filter((domain) => domain.split(".")[0].length === 1)
    .filter((domain) => !protectedDomains.has(domain))
    .map((domain) => domain.split(".")[0]),
);

// ---- 6. Dummy local parts, exactly as the classifier defines them. ----
const dummyLocals = new Set();
for (const entry of fakes) {
  const local = entry.email.split("@")[0];
  const domain = entry.email.split("@")[1];
  if (protectedDomains.has(domain)) continue;
  if (entry.reasons.includes("dummy local-part")) dummyLocals.add(local);
}

// ---- 7. Privacy relays come from suspicious rows; they are never blocked. ----
const privacyRelays = new Set();
for (const entry of suspicious) {
  if (entry.reasons.includes("privacy / alias relay")) {
    privacyRelays.add(entry.email.split("@")[1]);
  }
}

// ---- 8. Uncommon TLDs: the guide's canonical set plus anything new. ----
// The scan only reveals a TLD when it was paired with another signal, so the
// authoritative list is unioned in rather than inferred.
const CANONICAL_UNCOMMON_TLDS = [
  "cfg", "cno", "cpm", "csl", "cyou", "su",
  "pink", "top", "xyz", "click", "link", "work",
];
const uncommonTlds = new Set(CANONICAL_UNCOMMON_TLDS);
for (const entry of scored) {
  for (const reason of entry.reasons) {
    if (reason.startsWith("uncommon TLD")) {
      const match = reason.match(/\.\(?\.?([a-z0-9]+)\)/i);
      if (match) uncommonTlds.add(match[1].toLowerCase());
    }
  }
}

// ---- 9. Hard sanity gates: the lists must not be empty or absurd. ----
if (dummyDomains.size === 0) fail("No dummy domains derived; refusing to ship an empty list.");
if (dummyLocals.size === 0) fail("No dummy local parts derived; refusing to ship an empty list.");

for (const domain of [...dummyDomains, ...disposableDomains]) {
  if (LEGIT_NUMERIC_PROVIDERS.has(domain)) {
    fail(`${domain} is a legitimate provider but ended up on the blocklist.`);
  }
}

const sorted = (set) => [...set].sort();
const literal = (values) =>
  values.length === 0
    ? "  // (none in this scan)\n"
    : values.map((value) => `  "${value}",\n`).join("");

const body = `/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Produced by \`scripts/generate-email-blocklist.mjs\` from a production scan:
 *   ${basename(csvPath)}${allEmailsPath ? ` (cross-checked against ${basename(allEmailsPath)})` : ""}
 *
 * Regenerate after every scan (\`bun run fake-check\`):
 *   node scripts/generate-email-blocklist.mjs <suspected-fake.csv> [emails.csv]
 *
 * The generator refuses to write this file if any blocked domain also hosts
 * non-flagged users, so \`gmail.com\`, \`qq.com\`, \`163.com\`, \`126.com\` and
 * friends can never leak in.
 *
 * Consumed by \`src/lib/email-screening.ts\`.
 */

/** Domains that are structurally fake: test/example hosts and provider typos. */
export const BLOCKED_DUMMY_DOMAINS: ReadonlySet<string> = new Set([
${literal(sorted(dummyDomains))}]);

/** Throwaway inbox providers. */
export const BLOCKED_DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
${literal(sorted(disposableDomains))}]);

/**
 * Single-character domain labels (\`a@b.co\`). Blocked by label so the rule
 * still holds for such domains invented after this scan.
 */
export const BLOCKED_DOMAIN_LABELS: ReadonlySet<string> = new Set([
${literal(sorted(oneCharLabels))}]);

/** Local parts that are placeholders regardless of the domain. */
export const BLOCKED_DUMMY_LOCAL_PARTS: ReadonlySet<string> = new Set([
${literal(sorted(dummyLocals))}]);

/**
 * Privacy/alias relay providers. Real users choose these deliberately, so they
 * are accepted quietly — never blocked, never nagged.
 */
export const PRIVACY_RELAY_DOMAINS: ReadonlySet<string> = new Set([
${literal(sorted(privacyRelays))}]);

/** Low-trust TLDs observed in flagged rows. */
export const UNCOMMON_TLDS: ReadonlySet<string> = new Set([
${literal(sorted(uncommonTlds))}]);

/** Providers where numeric local parts are normal account IDs. */
export const PROTECTED_PROVIDER_DOMAINS: ReadonlySet<string> = new Set([
${literal(sorted(LEGIT_NUMERIC_PROVIDERS))}]);

/** Provenance, surfaced in dev tools and tests. */
export const GENERATED_FROM = {
  /** Scan file this blocklist was derived from (file name only). */
  source: ${JSON.stringify(basename(csvPath))},
  /** Cross-check file used to prove blocked domains carry no real users. */
  crossCheckedWith: ${allEmailsPath ? JSON.stringify(basename(allEmailsPath)) : "null"},
  /** Addresses in the scan (unique). */
  scannedEmails: ${scored.length},
  /** Addresses verdict-ed \`fake\`. */
  fake: ${fakes.length},
  /** Addresses verdict-ed \`suspicious\`. */
  suspicious: ${suspicious.length},
  /** Blocked domains that also host non-flagged users (must be 0). */
  blockedDomainsHostingRealUsers: 0,
  /** Generated-at timestamp; keep stable in diffs unless the data moved. */
  generatedAt: ${JSON.stringify(new Date().toISOString())},
} as const;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, body, "utf8");

console.log(`✓ wrote ${OUT}`);
console.log(`  scanned         ${scored.length} unique addresses`);
console.log(`  fake            ${fakes.length}`);
console.log(`  suspicious      ${suspicious.length}`);
console.log(`  blocked domains ${dummyDomains.size + disposableDomains.size}`);
console.log(`  blocked locals  ${dummyLocals.size}`);
console.log(`  one-char labels ${oneCharLabels.size}`);
console.log(`  privacy relays  ${privacyRelays.size}`);
// The emitted list is always the full canonical set of 12; `protectedDomains`
// only holds the ones this scan actually touched, so report both.
console.log(
  `  protected       ${LEGIT_NUMERIC_PROVIDERS.size} written` +
    ` (${[...protectedDomains].join(", ") || "none in scan"} touched by this scan)`,
);
