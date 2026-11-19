# Small UX change brief

Copy into a design/engineering issue. Link observed findings from the [flow audit](polish-audit.md) and relevant cases from the [state matrix](state-matrix.md).

- **User and desired outcome:** …
- **Observation (or hypothesis), evidence pointer, consequence:** …
- **Scope:** surface, entry/exit, platform, role, locale, build. **Out of scope:** …
- **Existing components, copy and navigation to keep:** …
- **Authoritative data/state source; ownership and permission boundary:** …
- **Constraints:** product rules, latency/timeout, storage/retention, approved copy or review, design tokens, accessibility target. **Owner/approver:** …

## State and copy contract

Use only states the feature actually has. Supply context and exact copy IDs/text; quote illustrative language only if the behavior can support it.

| Trigger / given state | Authoritative fact or transition | Visible text and controls | Accessible name, description, status or focus | Recovery / safe preservation / expiry |
| --- | --- | --- | --- | --- |
| Before action; what is being committed? | … | Verb + object/effect, material terms/visibility, relevant field hint | … | Real exit or decline before commit |
| Loading / pending | … | Truthful status; measured units only where supported | … | Wait, leave, pause, or cancel only as supported |
| Completed / committed | … | What completed, receipt/status link, next step | … | Return to existing result |
| Invalid input / known failure | … | Known correction or service-level fallback | … | Retain safe input |
| Unknown result / stale read | … | Say what is known, distinguish from failure | … | Authoritative lookup or appropriate recovery |
| Empty or no access | … | Cause and next action based on permissions and scope | … | Alternate input, reset, or return |

**Decision-critical strings:** …  
**What may be shortened and how to read it in full:** …  
**If filters:** scope for clear/reset, defaults, Cancel vs Apply, query/sort invariants, late-response rule.  
**If permissions:** actual capability, timing, least scope, decline/revoke, fallback.  
**If a consequential write:** operation identity, known status lookup, retry semantics, duplicate protection, and limits.

## Acceptance evidence

- **Given** [fixture, environment and starting state], **when** [a user action], **then** [visible and authoritative result].
- **Given** [failure, race, denial, long text or assistive setup], **when** […], **then** [truthful state, safe recovery, preserved values, no unsafe side effect].
- **Retest:** expected good path and unchanged behavior (e.g., query/sort, clipboard or keyboard workflow, return/history, existing approved terms, no extra permission).
- **Success measure and denominator/window:** … **Guardrails:** … **How evidence will be redacted:** …
- **Tests run, expected vs actual, remaining gaps, owner:** …
