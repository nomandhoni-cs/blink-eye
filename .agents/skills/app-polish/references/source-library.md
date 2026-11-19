# Annotated source library

Last checked **2026-11-18**. The [source index CSV](../assets/research-source-index.csv) carries the same IDs, dates, URLs, applicability and access notes. The [caption-derived guide](video-and-evidence.md) links each of the twelve topics to these IDs.

**How to use:** Read a standard or policy for what applies to the actual release. Use a design pattern as a candidate implementation and research as evidence for a bounded claim. The video and creator portfolio establish what the creator says or shows, not what causes improvement. Access notes describe what was checked, not a guarantee of open availability. This is a targeted reading list, not a systematic review or channel/market-specific legal advice.

## Video and provenance

**V01 · [These 12 Mistakes Make Your App Feel CHEAP](https://www.youtube.com/watch?v=q4TdOOkCDbw)** — Wyatt Feaster (2026-11-03). *Creator presentation.*  
Primary source for the twelve spoken topics in order and the Mobbin promotion. **Limit:** Untimed caption renders; audio and visuals not independently verified. Creator opinions and commercial examples are not independent outcome evidence.  
**Access:** Watch metadata, description, and rendered English captions checked. [Watch link and caption-render continuation](https://youtu.be/q4TdOOkCDbw).

**V02 · [View video transcripts](https://support.google.com/youtube/answer/15930243?hl=en)** — YouTube Help (Living documentation). *Publisher help.*  
In a captioned video description, Show transcript opens the publisher’s transcript and selecting a line seeks to that point. **Limit:** Availability can vary with the watch surface and caption availability.  
**Access:** Public help page checked.

**V03 · [Vamo](https://www.dugdugstudios.com/work/vamo)** — Dug Dug Studios (Undated page). *Attributed portfolio example.*  
Creator-authored illustrations of a verification wait, route pay, progress, and next steps. **Limit:** Not a test of the featured video’s claims. Does not isolate any intervention; do not copy the described artificial wait.  
**Access:** Public portfolio page checked.


## Web accessibility standard and supporting guidance

**W01 · [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)** — W3C (2024-12-12 revision). *W3c recommendation.*  
Use specific success criteria for labels, errors, status, repeated entry, focus, targets, resize, and reflow. See the criterion map below. **Limit:** WCAG conformance is scoped to content and complete processes, and requires more than these selected checks. The Understanding pages are explanatory. Verify the target’s legal and platform scope.  
**Access:** Public Recommendation and selected Understanding pages checked. [W3C companion explanations](https://www.w3.org/WAI/WCAG22/Understanding/).

**W02 · [Functional Images](https://www.w3.org/WAI/tutorials/images/functional/)** — W3C WAI (Living documentation). *Accessibility technique guidance.*  
Alternatives for functional images describe the action or destination; redundant decorative images need not be read twice. **Limit:** Examples are web implementations, not a native API contract or a study of icon style.  
**Access:** Public WAI tutorial checked.

**W03 · [Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/)** — W3C WAI (Living documentation). *Evaluation guidance.*  
Involve users with disabilities in usability evaluation alongside technical conformance checks. **Limit:** A small sample or one assistive technology does not represent all users or prove conformance.  
**Access:** Public WAI resource checked.

### WCAG 2.2 checks to open first

The normative text is in W01. These links go to W3C’s *Understanding* pages for interpretation, examples, techniques, and exceptions. Do not treat an example technique or a partial check as a conformance claim.

| Flow facet | Relevant success criteria and what to verify |
| --- | --- |
| Data entry | [3.3.2 Labels or Instructions (A)](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions): needed instructions or labels are provided for fields accepting input. Separately check [1.3.1 Info and Relationships (A)](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) and programmatic control semantics. |
| Validation and commitment | [3.3.1 Error Identification (A)](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): identify automatically detected input errors in text. [3.3.3 Error Suggestion (AA)](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html): give a known correction where it does not jeopardize security or purpose. [3.3.4 Error Prevention (Legal, Financial, Data) (AA)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): for covered submissions, provide reversibility, checks with a correction opportunity, or review/confirm/correct before finalizing. |
| Repeated entry | [3.3.7 Redundant Entry (A)](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html): populate or let users select already-entered/provided information required again in the same process, with essential, security, or no-longer-valid exceptions. No cross-session retention mandate. |
| Updates and controls | [4.1.3 Status Messages (AA)](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): qualifying status messages are programmatically determinable without a focus change. [4.1.2 Name, Role, Value (A)](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html): expose controls and their states/values. [2.5.3 Label in Name (A)](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html): visible text in the accessible name where applicable. [2.4.6 Headings and Labels (AA)](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html): describe topic or purpose. |
| Interaction and visuals | Check [2.1.1 Keyboard (A)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [2.4.11 Focus Not Obscured (Minimum) (AA)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [1.4.11 Non-text Contrast (AA)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) and [2.5.8 Target Size (Minimum) (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), including each criterion’s scope and exceptions. Compare visual and keyboard/AT access; do not equate the icon size with its pointer target. |
| Resize and reflow | [1.4.4 Resize Text (AA)](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) covers text resize up to 200% without loss of content/function, with exceptions. [1.4.10 Reflow (AA)](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) covers loss and two-dimensional scrolling at the specified dimensions, except essential 2-D layout parts. |

## Platform practices and store policies

**P01 · [Privacy — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/privacy)** — Apple (Living documentation). *Platform design guidance.*  
Ask in context for necessary access, use purpose copy, and respect a choice not to grant it. **Limit:** Apple design guidance; prompt behavior and availability vary by capability/OS. Check current policy separately.  
**Access:** Public HIG checked.

**P02 · [Request runtime permissions](https://developer.android.com/training/permissions/requesting)** — Android Developers (Living documentation). *Platform implementation guidance.*  
Ask in context, check permission as needed, and degrade gracefully on denial; there are OS-managed mechanisms and alternatives. **Limit:** Relevant permission type and API version matter. Not a Play policy or consent substitute.  
**Access:** Public technical docs checked.

**P03 · [Progress indicators — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)** — Apple (Living documentation). *Platform design guidance.*  
Use a determinate indicator for measurable work, an indeterminate one when duration/work is unknown, and concise status context. **Limit:** No app-wide threshold or evidence that more animation improves outcomes. Pause/cancel must match capability.  
**Access:** Public HIG checked.

**P04 · [SF Symbols](https://developer.apple.com/sf-symbols/)** — Apple (Living documentation). *Platform resource.*  
A library with consistent weight/scale and directional or localized variants illustrates how a family supports a design system. **Limit:** An Apple library example, not a test of matching strokes or a mandate to replace other platform icons.  
**Access:** Public resource page checked.

**P05 · [Typography — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography)** — Apple (Living documentation). *Platform design guidance.*  
Built-in text styles support scalable text and legible hierarchy; adapt to larger accessibility sizes. **Limit:** Apple guidance, not a universal web zoom requirement. Check actual layout and supported native settings.  
**Access:** Public HIG checked.

**P06 · [Test your app with pseudolocales](https://developer.android.com/guide/topics/resources/pseudolocales)** — Android Developers (Living documentation). *Platform test guidance.*  
Android’s expansion and bidirectional pseudo locales can reveal hardcoded strings, clipping, and layout issues before translation. **Limit:** Pseudolocales do not check translation quality or replace tests in real supported locales.  
**Access:** Public technical docs checked.

**P07 · [App Review Guidelines — Privacy (§5.1)](https://developer.apple.com/app-store/review/guidelines/#privacy)** — Apple (Living policy). *Store review policy.*  
Apple specifies accessible in-app and listing privacy policy links and rules for data collection and storage under its review guidelines. **Limit:** Platform distribution requirements, not a global rule or an assurance of App Review approval. Recheck current text.  
**Access:** Public policy, including §5.1.1 privacy-policy text, checked.

**P08 · [User Data — Prominent Disclosure & Consent Requirement](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)** — Google Play (Living policy). *Store policy.*  
For covered data access, collection, use, or sharing outside reasonable expectations, Play requires prominent in-app disclosure and affirmative consent, with sequencing rules. **Limit:** Apply the policy scope and feature-specific rules; neither the system prompt nor placing text in the privacy policy alone substitutes for it.  
**Access:** Full-policy section on prominent disclosure/consent checked.


## Legal and consumer-protection context

**L01 · [Berman v. Freedom Financial Network, LLC, 30 F.4th 849](https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/05/20-16900.pdf)** — U.S. Court of Appeals for the Ninth Circuit (2022-04-05). *Court opinion.*  
The opinion distinguishes conspicuous notice of terms and an action that unambiguously manifests assent in the cases before it. **Limit:** Specific jurisdiction and facts, not a universal design recipe or psychological evidence of trust.  
**Access:** Relevant sections of court opinion accessed.

**L02 · [Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)** — European Parliament and Council of the European Union (2016). *Regulation.*  
Check scope (Art. 3), minimization (Art. 5), lawful basis (Art. 6), consent conditions when used (Art. 7), and transparency obligations (Arts. 12–14). **Limit:** Does not apply to every project; lawfulness and consent validity require contextual review. A privacy notice and consent are different.  
**Access:** Public official text; relevant article excerpts checked.

**L03 · [Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light)** — U.S. Federal Trade Commission staff (2022-09). *Regulator staff report.*  
Documents consumer harms from obscured key terms, confusing choices and difficult cancellation, with examples and recommendations. **Limit:** Staff report in a U.S. regulatory context, not a binding rule by itself or a universal numerical estimate.  
**Access:** Official report landing and PDF intro/examples checked. [Public report PDF](https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf).


## Heuristics, design systems, and applied observations

**D01 · [10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/)** — Jakob Nielsen / Nielsen Norman Group (Living article). *Usability heuristics.*  
Status visibility, control/escape, consistency, recognition over recall, and recovery are useful audit prompts. **Limit:** Heuristics—not normative standards or a quantitative estimate of each intervention.  
**Access:** Public article checked.

**D02 · [Designing Empty States in Complex Applications: 3 Guidelines](https://www.nngroup.com/articles/empty-state-interface-design/)** — Kate Kaplan / Nielsen Norman Group (2021-09-19). *Design guidance with examples.*  
Distinguish causes, communicate state, and give useful starting or recovery actions where appropriate. **Limit:** Complex-app examples, not a controlled estimate or a rule that every empty state needs a CTA.  
**Access:** Public article checked.

**D03 · [Text input — Hint text](https://design-system.service.gov.uk/components/text-input/#hint-text)** — GOV.UK Design System (Living documentation). *Design-system guidance.*  
Use a short, relevant hint on format/use, attached to a persistent input label and field association. **Limit:** Style conventions are service-specific. Long explanations or material disclosures belong in an appropriate visible format.  
**Access:** Public hint section and example checked.

**D04 · [Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)** — GOV.UK Design System (Living documentation). *Design-system guidance.*  
After a transaction, give a reference if available, clear next steps, and a record users can revisit or save. **Limit:** Pattern for public transactions; adapt to the action’s stakes. Does not prove that the receiving process has finished.  
**Access:** Public pattern and example checked.

**D05 · [Error message](https://design-system.service.gov.uk/components/error-message/)** — GOV.UK Design System (Living documentation). *Design-system guidance.*  
Explain what to fix inline and in a linked summary where appropriate; preserve responses. Keep service problems separate from invalid input. **Limit:** Service-specific pattern. Preserve only data safe to keep; security can require less specific messages.  
**Access:** Public component and guidance checked.

**D06 · [Button](https://design-system.service.gov.uk/components/button/)** — GOV.UK Design System (Living documentation). *Design-system guidance.*  
Describe the button’s action or consequence. Continue and Save and continue differ if information is saved. **Limit:** Examples and conventions, not an experiment or a reason to overwrite appropriate local terminology.  
**Access:** Public component guidance checked.

**D07 · [Filtering](https://www.carbondesignsystem.com/building-blocks/core/patterns/filtering)** — IBM Carbon Design System (Living documentation). *Design-system guidance.*  
Match batch/instant behavior to the use case; indicate applied filters, provide removal or reset, and define defaults. **Limit:** A design pattern, not an effect size; application-owned constraints and state must be handled separately.  
**Access:** Public pattern checked.

**D08 · [Display “Applied Filters” in an Overview (28% Don’t)](https://baymard.com/research-articles/how-to-design-applied-filters)** — Kathryn Reeves / Baymard Institute (Published 2020-10-06; updated 2026-05-13). *Industry usability observations and benchmark examples.*  
An overview of applied filters supports confirmation, removal, and context on mobile and desktop e-commerce lists. **Limit:** Benchmarked site prevalence is not user uplift. Public article summarizes research; not a randomized test on all app types.  
**Access:** Public research article checked.


## Empirical research and waiting-time background

**R01 · [The Psychology of Waiting Lines](https://davidmaister.com/articles/1/52/)** — David Maister (1985). *Service-design essay.*  
Proposes that uncertainty and lack of explanation can make waits more difficult for service customers. **Limit:** A management essay with propositions, not a controlled app or spinner study. Do not attribute it to the video as its unnamed source.  
**Access:** Public author essay checked.

**R02 · [What to tell consumers in waits of different lengths: An integrative model of service evaluation](https://hub.hku.hk/handle/10722/177855)** — M. K. Hui & D. K. Tse (1996). *Service-wait experiment.*  
The roles of waiting-duration and queue information varied with wait length. Acceptability and affect mediated service evaluation; perceived duration did not in their model. **Limit:** Abstract-level inference; service wait conditions, not a modern app spinner or a rule for a fixed number of seconds.  
**Access:** Institutional abstract checked; no full-text file in the repository. [Publication DOI; access may vary](https://doi.org/10.2307/1251932).

**R03 · [The effect of skeleton screens](https://dl.acm.org/doi/10.1145/3232078.3232086)** — Mejtoft, Långström & Söderström (2018). *Interface comparison study.*  
In one fictional news site, skeleton and spinner averages favored different outcomes and reported differences were not statistically significant. **Limit:** One context and abstract-level conclusion. A null result does not prove equivalence or a universal winner.  
**Access:** Publisher abstract checked.

**R04 · [Rethinking the Progress Bar](https://chrisharrison.net/projects/progressbars/ProgBarHarrison.pdf)** — C. Harrison, B. Amento, S. Kuznetsov & R. Bell (2007). *Progress perception experiment.*  
Participants compared progress bars with different progress profiles but equal 5.5-second duration. Appearance can affect perceived wait independent of elapsed time. **Limit:** Artificial task and fixed duration; not evidence to fake progress, slow the app, or predict conversion.  
**Access:** Public author-hosted paper and method checked. [Publication DOI](https://doi.org/10.1145/1294211.1294231).

**R05 · [Measuring symbol and icon characteristics: Norms for concreteness, complexity, meaningfulness, familiarity, and semantic distance for 239 symbols](https://link.springer.com/article/10.3758/BF03200730)** — S. J. P. McDougall, M. B. Curry & O. de Bruijn (1999). *Icon rating-norms study.*  
Distinguishes several icon characteristics that can be evaluated, including familiarity, meaningfulness and distance from a referent. **Limit:** Not a recommendation to use one icon library, or an estimate for stroke uniformity or today’s UI icons.  
**Access:** Publisher metadata and abstract checked; paper PDF publicly linked. [Publisher PDF link](https://link.springer.com/content/pdf/10.3758/BF03200730.pdf).

**R06 · [Android Permissions Remystified: A Field Study on Contextual Integrity](https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/wijesekera)** — Wijesekera et al. (2015). *Android permissions field study.*  
In a 36-person field study, some protected-resource accesses were inconsistent with what participants expected or wanted. **Limit:** Small sample and older Android permission model. Reported desires do not estimate the effect of a current OS prompt timing change.  
**Access:** Public proceedings page and paper available; study description checked. [Public proceedings PDF](https://www.usenix.org/system/files/conference/usenixsecurity15/sec15-paper-wijesekera.pdf).


## Implementation and verification

**T01 · [Authentication Cheat Sheet — Authentication Responses](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses)** — OWASP Cheat Sheet Series (Living documentation). *Application security guidance.*  
Authentication and recovery responses should avoid disclosing account existence/status; retain re-authentication policies for sensitive actions. **Limit:** Does not disallow specific corrections for routine, safe field validation. Requires flow-specific security review.  
**Access:** Authentication responses and re-authentication guidance checked.

**T02 · [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)** — Malcolm Featonby / Amazon Builders’ Library (Undated page). *Engineering reference.*  
A timed-out write can have committed; model caller intent, operation identity, side effects, and late requests to retry safely. **Limit:** Engineering pattern using AWS examples, not an automatic exactly-once guarantee or a replacement for provider-specific contracts.  
**Access:** Public article checked for retry risk and idempotency.

**M01 · [Using moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)** — GOV.UK Service Manual user research community (Living documentation). *User research method.*  
Recruit likely users, give believable neutral tasks, observe behavior, and plan assistive-technology participation and safe data handling. **Limit:** Qualitative usability sessions surface issues but do not by themselves quantify a population effect.  
**Access:** Public methodology checked.

Back to the [caption-derived guide](video-and-evidence.md), [implementation notes](state-and-recovery.md), or [release verification](release-qa.md).
