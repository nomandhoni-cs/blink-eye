import { describe, expect, test } from "bun:test";
import {
  BLOCK_THRESHOLD,
  screenEmail,
  SUSPICIOUS_THRESHOLD,
  WEIGHTS,
} from "../src/lib/email-screening";
import {
  BLOCKED_DISPOSABLE_DOMAINS,
  BLOCKED_DOMAIN_LABELS,
  BLOCKED_DUMMY_DOMAINS,
  BLOCKED_DUMMY_LOCAL_PARTS,
  GENERATED_FROM,
  PRIVACY_RELAY_DOMAINS,
  PROTECTED_PROVIDER_DOMAINS,
} from "../src/lib/email-blocklist.generated";

/**
 * Acceptance table from the screening guide (Section 10), plus the
 * false-positive guards that came out of the production scan. The "must accept"
 * cases matter more than the blocks: a wrong block loses a real user.
 */
describe("onboarding email screening", () => {
  describe("must reject (dummy local part)", () => {
    for (const email of [
      "test@gmail.com",
      "abc@gmail.com",
      "your@gmail.com",
      "123@gmail.com",
      "abcd@gmail.com",
      "qwerty@gmail.com",
      "testtest@gmail.com",
      "example@gmail.com",
    ]) {
      test(email, () => {
        const result = screenEmail(email);
        expect(result.verdict).toBe("blocked");
        expect(result.message.length).toBeGreaterThan(0);
      });
    }
  });

  describe("must reject (bad domain)", () => {
    for (const email of [
      "user@test.com",
      "user@example.com",
      "a@gamil.com",
      "a@mailinator.com",
      "someone@yopmail.com",
      "someone@trash-mail.com",
      "x@dfgs.cfg",
      "no@thank.you",
      "a@b.co",
      "1@2.com",
    ]) {
      test(email, () => {
        expect(screenEmail(email).verdict).toBe("blocked");
      });
    }
  });

  describe("must reject (malformed)", () => {
    for (const email of ["", "   ", "not-an-email", "@gmail.com", "a@", "a@b"]) {
      test(JSON.stringify(email), () => {
        expect(screenEmail(email).verdict).toBe("blocked");
      });
    }
  });

  describe("must never block real users", () => {
    test("numeric IDs at Chinese providers are account numbers, not laziness", () => {
      for (const email of [
        "877237716@qq.com",
        "13475548130@163.com",
        "123456789@126.com",
        "13800138000@139.com",
        "12345678@foxmail.com",
        "87654321@vip.qq.com",
        "13912345678@189.cn",
      ]) {
        expect(screenEmail(email).verdict).not.toBe("blocked");
      }
    });

    test("plausible personal and work addresses pass silently", () => {
      for (const email of [
        "alice@gmail.com",
        "bob.smith@acme.com",
        "jane.doe@company.co.uk",
        "support@acme.io",
      ]) {
        const result = screenEmail(email);
        expect(result.verdict).toBe("ok");
        expect(result.score).toBe(0);
      }
    });

    test("a three-letter local is nudged, never blocked", () => {
      // The classifier's `very short local-part` rule also catches real
      // people like `bob@acme.com`; a nudge is the honest response.
      const result = screenEmail("bob@acme.com");
      expect(result.verdict).toBe("nudge");
      expect(result.score).toBe(25);
    });

    test("a bare gmail.com row from the scan is never domain-blocked", () => {
      // 20 fake rows lived at gmail.com; 760 real users did too. The domain
      // itself must stay allowed, so only the local part can trip the rules.
      expect(BLOCKED_DUMMY_DOMAINS.has("gmail.com")).toBe(false);
      expect(BLOCKED_DISPOSABLE_DOMAINS.has("gmail.com")).toBe(false);
      expect(screenEmail("someone.real@gmail.com").verdict).toBe("ok");
    });
  });

  describe("soft signals nudge instead of blocking", () => {
    test("very short local part asks for confirmation", () => {
      const result = screenEmail("xx@outlook.com");
      expect(result.verdict).toBe("nudge");
      expect(result.score).toBe(WEIGHTS.veryShortLocal);
      expect(result.message.length).toBeGreaterThan(0);
    });

    test("generic prefixes are questioned, not rejected", () => {
      for (const email of ["admin.doe@company.com", "hello@acme.io", "demo123@acme.io"]) {
        expect(screenEmail(email).verdict).toBe("nudge");
      }
    });

    test("repeated filler characters are questioned", () => {
      expect(screenEmail("vvvvvvv@gmail.com").verdict).toBe("nudge");
      expect(screenEmail("sssscorch@gmail.com").verdict).toBe("nudge");
    });

    test("numeric locals outside China are questioned", () => {
      expect(screenEmail("692142@mail.ru").verdict).toBe("nudge");
    });

    test("a lone weak signal below the suspicious floor stays silent", () => {
      // 20 points of "uncommon TLD" is not worth interrupting a signup for;
      // the documented SUSPICIOUS_THRESHOLD of 25 is the real floor.
      for (const email of [
        "memyamo30@cream.pink",
        "mxhvdp3@beta.pendulum.cyou",
        "adasdsaasdfsfd@blusbfdsa.csl",
      ]) {
        expect(screenEmail(email).verdict).toBe("ok");
        expect(screenEmail(email).score).toBeLessThan(SUSPICIOUS_THRESHOLD);
      }
      // A second weak signal tips it over the floor and asks for confirmation.
      expect(screenEmail("bob@cream.pink").verdict).toBe("nudge");
      expect(screenEmail("bob@cream.pink").score).toBe(
        WEIGHTS.veryShortLocal + WEIGHTS.uncommonTld,
      );
    });

    test("privacy relays pass quietly, never nagged", () => {
      for (const email of [
        "elara.t.shao@invox.com",
        "ml66xwek4@mozmail.com",
        "someone@simplelogin.com",
      ]) {
        const result = screenEmail(email);
        expect(result.verdict).toBe("ok");
        // The score is non-zero but the verdict is deliberately "ok".
        expect(result.score).toBe(WEIGHTS.privacyRelay);
      }
    });
  });

  describe("scoring", () => {
    test("weights match the production classifier", () => {
      expect(screenEmail("test@test.com").score).toBe(
        WEIGHTS.dummyDomain + WEIGHTS.dummyLocal,
      );
      expect(screenEmail("no@thank.you").score).toBe(
        WEIGHTS.dummyDomain + WEIGHTS.dummyLocal + WEIGHTS.veryShortLocal,
      );
    });

    test("duplicateEmail only counts when the caller supplies the count", () => {
      expect(screenEmail("ylahfi@yopmail.com").score).toBe(WEIGHTS.disposable);
      expect(
        screenEmail("ylahfi@yopmail.com", { duplicateCount: 2 }).score,
      ).toBe(WEIGHTS.disposable + WEIGHTS.duplicateEmail);
    });

    test("duplicateEmail alone never blocks, and offers sign-in", () => {
      // Weight 15 is below the 25 suspicious floor, so this cannot ride the
      // ordinary nudge path: a duplicate is surfaced deliberately, never as a
      // rejection, because re-registration is not malice.
      const result = screenEmail("alice@gmail.com", { duplicateCount: 3 });
      expect(result.score).toBe(WEIGHTS.duplicateEmail);
      expect(result.score).toBeLessThan(SUSPICIOUS_THRESHOLD);
      expect(result.verdict).toBe("nudge");
      expect(result.message).toContain("Sign in");
    });

    test("threshold constants are the documented ones", () => {
      expect(BLOCK_THRESHOLD).toBe(70);
    });
  });

  describe("normalisation", () => {
    test("case and whitespace do not change the verdict", () => {
      expect(screenEmail("  TEST@TEST.COM  ").verdict).toBe("blocked");
      expect(screenEmail("ALICE@GMAIL.COM").verdict).toBe("ok");
      expect(screenEmail("  Alice@Gmail.com ").email).toBe("alice@gmail.com");
    });

    test("reports the parsed local and domain", () => {
      const result = screenEmail("alice@acme.com");
      expect(result.local).toBe("alice");
      expect(result.domain).toBe("acme.com");
      expect(result.wellFormed).toBe(true);
    });
  });

  describe("generated blocklist invariants", () => {
    test("providers that also host real users are never blocked", () => {
      for (const domain of ["gmail.com", "qq.com", "163.com", "126.com"]) {
        expect(BLOCKED_DUMMY_DOMAINS.has(domain)).toBe(false);
        expect(BLOCKED_DISPOSABLE_DOMAINS.has(domain)).toBe(false);
      }
    });

    test("no protected provider is also on a block list", () => {
      for (const domain of PROTECTED_PROVIDER_DOMAINS) {
        expect(BLOCKED_DUMMY_DOMAINS.has(domain)).toBe(false);
        expect(BLOCKED_DISPOSABLE_DOMAINS.has(domain)).toBe(false);
      }
    });

    test("privacy relays are never on a block list", () => {
      for (const domain of PRIVACY_RELAY_DOMAINS) {
        expect(BLOCKED_DUMMY_DOMAINS.has(domain)).toBe(false);
        expect(BLOCKED_DISPOSABLE_DOMAINS.has(domain)).toBe(false);
      }
    });

    test("dummy and disposable lists do not overlap", () => {
      for (const domain of BLOCKED_DUMMY_DOMAINS) {
        expect(BLOCKED_DISPOSABLE_DOMAINS.has(domain)).toBe(false);
      }
    });

    test("lists are non-empty and carry provenance", () => {
      expect(BLOCKED_DUMMY_DOMAINS.size).toBeGreaterThan(0);
      expect(BLOCKED_DUMMY_LOCAL_PARTS.size).toBeGreaterThan(0);
      expect(GENERATED_FROM.blockedDomainsHostingRealUsers).toBe(0);
      expect(GENERATED_FROM.scannedEmails).toBeGreaterThan(0);
    });

    test("one-character labels never include a real TLD fragment", () => {
      for (const label of BLOCKED_DOMAIN_LABELS) {
        expect(label.length).toBe(1);
      }
    });
  });
});
