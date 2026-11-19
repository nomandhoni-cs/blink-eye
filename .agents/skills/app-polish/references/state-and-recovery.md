# State and recovery

Use for empty results, confirmation, errors, waiting, and filters (topics 02, 04–06, 11). [Evidence and limits](video-and-evidence.md) · [State matrix](../assets/state-matrix.md)

## Decide what the system knows before writing copy

For each branch, name **the event, the authoritative fact, the visible status, where focus belongs, the next safe action, and what survives navigation**. A result view should not derive “first use,” “no matches,” and “service unavailable” from the same empty array. A client timeout only means the client did not receive a result in time. A queued request might never commit.

| State | What is true | Example and useful next action |
| --- | --- | --- |
| First use | The initial load succeeded; the user owns no items of this type. | “No saved lists yet.” Offer “Create a list” if they are allowed to create one; otherwise explain what populates the list or let them return. |
| Filtered empty | The current query and filters completed with no matches in scope. | “No results for ‘gardening’ with these filters.” Keep query and choices visible; “Clear filters” or edit query. |
| Read unavailable / stale | Latest data could not be fetched. Old data may still be accurate or useful. | “Couldn’t refresh. Showing results from 09:30,” if actually cached and safe to show. Offer retry/back, not an empty claim or a spinner forever. |
| Not permitted | The user or this app instance lacks an authorization this feature needs. | “Location is off. Search by area instead.” Never show restricted items or imply they do not exist when appropriate disclosure is a policy matter. |
| Invalid / rejected | A rule prevented this action, with no commit. | “Enter a date on or after 19 November,” if it is the actual rule. Preserve other safe fields. If the service cannot do what's requested, don't style it as a field error; offer the available alternative. |
| Pending / queued | Specific work is in progress or stored for later; the final result is not known. | “Changes saved on this device. Waiting to sync,” only after the local write succeeded; show how to check or manage sync. |
| Committed | The product's authoritative source confirms the specified operation. | “Booking confirmed for Tuesday at 10:30.” Show reference, next steps, and a route back. “Request received” is not “You’re approved.” |
| Unknown | Connection or timeout interrupted a write; success or failure is not known. | “We couldn’t confirm your booking. Check booking status before trying again.” Use a stable way to reconcile; offer help if no self-serve lookup exists. |

### Recovery is a real path

- Put a relevant action or exit **in** the empty or error view. Don't manufacture a create/import button the user cannot use, show a reset when there are no applied filters, or treat lack of data as a dead-end upsell. Keep back accessible.
- Use inline field errors and where appropriate a linked error summary using the existing accessible component. On failed submission keep safe input and make the first correction findable. Avoid premature “invalid” messages during typing. Do not echo raw errors, secrets, sensitive personal info, or account existence. A non-revealing authentication response can still offer a reset/sign-in path (D05, W01, T01).
- For consequential commits, don't rely on a transient toast. Give an accessible inline or dedicated result, next step, and durable record where possible (D04). For within-view status, expose qualifying messages via appropriate semantics, often a polite status region on web; avoid duplicate/noisy announcements. For route changes or dialogs, give the resulting state appropriate focus instead of announcing everything again. Manually test speech output and return focus (W01).
- For a consequential write, define operation identity and retry behavior before exposing Retry. Reconcile unknown results against the authoritative status. Reuse the same operation identity for the same intent when the server/API supports idempotency; define scope, lifetime, and what changed payloads mean. Suppress accidental multi-submit in the UI too, but do not treat that as server protection. Cancel after commit is a distinct action unless the product genuinely supports undo (T02).
- Record what happens when a user leaves, backgrounds, goes offline, returns after expiry, or signs out. Durable pending status is only an option where the backend or approved local storage supports it. If the system cannot cancel a request, don't advertise “Cancel” when the action merely closes the view.

## Make waits honest

1. **Improve elapsed time first.** Measure from meaningful user action to content/actionable outcome. Segment backend work, client rendering, and offline/cache paths; don't add an animation minimum that slows a completed task. For quick responses use immediate interaction feedback without a flash of a placeholder.
2. **Measured work:** Show meaningful units, e.g. “Uploading 2 of 5 files,” if true. If upload bytes reach 100% but processing continues, say “Processing files” as a distinct phase. Show an ETA only if estimation is reliable and updated; distinguish a recent timestamp from an estimate.
3. **Unmeasured work:** “Checking availability…” plus an indeterminate indicator is valid. Use a skeleton only if layout is reasonably known, not as a universal upgrade; hide decorative placeholders from accessibility traversal and don't make them interactive. A web progress bar with unknown value should not report an `aria-valuenow`. Avoid announcing every tick, percentage, or animation frame.
4. **A bounded foreground wait:** Use actual service limits and latency to design timeout behavior, not a single arbitrary universal threshold. Give status/retry for a failed read, status lookup for an uncertain write, and real cancel/pause/background where safe. On reduced-motion settings, text or a restrained/static state should remain sufficient. Check slow, stalled, fast, failed, recovered, and navigated-away variants (P03, W01, R01–R04).

## Make filter state reversible and visible

- Map the state explicitly: query, sort, **applied filters**, optional **draft filters**, default baseline, constraints that cannot be cleared (e.g. workspace/access), paging, and request identity. Document where state lives (screen, navigation history, shareable URL if appropriate). Avoid putting sensitive query parameters in shareable URLs or analytics by default.
- For instant filtering, label active filters and give each removal a specific accessible name (“Remove filter: Open now”). Place “Clear filters” near results when applicable, not only inside a hidden panel. It clears the promised scope, not query or sort by surprise. If a reset restores nonempty defaults, say “Reset to defaults” and keep those defaults visible. Don't present entitlement or safety rules as clearable user choices.
- If filters are batch-applied, reopening should reflect applied state. Editing the sheet changes only drafts; **Apply** updates results; **Cancel / back** discards the draft unless the app explicitly offers saved drafts. A draft reset is not the same as clearing applied filters. Label them accordingly.
- Recompute the requested result slice after changes (often reset the page/cursor); retain scroll/context if it serves the task. Compare the query, sort, and filter combination or request version before accepting responses; cancel obsolete requests where possible, but still ignore late results. The visible chips/count, results, and announced result status must agree on the same latest applied state (D07, D08, W01).
