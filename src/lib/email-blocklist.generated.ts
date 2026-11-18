/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Produced by `scripts/generate-email-blocklist.mjs` from a production scan:
 *   suspected-fake.csv (cross-checked against emails.csv)
 *
 * Regenerate after every scan (`bun run fake-check`):
 *   node scripts/generate-email-blocklist.mjs <suspected-fake.csv> [emails.csv]
 *
 * The generator refuses to write this file if any blocked domain also hosts
 * non-flagged users, so `gmail.com`, `qq.com`, `163.com`, `126.com` and
 * friends can never leak in.
 *
 * Consumed by `src/lib/email-screening.ts`.
 */

/** Domains that are structurally fake: test/example hosts and provider typos. */
export const BLOCKED_DUMMY_DOMAINS: ReadonlySet<string> = new Set([
  "1.com",
  "11.com",
  "123.com",
  "2.com",
  "aaaa.fr",
  "aboba.com",
  "asdfsdaf.cno",
  "b.com",
  "blah.com",
  "dfgs.cfg",
  "dhffhj.com",
  "dsafj.com",
  "email.com",
  "example.com",
  "g.com",
  "gamail.com",
  "gamil.com",
  "gma.com",
  "gmail.come",
  "gmaill.com",
  "gmal.com",
  "hpot.com",
  "microsfot.com",
  "no.com",
  "no.no",
  "r.com",
  "rggf.cpm",
  "sdfsdf.com",
  "sef.com",
  "sss.com",
  "tese.com",
  "test.ca",
  "test.com",
  "thank.you",
  "thankyou.com",
]);

/** Throwaway inbox providers. */
export const BLOCKED_DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  "10mail.info",
  "bumpmail.io",
  "mailinator.com",
  "trash-mail.com",
  "yopmail.com",
]);

/**
 * Single-character domain labels (`a@b.co`). Blocked by label so the rule
 * still holds for such domains invented after this scan.
 */
export const BLOCKED_DOMAIN_LABELS: ReadonlySet<string> = new Set([
  "1",
  "2",
  "b",
  "g",
  "r",
]);

/** Local parts that are placeholders regardless of the domain. */
export const BLOCKED_DUMMY_LOCAL_PARTS: ReadonlySet<string> = new Set([
  "123",
  "12345nhay",
  "aaaa",
  "abc",
  "abcd",
  "abcdefg",
  "example",
  "no",
  "qwerty",
  "test",
  "test1234",
  "testgmai001",
  "testing",
  "testset",
  "tmp",
  "your",
]);

/**
 * Privacy/alias relay providers. Real users choose these deliberately, so they
 * are accepted quietly — never blocked, never nagged.
 */
export const PRIVACY_RELAY_DOMAINS: ReadonlySet<string> = new Set([
  "invox.com",
  "keemail.me",
  "mozmail.com",
  "passinbox.com",
  "passmail.net",
  "simplelogin.com",
]);

/** Low-trust TLDs observed in flagged rows. */
export const UNCOMMON_TLDS: ReadonlySet<string> = new Set([
  "cfg",
  "click",
  "cno",
  "cpm",
  "csl",
  "cyou",
  "link",
  "pink",
  "su",
  "top",
  "work",
  "xyz",
]);

/** Providers where numeric local parts are normal account IDs. */
export const PROTECTED_PROVIDER_DOMAINS: ReadonlySet<string> = new Set([
  "126.com",
  "139.com",
  "163.com",
  "189.cn",
  "21cn.com",
  "foxmail.com",
  "qq.com",
  "sina.cn",
  "sina.com",
  "vip.163.com",
  "vip.qq.com",
  "yeah.net",
]);

/** Provenance, surfaced in dev tools and tests. */
export const GENERATED_FROM = {
  /** Scan file this blocklist was derived from (file name only). */
  source: "suspected-fake.csv",
  /** Cross-check file used to prove blocked domains carry no real users. */
  crossCheckedWith: "emails.csv",
  /** Addresses in the scan (unique). */
  scannedEmails: 103,
  /** Addresses verdict-ed `fake`. */
  fake: 66,
  /** Addresses verdict-ed `suspicious`. */
  suspicious: 37,
  /** Blocked domains that also host non-flagged users (must be 0). */
  blockedDomainsHostingRealUsers: 0,
  /** Generated-at timestamp; keep stable in diffs unless the data moved. */
  generatedAt: "2026-11-18T08:36:48.479Z",
} as const;
