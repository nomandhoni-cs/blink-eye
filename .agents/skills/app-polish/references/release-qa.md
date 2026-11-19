# Release QA and measurement

Use to verify behavior and hand off a small, safe change. [State matrix](../assets/state-matrix.md) · [QA run CSV](../assets/qa-run.csv) · [Change brief](../assets/change-brief.md)

## Reproduce, patch, replay

1. **Scope one journey.** Record the build/revision, devices, OS/browser, accounts/roles, locales, text size, data fixture, assistive tech, network timing, and what counts as completion. Mark where you can check authoritative state. Use sandbox payments, test accounts, fake data, and permission resets for controlled checks. Redact identifiers, session details, and typed data from evidence.
2. **Capture a baseline.** Walk the happy path; record the smallest reproducible steps for actual defects and expected state. A screenshot can prove displayed text clipped under its conditions, not that the underlying action failed or an assistive technology didn't announce it. Distinguish observed from suspected and from not tested. Don't discount a rare catastrophic state just because it was hard to trigger.
3. **Test the model and the UI.** At unit/integration level, cover transition/copy selection, permission outcomes, validation, safe reuse, clear scope, stale-response order, and idempotency/status reconciliation if relevant. At UI level, run the flow end to end and check the authoritative result as well as visible/announced state. Deliberately fail dependencies or drop a response in a local fixture; don't touch production services to induce a failure.
4. **Vary the inputs that interact.** Include supported small/large screen and keyboard/touch, zoom/native font scales, a screen reader, reduced motion, real long copy, and RTL if supported. Try combinations such as tall text with a sticky bottom CTA, screen reader with repeated filter changes, network loss after commit, and sign-out with a queued draft. Simulators and static/accessibility scans help, but don't replace manual runs on relevant devices and assistive tools (W01, W03, M01).
5. **Gate and retest.** Set release gates based on harm and scope before evaluating. In particular, block or disable the affected path for unresolved privacy/authorization leaks, misleading material terms, unsafe duplicate commits, data loss, or a critical inaccessible/unrecoverable branch. Don't label a failed or untested applicable gate `n/a`. Write a named owner, mitigation, and next check. Retest the original path and adjacent good paths after the patch. Report exact sampled coverage and what remains unverified; don't call a release accessible or compliant from these checks alone.

### Worked example — a booking request (illustrative, not a product test)

- **Before:** A guest taps “Confirm booking.” The connection drops before the reply. The UI says “Something went wrong” and enables a second submission. A first request may already have created a booking.
- **Change:** Keep the same user intent tied to an operation the guest can look up. While in flight show “Confirming your booking…”. If the result is unknown show “We couldn’t confirm this booking. Check booking status before trying again.” Confirm only after a matching authoritative result. Preserve safe fields and provide a usable contact path if lookup is unavailable. Align button/charge wording with the actual booking contract.
- **Acceptance:** In staging, let the first request commit, suppress its response, then reopen and query status. The app shows the existing confirmed booking and reference, and exactly one booking exists. Repeat with no commit, concurrent taps, and a later event after navigation. A screen reader can discover uncertain and settled status without repeated interruption. Verify the normal success path still shows next steps. If the service cannot reconcile an unknown result, record that as a blocker or disable blind resubmit; animation cannot repair it.

## Check comprehension before calling it better

Recruit people who plausibly use the feature and include relevant access needs. Give a realistic goal without telling them which controls to press. For paid/destructive actions use a prototype or safe test fixture. Ask prediction questions **before** commitment and comprehension questions **after** the status appears; don't explain the UI while timing unassisted attempts. With consent, record the behavior separately from what participants say (M01, W03).

- **Before:** “What will happen when you choose this?” “Who will be able to read that note?” “When, if at all, are you charged?”
- **During:** “What do you think is happening right now?” “What would you do next?” Give them a route to solve a zero-result/permission-denied case.
- **After:** “What actually happened?” “How would you check?” If useful, ask a separate neutral rating (“How confident are you in what happened?”), not a leading premium/cheap question. Small qualitative samples surface failure modes; don't generalize the percentages to the population.

## Define success with denominators and guardrails

Pick **one** primary behavior or comprehension outcome for the change. Define eligible population, time window, completion signal, deduplication key, and segment before comparing. Use aggregate or pseudonymous telemetry only when permitted; don't collect contents of notes, secrets, locations, or raw errors just to measure polish.

| Change | Candidate measure | Countercheck |
| --- | --- | --- |
| Clarify an action or field | Correct unassisted predictions / people shown the decision; intended tasks completed / eligible started attempts within a defined window. | Check who is unexpectedly charged, sees the data, or cannot decline optional use. A higher tap rate alone is not success. |
| Improve status or recovery | Users who complete or safely exit after a given failure / users who hit that failure; unintended duplicate commits / unique intended operations. | Separate committed, pending, known failed, and unknown at cutoff. Observe whether fewer retries hide a stalled journey. |
| Improve loading | Median/tail elapsed time for the defined path to a usable outcome, plus status comprehension. | Report timeouts and unfinished attempts separately; a fast subset of successful waits is not the whole journey. Check errors, timeouts, and whether progress stays understandable with motion reduced. |
| Reuse data, permissions, or filters | Completion of the actual feature task, including manual fallback; time or steps to recover a filtered search. | Wrong data reuse, unexpected access, blocked decline/revocation, stale results, or reset that clears too much. Permission-grant rate is not a target in itself. |

Compare before/after only within comparable build, traffic, environment, and outcome windows; label observational changes as such. If there is a genuine choice between two safe patterns, test it with a suitable experiment. Do not make accessibility, required disclosure, or safe recovery a withheld treatment. Share actual counts, environment, limitations, and remaining risk alongside any estimate.
