---
name: app-polish
description: Audit, design, fix, and release-test web or mobile app flows that feel unfinished, confusing, or unreliable. Use for empty states, helper text, confirmations, error recovery, loading and progress, repeated form entry, icons and action labels, disclosures and permission prompts, filter reset, and important text that clips or disappears. Prioritize truthful state, accessibility, and user control over cosmetic redesign.
license: MIT
---

# App Polish

The goal is that a person can predict the action, verify what happened, and recover if it fails. Preserve the app’s design system, platform conventions, product behavior, and approved copy unless the task calls for a change.

## Start with one real flow

1. Identify the user's task, start and end, affected platform, and highest-consequence action. Note the present build or screen, account state, design components, data/permission boundaries, and backend source of truth. If only a screenshot or spec is available, say which behaviors are unverified. Ask only for missing facts that would change the fix.
2. Walk through success and plausible failure branches. Consider first use, zero matches, denied/revoked access, invalid input, delay, offline, unknown outcome, retry or cancel, and return to the flow. Check keyboard and assistive reading, text size, the narrowest supported layout, and localization. Use fake data and local/staging fixtures for destructive or paid actions.
3. Prioritize by consequence: **P0** unsafe disclosure, a misleading commitment or unintended irreversible/duplicate action, or a critical task blocked with no safe fallback; **P1** material confusion, avoidable rework, or a broken fallback; **P2** low-impact polish. Promote based on actual consequence, not appearance. Record the scope and evidence, not a made-up frequency or a composite polish score.

## Choose the work mode

| Request | Work | Deliverable |
| --- | --- | --- |
| **Audit** a flow or screenshot | Use the [12-point audit](assets/polish-audit.md). Check the relevant states and label each finding **observed**, **hypothesis**, or **not checked**. | Ranked findings with task, trigger, user impact, evidence, smallest fix, and a verification check. Note what's already working. |
| **Design or fix** a flow | Define state transitions and authoritative results first. Use the [change brief](assets/change-brief.md) to specify copy, behavior, and acceptance tests. If asked to implement, use existing components, tokens, strings, and tests. | A scoped design or patch, before/after examples, tests run, and remaining risks or dependencies. |
| **Prepare a release** | Adapt the [state matrix](assets/state-matrix.md) for the target environments; keep results and gaps in a copy of the [QA run CSV](assets/qa-run.csv). Follow [release QA](references/release-qa.md). | Per-case results, open gates and owners, known exclusions, and release recommendation. Separate what ran from what remains planned. |

## Rules that prevent common regressions

- **Disclosure is not decoration.** Keep price, renewal, who can see data, or irreversible effects readable at the point of decision. Do not conflate a privacy notice, acceptance of terms, consent for an optional data use, and authorization by the OS. Get current policy/legal review before changing obligations or approved language.
- **Render the real state.** Empty is not offline, queued is not committed, and a timeout does not prove failure. Never tell people to repeat a consequential action blindly; reconcile against its known operation or receipt. Preserve safe input without persisting secrets or crossing account boundaries. Show measured progress only when it exists; never pad a wait or invent a percentage.
- **Keep an exit.** Offer the next useful action, a way back, and undo/pause/cancel only when real. Request only access needed for the chosen feature, with a manual or reduced-access path when feasible. Keep relevant query and sort when clearing filters only, and ignore stale results.
- **Clarity beats decoration.** Use specific action labels, persistent field help when it changes behavior, and understandable icons with accessible names and meaningful states. Keep essential copy visible at larger sizes and in longer translations. Do not use an animation, toast, color, placeholder, or icon as the only carrier of essential information.

## Open just the relevant reference

- [Video and evidence](references/video-and-evidence.md): all 12 caption-derived topics, creator claims, independent checks, and caveats.
- [State and recovery](references/state-and-recovery.md): empty, loading, invalid, offline, pending, committed, unknown, and filter reset (02, 04–06, 11).
- [Copy, permissions, and accessibility](references/copy-permissions-and-accessibility.md): disclosures, field help, safe reuse, icons, labels, permissions, and critical text (01, 03, 07–10, 12).
- [Release QA and measurement](references/release-qa.md): fixtures, before/after verification, task comprehension, and guardrails.
- [Source library](references/source-library.md) and [source index CSV](assets/research-source-index.csv): standards, platform policy, research, and what each can support. Treat heuristics and creator examples as starting points; verify requirements for the target market and platform.

**Optional offline helper:** with Python 3.9+, run `python3 <skill-dir>/scripts/check-qa.py <your-run.csv>` ([script](scripts/check-qa.py)). It checks evidence fields and unresolved gates; it does not exercise the app or certify accessibility or legal compliance.
