# Video and evidence: the twelve points, in order

**[These 12 Mistakes Make Your App Feel CHEAP](https://www.youtube.com/watch?v=q4TdOOkCDbw)** · Wyatt Feaster · November 3, 2026 · 8:48 (V01)

This is an **untimed, caption-derived guide**, not a verbatim transcript. The English captions were read across the watch page and short-link continuation. Those renders had no cue times; the public player request in this environment did not expose a timed track. The audio and on-screen examples were not independently verified. To find a line in the original, open the video description and select **Show transcript** ([YouTube instructions](https://support.google.com/youtube/answer/15930243?hl=en), V02). The numbered headings below follow the spoken order and aren't uploader-supplied chapters. The phrases to search are caption cues, not measured offsets.

**The argument:** Feaster says small omissions leave people in doubt about who is asking, what they are committing to, whether the app is working, or where to go next. He describes this as a difference between “cheap” and “premium.” This skill treats that as an editorial framing. It tests whether people can understand, complete, and recover from the task, not whether a design looks expensive. No source establishes that the twelve changes together cause a general uplift in trust, retention, or conversion.

**Source key:** Standards and platform policies tell you what to check when applicable; heuristics and design systems give patterns; studies inform specific hypotheses. IDs link through the [annotated source library](source-library.md) and [CSV](../assets/research-source-index.csv). The sources below are independent follow-up reading except where credited as creator or publisher material. The captions do not identify the waiting-time research they mention.

## 01. Missing legal copy

- **Caption cue:** “Missing legal copy.” The video uses a terms line near a signup button as an example of a detail that reassures someone giving an email or phone number.
- **Evidence and limit:** The Ninth Circuit’s *Berman* decision examined conspicuous notice and unambiguous assent on specific sites, not a psychological trust effect or worldwide rule (L01). The GDPR distinguishes transparency and consent where it applies (L02); Apple and Google Play have their own requirements in scope (P07, P08). General terms text cannot substitute for a specific disclosure or required consent. No cited study establishes that sprinkling in legal copy improves trust.
- **Use it:** Identify the actual obligation or data practice. Keep the approved terms mechanism, privacy notice, optional choices, and device authorization distinct. Make the links readable and reachable before commitment; check that declining an optional choice leaves the core flow intact.

## 02. Empty state with no way out

- **Caption cue:** “No way out of an empty state.” An empty screen leaves someone stuck; the creator suggests giving them a real exit.
- **Evidence and limit:** Nielsen’s control/visibility heuristics (D01) and Kaplan’s examples of empty states in complex apps (D02) support distinguishing causes and offering a next action. These are not effect-size estimates. An empty optional feature does not always need a primary CTA.
- **Use it:** Test first use (a way to start), zero results (change or clear the relevant filters), unavailable data (retry, reconnect, or return), and no access (a safe fallback). Don't let a fetch failure claim there is no data. Preserve context when going back.

## 03. Missing helper text

- **Caption cue:** “Missing helper text.” The video asks what someone would do when a form asks for a note without saying where it will appear.
- **Evidence and limit:** WCAG 2.2 3.3.2 addresses labels or instructions where input is expected; 1.3.1 and 4.1.2 separately address relationships and programmatic semantics (W01). GOV.UK gives a field hint pattern for information like use or format (D03). This does not mean add a hint to every field or rely on hints to explain long consent terms.
- **Use it:** Label the field, say who can see the note and where, and give constraints before input. Keep the hint visible as the user types and associate it with the field. Verify actual visibility with a second permitted test role before publishing a privacy claim.

## 04. Missing success state

- **Caption cue:** “No success state.” The video asks how people can tell whether their action completed, what happens next, or where they can verify it.
- **Evidence and limit:** Visibility of system status is a heuristic (D01); GOV.UK recommends a reference, next steps, and a retrievable record for transactions (D04). WCAG 4.1.3 concerns qualifying status messages without a focus change; a new page needs appropriate page structure/focus behavior, not a duplicate live announcement (W01).
- **Use it:** Confirm the state your system can prove. “Draft saved on this device” and “Sent to your team” are different. For a consequential action, show a durable result, receipt, or status. Never present an animation as proof of completion.

**Promotion break:** Between 04 and 05 the creator promotes Mobbin and mentions browsing Uber and Headspace for inspiration. The description includes an affiliate-style link. This segment is not independent UX evidence and does not show how the named products affect user outcomes. The creator’s [Vamo portfolio write-up](https://www.dugdugstudios.com/work/vamo) (V03) is a separate, illustrative source—not a verified video case or a causal test. It describes adding wait time to signal diligence; this skill does **not** recommend padding a wait.

## 05. Generic error messages

- **Caption cue:** “Generic error messages.” The video contrasts a catch-all failure with a description of what would fix an invalid password field.
- **Evidence and limit:** WCAG 3.3.1 addresses identification of automatically detected input errors; 3.3.3 calls for a known correction, with security and purpose exceptions (W01). GOV.UK distinguishes input errors from service-side issues and preserves responses during validation (D05). OWASP recommends non-revealing responses when a message could disclose account existence or status (T01). More specific is not always safer.
- **Use it:** Make field errors actionable, explain real service outages, and give a different path for an unconfirmed outcome. For a lost payment response use “We couldn’t confirm this payment. Check order status,” not “Payment failed” plus a blind retry (T02).

## 06. An unexplained spinner

- **Caption cue:** “Basic spinners.” The video suggests describing the ongoing work, using an animation or skeleton, and claims that understanding a wait can make it feel shorter.
- **Evidence and limit:** Apple distinguishes measurable from indeterminate progress (P03). Maister’s 1985 service-queue essay offers propositions about uncertainty, not app experiments (R01). Hui and Tse’s experiment found that information effects depend on wait length and that perceived duration did not mediate service evaluation in their model (R02, abstract). Harrison et al. had people compare equal-duration progress bars; visual behavior affected perceived duration without changing speed (R04). Mejtoft et al. did not find a statistically significant spinner–skeleton difference in their fictional news-site comparison (R03, abstract). That neither proves equivalence nor makes skeletons superior.
- **Use it:** Reduce real latency first. Use an understandable indeterminate label if work cannot be measured, or an accurate unit/phase if it can. Verify timeouts, failure, cancel/background where supported, and reduced motion. No fabricated progress or delay for effect.

## 07. Re-entering information the app already knows

- **Caption cue:** “Asking for information that the app already knows.” Feaster compares repeat address/email/phone questions to being asked the same thing in conversation, mentioning insurance quotes as an example.
- **Evidence and limit:** WCAG 2.2 3.3.7 applies to information required again in **the same process**: populate it or make it selectable, unless re-entry is essential, necessary for security, or the information is no longer valid (W01). It is not a mandate to retain data across sessions. Browser autofill alone does not meet this within-process obligation, per the W3C explanation. Data minimization applies where required (L02).
- **Use it:** Offer an editable, authorized value, such as “Use delivery address for billing.” Test correction, stale values, return paths, and sign-out/account switch. Respect verification boundaries; never copy one user's details into another user's form.

## 08. Mismatched icons

- **Caption cue:** “Mismatched icons.” The video calls out conflicting weights, fills, and colors as signs that a UI was assembled piecemeal.
- **Evidence and limit:** Consistency is a heuristic (D01), and SF Symbols illustrates shared weights/scales within an ecosystem (P04). McDougall et al.'s icon ratings distinguish familiarity, complexity, meaningfulness, and semantic distance (R05); they do not establish the impact of mixed stroke weights. WAI guidance and WCAG support purpose, programmatic names/states, contrast, and targets (W02, W01).
- **Use it:** Keep the current icon family/tokens, with deliberate variant changes for state. Fix misleading or unlabeled icons before styling mismatches. Test whether users can identify the action without relying on shape/color alone or on a hover-only tooltip.

## 09. Vague action copy

- **Caption cue:** The track misrecognizes “Vague copywriting”; the video contrasts “Let's go” with “Confirm purchase” and “Add” with “Add to cart.”
- **Evidence and limit:** GOV.UK’s button guidance describes the actual action (D06); WCAG 2.4.6 and 2.5.3 address descriptive labels and visible text being present in an accessible name where applicable (W01). This is not a blanket rule against all uses of “Continue.” It can be accurate for a step that only advances the flow.
- **Use it:** Use a verb and the object/effect if needed. Distinguish review from commitment and keep total, cadence, or other material conditions nearby (L03). Ask users to predict the outcome before tapping; check that the programmatic name matches the visible label.

## 10. Unnecessary or premature permissions

- **Caption cue:** “Asking for unnecessary permissions.” The creator contrasts blanket access at launch with a request in the context of a specific use like location on a map.
- **Evidence and limit:** Apple and Android give contextual, least-access guidance (P01, P02). Their store policies can add disclosures or conditions (P07, P08). Wijesekera et al.’s 36-person Android field study shows that protected-resource access can conflict with user expectations (R06); it does not estimate current OS prompt acceptance or quantify the gain from one timing change.
- **Use it:** Ask after the user chooses a capability that genuinely needs permission, such as “Use my location.” Offer a manual entry or platform picker when feasible. Test decline, limited access, one-time access where supported, and later revocation without a prompt loop.

## 11. Filters that are hard to reset

- **Caption cue:** “Filters that are tough to reset.” The video contrasts unchecking each item with a clear-all control.
- **Evidence and limit:** Carbon documents applied visibility and reset conventions (D07). Baymard describes usability observations and benchmark examples on e-commerce product lists (D08), not a causal metric for all search UIs.
- **Use it:** Show which filters are active and what “clear” changes. Support removing one and clearing relevant filters without unexpectedly losing the query, sort, or access constraints. Test Cancel vs. Apply for draft edits and rapid interactions with old responses arriving last.

## 12. Truncating important text

- **Caption cue:** “Truncating important text.” The video says not to make someone dig for information they need to decide.
- **Evidence and limit:** WCAG 1.4.4 (text resize) and 1.4.10 (reflow) give scoped web checks (W01); Apple discusses scalable text and Android documents pseudolocales (P05, P06). A U.S. FTC staff report catalogs obscured material terms as a harm pattern (L03). None of these bans all ellipses in a preview.
- **Use it:** Reserve truncation for expendable previews with an operable full view. Keep price/cadence, visibility, status, consequences, and recovery readable where needed. Check wide and narrow layouts at text scale, real long strings, and right-to-left; ensure sticky actions and the keyboard do not cover the content.

## Put the research to work

Use the [12-point audit](../assets/polish-audit.md) to check one flow. Move observed issues to the [change brief](../assets/change-brief.md) and prove their fixes with the [state matrix](../assets/state-matrix.md). Treat estimates of trust or perceived quality as hypotheses. Ask people to predict the next action, describe what actually happened, and recover without prodding; keep perception and task performance separate.
