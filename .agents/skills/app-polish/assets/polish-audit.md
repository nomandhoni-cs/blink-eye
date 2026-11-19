# 12-point flow audit

Use on one task, not a whole app in the abstract. [Skill workflow](../SKILL.md) · [Caption and evidence map](../references/video-and-evidence.md) · [Release test matrix](state-matrix.md)

**Flow and user goal:** …  
**Start → actual completion signal:** …  
**Build/screen, platform, account role, locale, and constraints:** …  
**What I could inspect or run:** …  
**Known gaps (e.g., no staging backend, native device, or screen reader):** …

| # | Check | What a scoped pass looks like |
| --- | --- | --- |
| 01 | Disclosure at the decision | Actual material terms/visibility are legible before commitment; approved links and acceptance/choice mechanisms work. Optional choices can be declined without trickery. |
| 02 | Empty-state escape | First use, no matches, failure/offline and denied access aren't the same blank view. A relevant action or return is usable without losing unrelated context. |
| 03 | Field help | Labels persist; users can tell what to enter, why, and who sees it before acting when that matters. Relevant help is visibly and programmatically associated. |
| 04 | Success and next step | Pending, local-only, submitted, and committed are truthful where applicable. Important outcomes are perceivable and verifiable later; next step is clear. |
| 05 | Correctable errors | Safe known corrections are specific; outages and unknown outcomes have different recovery. Safe input remains; there is no raw error leak or blind repeat of a consequential action. |
| 06 | Waiting feedback | The app shows what is happening, reports progress only when real, and recovers or reconciles if a wait breaks. Reduced motion preserves understanding. |
| 07 | Repeated entry | Eligible information in the same process is editable or selectable; fresh checks remain where needed. No unauthorized, stale, or cross-account reuse. |
| 08 | Icon meaning and consistency | Users can identify the action, state, and target; accessible names and states are sensible. Existing icon families/tokens are used deliberately. |
| 09 | Action labels | Wording distinguishes next, save, submit, pay, and destructive actions. Actual effect can be predicted; accessible name retains the visible label where applicable. |
| 10 | Permission timing and fallback | Access is limited, contextual, explained, and revocable. A user who declines can do unrelated work and see a fallback or exit. |
| 11 | Filter control | Applied state is visible; remove one, clear all as labeled, and cancel drafts work. Query/sort are preserved when outside scope; stale results cannot override current choices. |
| 12 | Critical copy fits | Material information and controls remain usable at applicable text scales, viewport sizes, and locales. Optional truncation has an accessible route to read more. |

## Record only the findings you can defend

- **Observed:** reproducible in a described build/fixture or directly inspectable in the supplied material. Put an evidence pointer next to the claim. A static mock can demonstrate copy/layout, not live behavior.
- **Hypothesis:** credible risk with an explicit test to confirm it. **Not checked:** no evidence for this branch or environment. **Not applicable:** state the product reason; not a way to dismiss failure.
- **P0** critical harm, misrepresentation, or blocked critical task; **P1** material confusion/rework or broken recovery; **P2** low-impact fit/finish. Use consequence and reach; no weighted premium score. Note what already works.

| Rank / check | Evidence label and short pointer | Trigger and user impact | Smallest fix | Observable retest / owner |
| --- | --- | --- | --- | --- |
| … | … | … | … | … |

**Keep unchanged:** …  
**Follow-up question or dependency:** …
