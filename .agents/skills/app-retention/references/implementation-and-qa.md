# Implementation and QA

Use this as an adaptable MVP specification, not a mandatory stack or scope. Start with a real user situation and natural cadence. Adapt the [build brief](../assets/retention-brief.md) for handoff.

## Examples by app type

| App type | Meaningful completion | Natural return | What to verify beyond the count |
|---|---|---|---|
| Learning | Attempt a defined practice set and receive feedback | Planned practice days | Recall or transfer on a later check, not just XP |
| Wellness | Finish a user-chosen exercise or save a check-in | User’s chosen schedule; never require daily use | User-rated helpfulness, distress complaints, ease of pausing |
| Productivity / SaaS | Mark a real task done, send an approved report, or ship a decision | Work cycle, e.g. weekly | Correct output, less rework, faster completion |
| Discovery / content | Find a relevant item and mark it useful, or intentionally finish a chosen set | When new useful material is available | Relevance, regret, ability to stop; a save alone may be only a proxy |
| Community / dating | Exchange a wanted reply or build a safe, mutual connection | Meaningful reply or genuine update | Report/block rate and quality; a match or swipe alone is a weak proxy |
| Marketplace / occasional utility | Complete a booking, resolve an issue, or receive a requested availability alert | A real need or status change | Successful resolution; no return may mean the app worked |

**Research the real cue.** If you have little evidence, talk with 5–8 people in one priority segment as a starting point, not a representative survey. Ask about the *last real occurrence*: “What happened just before you needed this? What did you do instead? What made it hard? When were you done?” Observe their current workaround. Map 2–3 recurring situations and start with the one that combines demonstrated need, achievable value, and low risk. If no natural repeat need emerges, optimize first-use success and being findable at the next need instead of manufacturing a reason to return.

## What to ship first

Build one complete flow: **home → start or resume → do the meaningful task → see the result → stop → return to saved state at the next useful moment.** A basic flow with consistent behavior across devices is a better first release than a bundle of incomplete reminders, badges, and feed features.

| Screen / service | Required behavior | Acceptance check |
|---|---|---|
| Home | First view names the next useful action, expected effort if known, and an alternate route. A no-task day has a clear ending. | New, returning, lapsed, and caught-up users see the right state without extra onboarding. |
| Task | Clear success criteria, save draft if it helps, and manual fallback for automation. The next tap never silently submits a paid, public, or irreversible action. | Failure leaves a recoverable draft; permission denied is handled; repeated taps do not create extra records. |
| Completion | Show the accepted result and whether it is local or synced. Provide `Done` and, if valuable, a voluntary next action. | Accessibility announcements name success and errors; back/exit don’t activate another task; display no false “saved” state. |
| History / settings | View and resume work. Edit goals/preferences; disable reminders and personalization separately. Include account/data controls if applicable. | Resetting suggestions preserves work; import/export scope and deletion state are clear; disabled features are not silently re-enabled. |
| Optional reminder service | Choose a user-specified time or a truthful triggering event. Recheck applicability at send time and respect cancellation. | Tests cover duplicate workers, quiet hours, late/offline completion, changed time zone, stale link, logout, and account deletion. |

Example UI sequence for a weekly review tool (substitute your own core action):

```text
First visit:   [Start a weekly review]   [See an example]
Task:          Summarize one outcome and record one next step → [Save review]
Completion:    Review saved · 1 next step recorded      [Done]  [View review]
Optional ask:  Remind me on Fridays at 4:00 p.m.?       [Set reminder]  [Not now]
Next visit:    [Resume your draft] or [Start this week's review]   [Past reviews]
Caught up:     This week's review is complete.         [Done]  [View saved work]
```

**Suggested service behavior.** Use a stable action ID for a task or draft and an idempotency key for each write. Choose a source of truth for completion (server acceptance for synced flows; committed local save for local-first flows). For offline sync, keep the original action ID and reconcile it on upload; show `Saved on this device — sync pending` where needed. Do not count outbox retries as new work. Define the clock and time-zone policy for calendars and reminders, handling travel, daylight-saving gaps/overlaps, and edits. Ensure a deep link rechecks authorization on arrival and has a generic fallback rather than revealing private content. If you cannot safely recover from a missing dependency, show a clear retry or stop path.

## Minimal instrumentation

Add optional measurement only on an approved basis, and do not make the core flow depend on it. Use a small, versioned schema: event ID, event timestamp, ingestion timestamp, permitted pseudonymous actor or cohort key when needed, action kind (an enum), entry source, variant if assigned, and a stable attempt/action key only where necessary to join or deduplicate. Keep sensitive content in the product store, not in event payloads, crash logs, or push metadata. Separate flags, analytics permission, and service-critical data processing.

| Event | When to emit | Why / safe properties |
|---|---|---|
| `eligible_start` | First moment a user qualifies for this flow or cohort | `entry_surface`, `schema_version`; fix eligibility before randomization |
| `experiment_assigned` | Once when an eligible unit receives a variant | `experiment_id`, `variant`, assignment timestamp; distinct from actual feature exposure |
| `next_action_shown` | A recommendation or CTA was actually rendered | `state=new/resume/due`, `reason_code`; optional for diagnosis |
| `core_action_started` | The user deliberately enters the main task | `entry_source=home/reminder/other`, `action_kind` |
| `core_action_committed` | The defined value event is accepted and persisted | Deduplicate using opaque `action_id`; log action type and success time, not the artifact body |
| `core_action_failed` | A real attempt fails | Coarse `error_code`, retryable flag; not raw error bodies or comments |
| `completion_shown` | The result and stopping point are visible | Verify confirmation is shown after value, not just a click |
| `reminder_sent` / `reminder_opened` | Dispatch is accepted / link is opened | Use a minimal campaign category; opened and delivered are distinct, and delivery may be unobservable |
| `control_changed` | User disables or edits reminders or personalization | Control type and new state, not the preference contents; monitor suppression separately |

Useful service or privacy audits can measure `export_completed` and `deletion_completed` with purpose-limited operational logs rather than general analytics. Never silently treat incomplete measurements from consent changes, logging failures, or deleted records as “did not complete.” Investigate bias, follow the retention policy, and report what the data covers. For teams that cannot measure optional events lawfully or reliably, start with observed usability and consented research instead of recording more data.

## Delivery phases and release checklist

Use these as rough development phases, not a promise that a retention experiment will finish in a month.

| Phase | Deliverables | Gate before moving on |
|---|---|---|
| **1 · Discover and baseline** | One segment, one useful task, one agreed cadence. Journey audit, baseline metrics, consent/data plan, two clickable prototypes. | Real users describe the same recurring problem; you can observe success independently of opens. |
| **2 · Ship the core** | One home CTA, safe task start, sensible fallback, completion and `Done`, minimum instrumentation. | People can complete the task without coaching; no blocking accessibility, accuracy, or data-loss defects. |
| **3 · Preserve continuity** | Save/resume, durable history or one template, core settings and data controls. Pilot and test the riskiest growth assumption. | Reliability and privacy QA pass; mature cohort results are available before drawing a retention conclusion. |
| **4 · Add one enhancement** | Either a user-requested reminder or a simple preference-driven recommendation, depending on friction. Add additional polish only after testing the useful outcome. | Incremental value, verified respect for opt-out/stop, and no unacceptable guardrail movement. |

**Release checklist**

- [ ] A real user need, cadence and qualified success event are written down; the app does not invent a daily goal for infrequent tasks.
- [ ] The main action works for first-time, returning, lapsed, caught-up and offline/error states. It has left/right-hand and assistive-technology coverage.
- [ ] The app acknowledges true success, offers `Done`, and does not sneak a second session or purchase into an ordinary action.
- [ ] Optional prompts, tracking and personalization remain optional. No fake like, threat, urgency badge, hidden opt-out, or deliberately missing exit.
- [ ] Users can resume the work they own, and export or delete data as applicable. Clicking `Reset suggestions` is not a destructive account action.
- [ ] For minors, health, finance, or other high-stakes audiences, review feature risks before rollout. Default to less collection, less prompting, no odds-based rewards, and clear explicit decisions where they matter. FTC and EDPB examples and the EU Commission’s minors guidance are review inputs, not a substitute for checking your jurisdictions and app-store rules. [FTC staff report](https://www.ftc.gov/reports/bringing-dark-patterns-light) [EDPB guidance PDF](https://www.edpb.europa.eu/system/files/documents/2023-02/edpb_03-2022_guidelines_on_deceptive_design_patterns_in_social_media_platform_interfaces_v2_en_0.pdf) [EU Commission’s minors guidance](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors)
- [ ] Experiment assignment, privacy-safe event verification, guardrails, and a rollback owner are in place. The build is useful even with no push or ML.

## Manual QA scenarios that catch costly failures

| Exercise | Pass condition |
|---|---|
| Open the app with permissions denied and optional tracking off | Complete the core task and stop without an upsell, permission loop, or missing control. |
| Save on a weak connection, close mid-sync, then retry | Exactly one committed action is shown and counted; if unsynced, copy states where data lives. |
| Finish the same task on device B before a queued reminder on device A | No reminder after the completion is known to the service; an already-delivered stale link opens the completed state, not another duplicate task. |
| Return after missing a week or changing time zones | History is intact, time labels are coherent, and the user can resume or choose another task without a guilt message. |
| Use large type, screen reader and keyboard/switch navigation | Start, alternatives, skip/pause, result, and exit are labeled, reachable, and focus follows the task. |
| Reset suggestions, then export and delete a test account | Reset keeps user work; export contains only the expected data; deletion clears access and pending jobs as designed. |

## Brief you can hand to a team or coding assistant

```text
Target user / recurring situation: [fill in]
Core job and natural cadence: [fill in]
Meaningful value event and quality test: [fill in]

Implement the smallest complete flow: Home → Start/Resume → Core task →
Verified completion → Done. Preserve useful drafts and progress. Show one
recommended action with alternatives; don’t auto-submit consequential choices.
Support permissions denied, offline/slow network, empty, error, and lapsed states.
Use clear tap targets, labels, focus order, and one-handed/device QA.

If needed, add only a user-selected reminder with real relevance, opt-out,
suppression, and deep-link fallback. Do not add an endless feed, autoplay by
default, paid random rewards, guilt copy, or unnecessary tracking.

Instrument the committed core value event, agree on the primary cohort metric
and guardrails, and flag changes for rollback. Deliver screen states, data
mapping, acceptance tests, and a test plan. State assumptions; do not invent
product requirements, evidence, or expected lift.
```
