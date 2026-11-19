# Copy, permissions, and accessibility

Use for disclosures, field help, repeated entry, icons and labels, permissions, and text that doesn't fit (topics 01, 03, 07–10, 12). [Change brief](../assets/change-brief.md) · [Source library](source-library.md)

## The decision comes before the tap

| Element | Communicate | Do not assume |
| --- | --- | --- |
| **Transaction or terms acceptance** | Make the specific commitment apparent before its action; show applicable terms/link and material conditions in readable, reachable copy. Preserve the approved mechanism and version information required by the owner. | A tiny “by continuing” line automatically forms an agreement; a prototype or generic sentence is approved. |
| **Privacy notice** | Explain the relevant data use and who gets it in context; provide access to the approved notice, in-app or web as applicable. Match actual data, SDK behavior, and sharing. | A notice is an opt-in or replaces a separate consent requirement. |
| **Optional data use or communications choice** | Present the choice separately when appropriate, describe use and how to change it, and follow the current consent or preference requirements. No bundling, preselected agreement for an opt-in, or treating dismissal as consent. | Agreeing to terms, browsing away, or granting an OS permission accepts unrelated data processing or marketing. |
| **OS/browser authorization** | Ask for the least access necessary at the point of use; provide a clear purpose and a way to decline where possible. Follow platform, app-store, API, and jurisdiction-specific requirements. | A permission grant is the legal basis, or an app explanation replaces a system dialog or other required disclosure. |

If law, distribution channel, actual data practice, price, cadence, or approved copy is unknown, flag it for the responsible owner. Do not invent a privacy claim, auto-renewal term, jurisdiction, or compliance decision. Aesthetic trust is not evidence of informed consent. Use the filtered sources as an applicability check, not legal advice (L01–L03, P07, P08).

## Write labels and field help people can act on

- Choose established words in the product’s domain. “Add to cart,” “Review order,” and “Pay $24.00” perform different actions. Use a neutral “Continue” when it truly just advances. For a destructive change name the object and consequence; make reviewing/cancelling possible before irreversible commitments. Show the price/cadence or effect beside the label if it need not fit inside it.
- Use a persistently available label. Add a short hint **only** when it answers a real pre-action question: visibility, use, optionality, format, or where to find information. Put material facts in visible explanatory text or a review step rather than expecting a long hint to be read repeatedly. A placeholder is not the label or the only place to learn an input rule (D03, D06, W01).
- A workable example (verify against actual sharing): **Note for the delivery team (optional)** · “The delivery team can read this note on your order.” Not “Add a note…” without an audience. Associate field descriptions/errors using the platform’s accessibility APIs; on web use a native label and a programmatic description, e.g. `aria-describedby` pointing to the relevant text. Verify the visible label appears in the accessible name when applicable. Keep links to extra details independently focusable.

## Reuse the right data, not just any cached value

- In one process, offer “Use the address I just entered” or editable prefill. Say which source is used and show enough of it to verify, subject to privacy. Keep confirmation or fresh entry when essential for security or validity (W01, T01).
- Treat cross-session/device persistence as a separate product and data decision. Decide which values need retention, for whom, for how long, and how to clear or correct them. Keep only necessary authorized data. Never auto-store secrets or disclose another user's info. Scope drafts to account/workspace, recheck on resume, and clear or quarantine them on sign-out/account switch as appropriate. Browser autofill supports entry but is not a substitute for reusing within-process data the app requires again.

## Ask for access at the point of use

1. Map feature → user goal → required capability → minimum scope → fallback. Remove unused prompts and SDK-triggered requests. Prefer OS pickers or approximate/one-time access where they can serve the goal; don't request a gallery, contacts, or precise/background location just to offer a shortcut.
2. Trigger the request from the relevant user action (e.g. “Use my location,” not merely arriving on a map). Use supported platform prompts with accurate purpose text. If a rationale is needed, follow the platform’s rules for that prompt and any required disclosure. Do not imitate the system dialog, promise a setting you cannot change, or repeatedly prompt after dismissal (P01, P02, P07, P08).
3. Design for granted, limited/one-time, denied/restricted, and later revoked. Recheck actual access on use/resume rather than relying on a cached grant. Offer an alternative (“Enter a city”) when feasible. If access is essential only for one feature, explain the impact and give a way out. Offer a settings route only when supported and helpful; let people decide whether to use it. Treat a decline as a valid choice, not a failed conversion (R06).

## Keep the interface understandable without perfect vision or layout

**Icons:** Use the existing visual family and size/weight tokens. Intentional outlines/fills for selected state, and platform-specific symbols, do not need homogenizing. Give controls functional accessible names and appropriate roles/states; selected, expanded, disabled, or pressed status must not be encoded only in color. Hide redundant decorative glyphs from assistive reading. Use a visible label with unfamiliar or high-consequence icons; a hover-only tooltip doesn't work for touch. Check actual pointer targets, contrast, focus, and reading order, not just glyph pixels (W01, W02, D01, P04, R05).

**Text:** Make an inventory of decision-critical strings: price and billing interval, cancellation or irreversible effects, audience/recipient, required field rules, exact status and error recovery. Set layout to wrap and grow, and allow actions to stack or move below content. Use localized full sentences and formatting rather than stitched-together fragments; test long real values, plural forms, and mixed direction names/numbers. Allow optional previews to truncate only with an evident keyboard/touch-operable route to the complete text. Keep critical details visible by default, before commitment and not behind a tooltip or disclosure link.

**Verification:** For web, test WCAG 2.2 1.4.4 (up to 200% text resize in an applicable supported mechanism, with no loss of content/function) and 1.4.10 (reflow at 320 CSS px width for vertically scrolling content or 256 CSS px height for horizontally scrolling content, with the criterion's necessary 2-D exceptions). They are separate checks, not a mandate that every viewport reproduce the same layout. Use platform text scaling on native devices (e.g., Dynamic Type); use expanded and RTL pseudolocales plus actual translations. Verify reading/focus order and that fixed bars and the on-screen keyboard do not cover the details or submit action (W01, P05, P06, L03). See [release QA](release-qa.md) for test scope. Passing these selected checks is not blanket conformance.
