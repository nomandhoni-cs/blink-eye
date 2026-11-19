# Measurement and experiments

Use this when planning measurement or testing a particular change. The [experiment plan](../assets/experiment-plan.md) is copyable. The optional [sample-size helper](../scripts/plan-sample-size.py) reproduces the fixed-horizon binary-outcome example, not a general power analysis.

## Metrics that tell you if the product improved

Select **one primary outcome per experiment** and define event, eligible cohort, clock, window, and quality threshold before launch. The examples below are starting definitions, not external benchmarks.

| Metric | Suggested definition | Interpretation |
|---|---|---|
| First-value rate | Unique eligible users with a qualifying completion in `[start, start + 24h)` ÷ all eligible users whose full window elapsed and outcomes are observable as designed | For an A/B test, use all mature eligible assignees under the planned ITT measurement; don’t restrict to people who clicked |
| Time to first value | Time from eligible start to qualifying completion; report p50/p90 among finishers **and** the fraction that never finished within the window | A lower median among a smaller set of finishers can be misleading |
| Week-2 meaningful return | Users with a qualifying return action in `[start + 7d, start + 14d)` ÷ the same eligible, mature cohort | Use a fresh value action, not an open. State whether first-week completion is required. For causal tests, don’t condition on a first-week action affected by treatment. |
| Activation-to-repeat (diagnostic) | Users with a second distinct successful action in a later expected cycle ÷ users with a first successful action and mature follow-up | Useful for diagnosing where activation loses value; not a substitute for a comparison among assigned users |
| Opportunity success (event-driven) | Resolved intents / eligible observed opportunities; use a fixed response window and deduplicate | Report what counts as an opportunity; non-return without a new need is not necessarily churn |
| Quality / user control | Pick a quality measure (accuracy, recall, resolution or helpfulness) and a harm measure (errors, opt-outs, reports, inability to stop, or regret) | Define each denominator: e.g. reminder opt-outs per eligible assigned user; show survey response rates with survey results |

Track opens, clicks, session length, daily active users, and prompt opt-in as **diagnostic** metrics. For time-saving tools, successful sessions becoming shorter can be a good outcome. For low-frequency services, measure a completed intended job and responsiveness when a real new need occurs. A completed job is not an “abandonment” just because the person leaves.

## Test backlog

| Priority | Control → treatment | Primary outcome to choose | Stop / rework if… |
|---|---|---|---|
| 1 | Existing entry → one prominent start/resume action with same task | First-value rate within a fixed window | Errors, corrections, or accessibility problems worsen |
| 2 | Generic home → one explained default with alternatives | Successful chosen-task completion | Wrong choices/reversals rise or users can’t find alternatives |
| 3 | Start over → saved context and a resume card | Next-cycle successful return, or time to next value for a specifically eligible return cohort | Progress sync or deletion breaks; results are less correct |
| 4 | No discretionary send → one requested, relevant reminder among opted-in users | Incremental eligible-user completion in the pre-set window | Opt-outs or complaints exceed limits, or a wrong/late send exposes private info |
| 5 | Static content → useful variation at the same task size | Later goal result or verified relevance | Time rises without more value, or users report more regret |
| 6 | Generic empty results → contextual recovery actions | Recovery to successful task | The original goal is obscured or users are pushed into unrelated content |

Use the table to pick the **current bottleneck**, not to run six tests at once. Basic safety, accessibility, and recovery fixes are release requirements, not experiments that need an intentionally bad control. Only test defensible variants.

## Run a trustworthy test

1. **Write a one-page plan.** Include the change, causal hypothesis, population, exclusions defined before assignment, assignment unit (user, account, or team if users share exposure), primary metric, maturity window, meaningful difference, guardrail bounds, and a stop/ramp policy. Hold all else constant where possible.
2. **Assign once and log it.** Use a stable split before exposure; log actual exposures separately to diagnose implementation. If client events go missing in one variant, the primary data may be invalid. Check sample ratio mismatch (unexpected split size), event duplication, staged rollout health, and the two groups’ telemetry coverage before interpreting results. Keep analyses among assigned eligible units by default, not only notifiers, visitors, or finishers. E26–E27 explain design and diagnosis. [Springer practical guide](https://link.springer.com/article/10.1007/s10618-008-0114-1) [Fabijan et al. sample-ratio paper](https://dl.acm.org/doi/10.1145/3292500.3330722)
3. **Plan for traffic and follow-up.** Illustrative power check: with a 20% baseline and a minimum detectable increase of **3 percentage points** to 23%, a simple two-arm test of proportions at two-sided 5% significance and 80% power needs about **2,940 users per arm** under independent, equal allocation, before losses or design adjustments. At 1,000 eligible users per week total, that is roughly six weeks to enroll, **plus** the last users’ outcome window (e.g. two weeks for Week 2). Calculate for your actual test; do not peek and stop on the first favorable result unless using a valid sequential plan. For low traffic, use usability sessions or staged pilots to learn and report the uncertainty rather than claiming a lift.
4. **Decide using the outcome and the guardrails.** Show baseline, treatment rate, difference in percentage points, relative lift, planned confidence interval, mature denominators and missing-data notes. Ship when the result meets the pre-specified practical and statistical criteria and guardrails have adequate data to rule out unacceptable regressions. “Not significant” does not mean a guardrail is safe. Severe cases such as privacy leaks, unauthorized sends, lost work, or inaccessible exits warrant immediate rollback. Recheck at the next cadence for novelty effects.
