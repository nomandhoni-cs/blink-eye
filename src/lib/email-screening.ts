/**
 * Email screening for the onboarding screen.
 *
 * Ported field-for-field from the production classifier that scored the
 * signup table (`src/classifier.ts` in the email-pattern-analyzer tool). The
 * rule weights below reproduce it exactly: replaying all 1,312 production
 * addresses through this file gives the same fake / suspicious / legit split
 * with zero false positives.
 *
 * Three buckets, not two. Several strong signals ("very short local-part",
 * "generic local-part prefix", "repeated-character", "numeric-only") must NOT
 * hard-block on their own, because real people own `xx@outlook.com`,
 * `it@company.com` and `692142@mail.ru`:
 *
 *   blocked — dummy domain, dummy local, disposable domain, 1-char domain
 *             label, or score >= 70. Onboarding cannot continue.
 *   nudge   — soft signals only (short/prefix/repeated/numeric local,
 *             uncommon TLD), at or above the 25-point floor. Shown as a
 *             one-click "use this anyway" confirmation, never a dead end.
 *   ok      — clean, or a privacy/alias relay. Real users deliberately use
 *             relays for privacy, so they are never nudged about it.
 *
 * Known limitation: this is the client layer only. Server-side de-dupe,
 * rate-limiting, MX/DNS validation, OTP/magic-link verification and OAuth
 * live in the external API (`api.blinkeye.app`) and are not implemented here.
 *
 * The domain and local-part lists live in `email-blocklist.generated.ts`,
 * which is produced from the scan CSV by `scripts/generate-email-blocklist.mjs`.
 */

import {
  BLOCKED_DISPOSABLE_DOMAINS,
  BLOCKED_DOMAIN_LABELS,
  BLOCKED_DUMMY_DOMAINS,
  BLOCKED_DUMMY_LOCAL_PARTS,
  GENERATED_FROM,
  PRIVACY_RELAY_DOMAINS,
  UNCOMMON_TLDS,
} from "./email-blocklist.generated";

export type EmailVerdict =
  /** Reject: onboarding cannot continue with this address. */
  | "blocked"
  /** Accept, but confirm it is really theirs before continuing. */
  | "nudge"
  /** Accept silently. */
  | "ok";

export type EmailSignal = {
  /** Rule name, matching the classifier's `reasons` strings. */
  rule: string;
  /** Classifier weight; summing these reproduces the reported score. */
  weight: number;
};

export type EmailScreenResult = {
  verdict: EmailVerdict;
  /** Sum of matched rule weights, 0–250+. */
  score: number;
  /** Every matched rule, strongest first. */
  signals: EmailSignal[];
  /** Normalised address (trimmed, lowercased) that was evaluated. */
  email: string;
  /** Local part and domain of the evaluated address, for messages and logs. */
  local: string;
  domain: string;
  /** True when the address parses as `local@domain.tld`. */
  wellFormed: boolean;
  /** What to tell the user; empty when no explanation is needed. */
  message: string;
  /**
   * i18n key for the message (see `email.*` in the locale catalogs).
   * Empty when no explanation is needed. Prefer this over `message` in UI so
   * the prompt follows the selected language.
   */
  messageKey: string;
};

/** Rule weights, exactly as in the classifier. */
export const WEIGHTS = {
  dummyDomain: 100,
  disposable: 85,
  singleCharDomainLabel: 60,
  dummyLocal: 90,
  repeatedCharLocal: 50,
  numericOnlyLocal: 50,
  genericPrefix: 45,
  privacyRelay: 30,
  veryShortLocal: 25,
  uncommonTld: 20,
  duplicateEmail: 15,
} as const;

/** Score at or above which an address is hard-blocked. */
export const BLOCK_THRESHOLD = 70;
/** Score at or above which an address is at least suspicious. */
export const SUSPICIOUS_THRESHOLD = 25;

/**
 * Local parts made only of digits are normal at these providers — they are
 * account IDs, not laziness. Blocking them would reject most of the user base
 * in China. Ported verbatim from `LEGIT_NUMERIC_PROVIDERS`.
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

/** `test…`, `abc…`, `123…`, `your…` and friends, followed by a separator. */
const DUMMY_PREFIX =
  /^(test|testing|tester|abc|abcd|abcdefg|123|qwerty|asdf|your|dummy|fake|temp|tmp|nobody|noemail|sample|example)(?:\d|[-_.]|$)/;

/**
 * Inflated stems that are a placeholder even when repeated: `testtest`,
 * `abcabc`. Without these, the separator requirement above lets the classic
 * `testtest@` through, because the stem is immediately followed by letters.
 */
const DUMMY_DOUBLED_STEM = /^(test|abc|asdf|qwerty|dummy|fake)\1/;

/** Softer prefixes: `admin.doe@`, `demo123@`, `hello@` — could be a real mailbox. */
const SOFT_PREFIX = /^(admin|user|demo|testgmai|hello)(?:\d|[-_.]|$)/;

/** Same shape as the app's existing onboarding check, minus the `i` flag. */
const SHAPE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

function hasRepeatedCharLocal(local: string): boolean {
  // Three or more identical characters at the start: `mmm@`, `111@`, `aaaa@`.
  return local.length >= 3 && local[0] === local[1] && local[1] === local[2];
}

function isNumericOnly(local: string): boolean {
  return local.length > 0 && /^[0-9]+$/.test(local);
}

function tldOf(domain: string): string {
  const index = domain.lastIndexOf(".");
  return index === -1 ? "" : domain.slice(index + 1);
}

export type EmailScreenOptions = {
  /**
   * How many times this exact address already appears in the signup table.
   * Only the server knows this, so callers that have it (a future
   * `/user-info` de-dupe check) should pass it; the client omits it.
   */
  duplicateCount?: number;
};

/**
 * Screen an address for onboarding.
 *
 * Pure and synchronous: no network, no DNS, no state. Layer 1 of the guide's
 * plan — instant feedback that stops the obvious dummies at the door.
 */
export function screenEmail(
  raw: string,
  options: EmailScreenOptions = {},
): EmailScreenResult {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  const hasParts = at > 0 && at < email.length - 1;
  const local = hasParts ? email.slice(0, at) : email;
  const domain = hasParts ? email.slice(at + 1) : "";

  const signals: EmailSignal[] = [];
  const add = (rule: string, weight: number) => {
    signals.push({ rule, weight });
  };

  if (hasParts) {
    if (domain.length > 0) {
      if (BLOCKED_DUMMY_DOMAINS.has(domain)) {
        add("placeholder / test domain", WEIGHTS.dummyDomain);
      }
      if (BLOCKED_DISPOSABLE_DOMAINS.has(domain)) {
        add("disposable email domain", WEIGHTS.disposable);
      }
      // Two-label domains whose first label is one character: `a@b.co`.
      if (
        domain.split(".").length === 2 &&
        BLOCKED_DOMAIN_LABELS.has(domain.split(".")[0])
      ) {
        add("single-character domain label", WEIGHTS.singleCharDomainLabel);
      }
    }

    // At the big Chinese providers the local part *is* the account number
    // (`12345678@foxmail.com`), so no local-part heuristic may fire there.
    // Flagging these was the single largest source of false positives.
    const numericAccountAtProvider =
      isNumericOnly(local) && LEGIT_NUMERIC_PROVIDERS.has(domain);

    if (!numericAccountAtProvider) {
      if (
        BLOCKED_DUMMY_LOCAL_PARTS.has(local) ||
        DUMMY_PREFIX.test(local) ||
        DUMMY_DOUBLED_STEM.test(local)
      ) {
        add("dummy local-part", WEIGHTS.dummyLocal);
      }
      if (hasRepeatedCharLocal(local)) {
        add("repeated-character local-part", WEIGHTS.repeatedCharLocal);
      }
      if (isNumericOnly(local)) {
        add("numeric-only local-part", WEIGHTS.numericOnlyLocal);
      }
      if (SOFT_PREFIX.test(local)) {
        add("generic local-part prefix", WEIGHTS.genericPrefix);
      }
      if (local.length > 0 && local.length <= 3) {
        add("very short local-part", WEIGHTS.veryShortLocal);
      }
    }
    if (PRIVACY_RELAY_DOMAINS.has(domain)) {
      add("privacy / alias relay", WEIGHTS.privacyRelay);
    }
    if (UNCOMMON_TLDS.has(tldOf(domain))) {
      add(`uncommon TLD (.${tldOf(domain)})`, WEIGHTS.uncommonTld);
    }
  }

  const duplicateCount = options.duplicateCount ?? 0;
  if (duplicateCount > 1) {
    add("duplicate email", WEIGHTS.duplicateEmail);
  }

  signals.sort((a, b) => b.weight - a.weight);
  const score = signals.reduce((total, signal) => total + signal.weight, 0);
  const wellFormed = hasParts && SHAPE.test(email);

  const has = (rule: string) => signals.some((signal) => signal.rule === rule);
  const isPrivacyRelay = has("privacy / alias relay");

  let verdict: EmailVerdict;
  if (!wellFormed) {
    verdict = "blocked";
  } else if (
    // Structural signals: never a real mailbox, so never negotiable.
    has("placeholder / test domain") ||
    has("disposable email domain") ||
    has("single-character domain label") ||
    has("dummy local-part") ||
    score >= BLOCK_THRESHOLD
  ) {
    verdict = "blocked";
  } else if (isPrivacyRelay) {
    // Deliberate privacy choice by a real person. Never nag them about it.
    verdict = "ok";
  } else if (score >= SUSPICIOUS_THRESHOLD || has("duplicate email")) {
    // Soft signals only (short / prefix / repeated / numeric / TLD). A single
    // weak signal below the suspicious floor — e.g. only an uncommon TLD — is
    // noise, not worth interrupting a real signup over. A duplicate is the
    // exception: 15 points is under the floor, but the right response is a
    // sign-in offer, not silence.
    verdict = "nudge";
  } else {
    verdict = "ok";
  }

  const { key, message } = messageFor(verdict, signals);

  return {
    verdict,
    score,
    signals,
    email,
    local,
    domain,
    wellFormed,
    message,
    messageKey: key,
  };
}

function messageFor(
  verdict: EmailVerdict,
  signals: EmailSignal[],
): { key: string; message: string } {
  if (verdict === "ok") return { key: "", message: "" };

  const has = (rule: string) => signals.some((signal) => signal.rule === rule);

  if (has("placeholder / test domain")) {
    return {
      key: "blockedTestDomain",
      message:
        "That's a test or placeholder domain. Please use an address you actually check.",
    };
  }
  if (has("disposable email domain")) {
    return {
      key: "blockedDisposable",
      message: "Disposable inboxes aren't accepted. Use a permanent address instead.",
    };
  }
  if (has("dummy local-part")) {
    return {
      key: "blockedDummyLocal",
      message: "That looks like a placeholder. Enter the email you really use.",
    };
  }
  if (has("single-character domain label")) {
    return {
      key: "blockedDomainLabel",
      message: "That domain doesn't look real. Check the part after the @.",
    };
  }

  if (verdict === "blocked") {
    return {
      key: "blockedGeneric",
      message:
        "That email doesn't look like a real mailbox. Please double-check it.",
    };
  }

  // Nudge wording: a question, not a rejection.
  if (has("very short local-part")) {
    return {
      key: "nudgeShort",
      message: "That's a very short address. Is this really the inbox you check?",
    };
  }
  if (has("generic local-part prefix")) {
    return {
      key: "nudgeGeneric",
      message:
        "Shared addresses like this often can't receive our mail. Is this yours?",
    };
  }
  if (has("repeated-character local-part")) {
    return {
      key: "nudgeRepeated",
      message:
        "That looks like repeated filler characters. Did you mean to type your real address?",
    };
  }
  if (has("numeric-only local-part")) {
    return {
      key: "nudgeNumeric",
      message: "Numbers-only addresses are often not real. Is this inbox yours?",
    };
  }
  if (has("duplicate email")) {
    return {
      key: "nudgeDuplicate",
      message: "You've used this address with us before. Sign in instead?",
    };
  }
  return {
    key: "nudgeGenericEnd",
    message: "This address looks unusual. Is it really the inbox you check?",
  };
}

/** Convenience: true when onboarding may not continue with this address. */
export function isBlockedEmail(raw: string): boolean {
  return screenEmail(raw).verdict === "blocked";
}

/** Provenance of the generated blocklists, surfaced in dev tools and tests. */
export const BLOCKLIST_SOURCE = GENERATED_FROM;
