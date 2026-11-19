# Repeat-use patterns

Use these patterns to make work worth returning to. Protect real stopping points and distinguish a new need from missed engagement. Source IDs resolve to the [source library](source-library.md) and the [indexed references](../assets/research-source-index.csv).

## The Slot Machine

**Question to solve:** How can repeated use stay useful or interesting without turning feedback into a gamble?

**Evidence.** E12’s lab monograph distinguishes continuous and intermittent reinforcement. E13 and E14 document that responding can persist longer under certain histories of intermittent reinforcement when reinforcement stops; E14 is a *within-subject* pigeon study, not the two-group protocol told in the video. E15 and E16 distinguish non-contingent, timed food from key-peck rewards. None of this proves app satisfaction, clinical addiction, or a particular human response to a swipe. E17 found that some expected, contingent rewards undermined free-choice motivation in experiments, while positive feedback could help. E18 synthesized gamification in learning and found different levels of robustness across learning, motivation, and behavior outcomes; it is not evidence that surprise jackpots are useful. [Foundation monograph](https://www.bfskinner.org/wp-content/uploads/2015/05/Schedules_of_Reinforcement_PDF.pdf) [Jenkins & Stanley DOI](https://doi.org/10.1037/h0060772) [Zarcone et al. at PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC1284583/) [Skinner 1948 reprint](https://www.bfskinner.org/wp-content/uploads/2022/02/Superstition-in-the-pigeon.pdf) [Deci et al. full PDF](https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf) [Sailer & Homner open text](https://link.springer.com/article/10.1007/s10648-019-09498-w)

**Build it.**

- **Keep core value predictable.** Every successful action gets a real result: a saved entry, useful correction, completed task, or confirmation. Show known criteria for any milestone: `3 of 5 tasks done`. Never make the user refresh to receive earned feedback.
- **Vary the substance only when it helps.** Rotate relevant examples, give a different worked problem with the same difficulty, or surface a small, diverse set of items selected for the user’s goal. Label optional surprises as optional. A genuine human reply may be naturally unpredictable, but never fabricate, delay, or tease it to drive checks.
- **Don’t make attention the currency.** Skip odds-based or paid loot mechanics, near-miss effects, fake scarcity, manufactured uncertainty around promised outcomes, and streak-loss threats. For high-stakes or sensitive actions, prefer predictable feedback and no surprise pressure.

**Test it.** Keep the completion confirmation and quantity of content constant. Compare a stable recommendation set with a curated variety set. Choose a meaningful metric (next-cycle learning score, verified usefulness, or correct completion). Guard against longer accidental use, regret, or lower performance. Remove a feature that raises taps without improving the result.

**Done when:** feedback is immediate where possible, verified and persistent; it works without animation or network where feasible; progress never vanishes for missing a day; there is no reward reroll or hidden threshold.

## The Bottomless Pit

**Question to solve:** Is this screen failing users, or are users simply finished?

**Evidence.** E19 tracked reasons people stopped using social platforms during a one-week field study (46 participants); it distinguished repeated visits from within-session scrolling and found many stops came from surrounding context. It was not a randomized comparison of infinite scroll and pagination. E20’s controlled Netflix study with 76 US users estimated about 21 fewer daily viewing minutes and 17–18 minutes shorter sessions when autoplay was disabled, in adjusted comparisons with users who kept it on. This was a short study of moderate to heavy Netflix users. It tests viewing behavior, not clinical harm or long-run retention. E21’s review catalogs disengagement cues; it is not a single effect-size estimate for removing all endings. In E30’s two-week field study (29 participants), letting users switch off attention-capturing interface features was associated with less self-reported distraction. The second week bundled several switches and came after baseline for everyone, so no one toggle gets causal credit. [Purpose Mode paper](https://dl.acm.org/doi/10.1145/3711841) [Ulm University PDF](https://www.uni-ulm.de/fileadmin/website_uni_ulm/iui.inst.100/1-hci/hci-paper/2023/4-TheLoopAndHowToBreakIT.pdf) [Schaffner et al. full PDF](https://voices.uchicago.edu/airlab/files/2025/02/netflix_autoplay.pdf) [ACM disengagement-cues review](https://dl.acm.org/doi/10.1145/3749012.3749078)

**Build it.**

| State | Show | User-controlled next action |
|---|---|---|
| Successful task / end of a set | “Done. Your progress is saved.” Show the result. | `Done` (easy to find) and an optional `Start another` or `Save for later`; no countdown required |
| End of recent content | “You’re caught up” or “End of this list” | `Load more` or change filter; don’t automatically append unrelated content |
| No search results | Tell the user no results match; retain the query on device/in the form | Clear filters, correct spelling, or show *labeled* related suggestions |
| Error or offline | Name what happened and whether work is saved | Retry, view cached work, or exit safely without losing a draft |
| User’s chosen session limit | Say the chosen limit was reached | Stop by default, save progress, or deliberately decide to continue if the setting permits |

For media, default to manual “play next” on the MVP. If you later offer autoplay, make it optional and easy to turn off, with a visible session ending. On content collections, start with a bounded set and explicit continuation. If you support a longer list, preserve scroll position on back and don’t move focus as items load. No auto-redirect after a purchase, check-in, or completed task.

**Test it.** Compare a generic dead end with contextual recovery; separately test a visible end plus optional next item. Measure recovered task completions, stop success in a usability test, and “Did you do what you came to do?” or “Did you spend longer than intended?” Minutes are a diagnostic, not the north star. A shorter successful session is often better.

**Done when:** a task can end cleanly; back and exit behave normally; no user-selected limit is silently bypassed; empty and error states have recovery and no manufactured urgency.

## The Piggy Bank

**Question to solve:** What useful work or preference should carry over so the user doesn’t have to start again?

**Evidence.** E22 documents Netflix’s recommendation system as a company case study; use it as an example of ranking and experiment design, not as proof of lock-in. E23 pooled **138 randomized studies** (**19,951** participants): interventions promoting monitoring improved goal attainment on average (**d = 0.40**, 95% CI 0.32–0.48). That is a standardized effect across varied studies, not a 40% lift in app retention. Use it to support tracking a real, user-chosen goal; don’t make history public by default. E24 found a progress-framing effect in a loyalty context; that does not justify fake milestones. E25 distinguishes procedural, financial, and relational switching costs. Useful saved context and engineered switching barriers are separate choices. [Netflix paper, §3](https://dl.acm.org/doi/pdf/10.1145/2843948) [Harkin et al. full PDF](https://www.apa.org/pubs/journals/releases/bul-bul0000025.pdf) [Nunes & Drèze author copy](https://www.researchgate.net/publication/23547282_The_Endowed_Progress_Effect_How_Artificial_Advancement_Increases_Effort) [Burnham et al. journal record](https://link.springer.com/article/10.1177/0092070302250897)

**Build it.**

1. Ship one durable artifact first: a draft, practice history, template, saved item, or collection. Make it visible on return. Distinguish an uninstall from account deletion; explain what is stored only on the device vs. synced, and offer export before a destructive delete without making export mandatory.
2. Prefer **explicit first-party signals** such as selected topics, saved categories, and `Not for me`. Start with `resume → curated picks matching explicit preferences → safe generic list`; no model needed. For a larger content catalog, filter out ineligible or blocked items, score by user goal or relevance, then limit repeats and maintain variety. Explain recommendations and honor overrides. G09 describes a more advanced retrieval / scoring / re-ranking architecture.
3. Provide controls: `Edit preferences`, `Turn personalization off`, `Reset suggestions`, `Export my data`, `Delete my data`. State what each changes. Resetting personalization should not erase user-created content; deletion should remove the appropriate account, telemetry, recommendation state and queued jobs according to your disclosed retention policy and applicable obligations. Do not force account creation for a disposable demo unless necessary.
4. **Don’t “track everything.”** Inventory the purpose, owner, retention period, deletion path, and access for each field. Keep product state separate from analytics. Avoid raw query text, messages, photos, health entries and precise location in telemetry. Use on-device state or approved coarse fields where possible. User-created media may belong in the core product if needed for the task; do not duplicate it into analytics. Export only data the requester is entitled to receive, not private data about other people.

**Product example.** [Netflix’s Help Center](https://help.netflix.com/en/node/100639) describes a mix of signals, including viewing activity, ratings, and optional initial picks; you do not need all of them to start. [TikTok documents a feed refresh](https://newsroom.tiktok.com/en-us/introducing-a-way-to-refresh-your-for-you-feed-on-tiktok-us) that changes For You recommendations without removing followed accounts. [Yazio’s saved meals](https://help.yazio.com/hc/en-us/articles/360000620798-What-are-meals) are a simpler example: the user saves a reusable combination instead of re-entering it. For your first version, copy the reusable artifact before the recommender.

**Test it.** Compare static home with a resume card, then separately test explicit preferences vs. a nonpersonalized fallback. Evaluate time to the next successful task, relevant-item success, preference corrections, and deletion/reset behavior. Don’t trade better clicks for narrower, less safe, or less useful results.

**Done when:** value survives normal sync/reinstall as promised; a lapsed user can resume without penalty; anyone can stop personalization; export and delete are tested end to end; the app still works when optional analytics and personalization are off.
