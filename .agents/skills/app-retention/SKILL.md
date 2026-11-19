---
name: app-retention
description: "Design and audit evidence-informed app activation and retention. Use for onboarding, first value, repeat use, reminders, streaks, defaults, stopping points, saved progress, personalization, or retention A/B tests. Recommend changes that help users complete their own goals and return when the need recurs."
license: MIT
---

# App Retention

Help the user build an app people return to because it works for them. Optimize successful actions and repeat outcomes at the natural cadence, not time on screen, compulsive checking, or difficulty leaving.

## 1. Choose the job and mode

- **Build** a new flow, **audit** an existing flow, **plan an experiment**, or **explain the evidence**. Use the narrowest mode that answers the request; don't run a whole-product audit for a copy edit.
- For a real project, inspect the files, screenshots, or metrics that are available. Separate what you observed from what you infer. If a key choice depends on missing audience, task, or cadence, ask at most two focused questions; otherwise proceed with explicit assumptions. Don't invent baseline data, screenshots, users, or prior results.
- Review without editing unless the user asks to implement. If implementing, follow the project's conventions, change the smallest flow that solves the problem, and run its relevant checks. Do not deploy a test or send real reminders without authorization.

## 2. Define meaningful success

Record the **user**, **real situation**, **core task**, **qualifying completion**, **quality check**, and **natural return window**. Example: “A team lead saves a weekly review with a decision and a next step; the following workweek is the next opportunity.” An open, swipe, click, or reminder tap is not proof of value. For episodic tools, measure success when the need arises; users may not need to return.

## 3. Match the change to the bottleneck

| Pattern | Look for | Recommend |
|---|---|---|
| The Itch | People want to do the task but miss the right moment. | Start with a user-chosen cue, visible resume card, or factual update. Offer a specific reminder after showing its value; it should be optional and easy to stop. |
| The Lazy Thumb | People get lost, type too much, or hit the wrong control. | Use one clear, reachable start/resume action. Reduce steps that don't improve the outcome; keep review or confirmation for consequential actions. |
| The Paved Path | People don't know what to do next. | Show one appropriate, explained suggestion and a visible alternative. Keep overrides easy. Never preselect optional sharing, payment, or consent. |
| The Slot Machine | People can't tell they succeeded, or the task feels repetitive. | Give dependable feedback, save the result, and offer useful variety if it improves the task. Don't add rerolls, paid random rewards, invented scarcity, or uncertainty around earned results. |
| The Bottomless Pit | People get stuck on errors or continue past their intention. | Separate accidental dead ends from true completion. Provide an honest end, easy exit, and voluntary continuation; repair errors without filling every exit with content. |
| The Piggy Bank | Returning means starting over. | Save user-owned drafts, history, or preferences first. Add explainable recommendations only if useful. Make pause, reset, export, and deletion clear where applicable. |

Choose the first user problem supported by the evidence, not a quota of six features. Prioritize lost work, misleading consent, inaccessible exits, and unsafe actions as defects to fix, not experiments to keep running.

## 4. Specify the smallest complete flow

Use **home → start/resume → complete the core task → confirm the result → done → resume when useful**. Keep the core usable with optional tracking, notifications, and personalization turned off. Define only the relevant states: new, in progress, returning/lapsed, caught up, empty, denied permission, offline/slow network, and error. Verify accessible labels, focus, and tap targets on the target platform; give controls a non-gesture alternative. Where work can be retried, guard against duplicate saves and make pending sync explicit.

For reminders, use a requested schedule or event, respect opt-out and quiet hours, and recheck completion and expiry before sending. A stale or unauthorized link needs a safe fallback. Put the user in control of what is collected; don't add raw sensitive content to analytics or lockscreens. Flag a separate review for minors or high-stakes contexts rather than treating the playbook as universal compliance advice.

## 5. Decide how to evaluate it

- Pick **one primary outcome** per change: first qualifying completion, a successful return in the next realistic cycle, or success per eligible opportunity. State the event, denominator, time origin, window, and quality threshold. Report quality and user control alongside it.
- For A/B tests, use a stable assignment before exposure. Evaluate the planned eligible **assigned** cohorts with mature windows; don't restrict to clickers or completers. Check split and telemetry quality before interpreting the result. Define practical thresholds, guardrails, and stop/rollback criteria in advance. Report absolute percentage-point differences separately from relative lift.
- Use usability tests or an explicitly exploratory pilot when traffic or measurement is insufficient. Don't promise a lift from a published study or mistake the absence of evidence of harm for safety.

## 6. Deliver the requested artifact

| Mode | Return |
|---|---|
| Build | User job and cadence, a first-release flow with copy and edge states, prioritized next changes, value event, and acceptance tests. Use the [build brief](assets/retention-brief.md) when a handoff is useful. |
| Audit | Rank the top findings. For each, show the observed state (file/screen if known), user impact, recommended fix, measure, and acceptance check. Label unverified findings as hypotheses. Use the [audit template](assets/retention-audit.md) for a full audit. |
| Experiment | Hypothesis, control and treatment, eligibility and assignment, outcome and guardrails, run length or pilot alternative, decision rule, and QA. Use the [experiment template](assets/experiment-plan.md). |
| Evidence | Give the finding, evidence type, what was measured, limits on transfer, and source link. Clearly distinguish experiments, observational associations, company claims, litigation reporting, and teardown observations. |

Before handing off, check that the success metric is an actual user outcome, the task still ends cleanly, the first change targets the observed bottleneck, and every specific claim or assumption is labeled.

## Load only the resource you need

Resolve these paths from the directory containing this `SKILL.md`, not from the target app repository. The core workflow works without tools or network access. Copy only the relevant template when needed; don't edit the installed skill while using it.

| Need | Resource |
|---|---|
| Cue design, fast entry, or reversible defaults | [Activation patterns](references/activation-patterns.md) |
| Progress feedback, stopping points, saved work, or personalization | [Repeat-use patterns](references/return-patterns.md) |
| Screen states, instrumentation, accessibility, or release QA | [Implementation and QA](references/implementation-and-qa.md) |
| Metric definitions, experimental design, and guardrails | [Measurement and experiments](references/measurement-and-experiments.md) |
| Original video timestamps, numeric claims, Yazio or Finch | [Video and evidence](references/video-and-evidence.md) |
| Source details or a specific evidence ID | [Source library](references/source-library.md) and [filterable source index](assets/research-source-index.csv) |
| Approximate sample size for a simple equal-arm binary A/B test | [Sample-size helper](scripts/plan-sample-size.py) (optional Python 3.8+); use `--help` from the skill directory. |
