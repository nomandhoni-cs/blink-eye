# Onboarding email screening

Stops dummy/placeholder addresses from completing onboarding without turning
away real people. The client-side layer is implemented in this repo; the
server-side layers are **not** implemented here and are listed as a gap at the
bottom rather than faked.

- Screener: `src/lib/email-screening.ts`
- Lists: `src/lib/email-blocklist.generated.ts` (generated, do not edit)
- Generator: `scripts/generate-email-blocklist.mjs`
- Tests: `tests/email-screening.test.ts`
- UI: `src/components/screens/welcome-screen.tsx`, wired in
  `src/blink-eye-onboarding.tsx`

## Three buckets

| Verdict   | When                                                                       | What the user sees                                  |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| `blocked` | Malformed, placeholder/test or disposable domain, 1-character domain label, dummy local part, or score ≥ 70 | Inline error. Cannot continue. Must pick another address. |
| `nudge`   | Soft signals only, score ≥ 25 (short / generic prefix / repeated chars / numeric local / uncommon TLD), plus duplicate-email where the server supplies a count | Amber card + **"Yes, this is correct — use it anyway"**, which continues in one click. Never a dead end. |
| `ok`      | Clean, or a privacy/alias relay                                            | Continues silently.                                 |

Email stays **required**; there is no skip path.

## Weights

Reproduced exactly from the classifier that scored the production signup table.

| Rule                          | Weight |
| ----------------------------- | -----: |
| placeholder / test domain     |    100 |
| dummy local-part              |     90 |
| disposable email domain       |     85 |
| single-character domain label |     60 |
| repeated-character local-part |     50 |
| numeric-only local-part       |     50 |
| generic local-part prefix     |     45 |
| privacy / alias relay         |     30 |
| very short local-part         |     25 |
| uncommon TLD                  |     20 |
| duplicate email               |     15 |

Thresholds: `BLOCK_THRESHOLD = 70`, `SUSPICIOUS_THRESHOLD = 25`.

A single weak signal below 25 points is treated as noise and passes silently —
an uncommon TLD alone (20) is not worth interrupting a signup for.

## Guards that protect real users

These exist because earlier, simpler rules rejected real accounts:

- **Numeric locals at Chinese providers are account numbers.** At `qq.com`,
  `vip.qq.com`, `foxmail.com`, `163.com`, `vip.163.com`, `126.com`, `139.com`,
  `yeah.net`, `sina.com`, `sina.cn`, `189.cn` and `21cn.com` **no local-part
  rule fires at all**. `13475548130@163.com` and `12345678@foxmail.com` pass.
  This was the single largest source of false positives.
- **Privacy relays are accepted silently**: `simplelogin.com`, `mozmail.com`,
  `passinbox.com`, `keemail.me`, `anonbox.net`, `invox.com`, `hide.my.email`,
  `passmail.net`. Using one is a deliberate privacy choice, not laziness.
- **A domain is never blocked if it also hosts non-flagged users.** This is why
  `gmail.com`, `qq.com`, `163.com` and `126.com` are absent from the domain
  blocklist despite appearing in the fake rows of the scan — their fakes are
  caught by local-part rules instead.
- **Duplicate email alone never blocks.** It is 15 points, below the block
  threshold, and the message offers sign-in instead.

## Regenerating the lists

The lists are generated, never hand-edited. The generator refuses to block a
domain that also hosts non-flagged users and fails if the result would be empty.

```bash
node scripts/generate-email-blocklist.mjs <suspected-fake.csv> [emails.csv]
```

`suspected-fake.csv` needs a header row and the columns
`email,verdict,score,reasons`; `emails.csv` is the full signup export with an
`email` column and is optional but strongly recommended — it is what powers the
"also hosts real users" guard. Regenerating rewrites
`src/lib/email-blocklist.generated.ts` including its `GENERATED_FROM`
provenance block.

## Verification

`tests/email-screening.test.ts` holds the guide's acceptance table plus the
false-positive guards above. Run it with `bun test` where bun is available
(the repo's other suites use bun:test).

Beyond the unit tests, the screener was replayed against all 1,312 production
addresses:

| Outcome                              | Count |
| ------------------------------------ | ----: |
| blocked                              |    76 |
| nudge                                |    29 |
| ok                                   |  1,207 |
| **false positives (real user blocked)** | **0** |
| known fakes still blocked            | 76 of 80 |

The 4 fakes not blocked are `123@qq.com`, `123132@qq.com`, `111@163.com` and
`111@126.com`. They are purely numeric locals at protected Chinese providers,
so they are exempted by design — blocking them would reject real Chinese
users, which is the explicit trade-off in favour of false negatives here.
The other 38 rows the scan flagged are `suspicious`, not fake; they are either
nudged (29) or pass (9 — mostly privacy relays, which are exempt).

## Not implemented here: server-side gap

This repo has **no API routes** — onboarding POSTs to the external backend at
`https://api.blinkeye.app/user-info` (`src/services/onboarding-service.ts`).
The following layers from the plan live there and are out of scope for this
change. They should not be faked client-side, because a determined user can
bypass anything that runs in the app bundle:

1. **Duplicate-email checking.** The client cannot know how many accounts use
   an address. `screenEmail()` accepts an optional `duplicateCount` so the
   server-side caller can pass it in once such a check exists; nothing calls it
   with a count today.
2. **Rate limiting** per IP and per address on the signup endpoint.
3. **MX / DNS validation** — confirming the domain can actually receive mail.
   Requires network access and belongs next to the database.
4. **OTP / magic-link verification** — the only check that proves ownership.
   This is the real fix; everything in the client layer is a filter in front
   of it, not a substitute.
5. **Google / Apple OAuth** as an alternative to typing an address at all.
