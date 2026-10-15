## ADDED Requirements

### Requirement: Nudge copy uses a friendly casual tone
The system SHALL write every nudge headline, body, and CTA in a warm, casual, second-person voice — like a friend noticing a good habit — and SHALL NOT use guilt, threats, or fake-urgency marketing language.

#### Scenario: Warm stat-based message
- **WHEN** composing for a user with `totalBreaksCompleted = 48` and `breakStreak = 6`
- **THEN** the message addresses the user directly, cites at least one concrete true number, and fits the nudge card without truncation

#### Scenario: Banned language never ships
- **WHEN** any pooled template is added or edited
- **THEN** unit tests reject strings containing banned patterns (e.g., "last chance", "act now", "you'll lose", shaming words), and the offending template cannot be selected

### Requirement: Messages are personalized with live user stats
The system SHALL fill message slots at show-time from `get_break_stats`, today's screen time, and `get_trial_info`, following the milestone → streak → cumulative → relevance → fallback hierarchy.

#### Scenario: Milestone wins when one was just hit
- **WHEN** the user just set a new best streak or crossed a break-count milestone (50/100/250)
- **THEN** the system selects the celebratory milestone template referencing that achievement

#### Scenario: Streak identity beats raw counts
- **WHEN** no fresh milestone exists and `breakStreak ≥ 2`
- **THEN** the system selects a streak template referencing the streak length

#### Scenario: Cumulative proof for steady users
- **WHEN** no milestone or qualifying streak exists and `totalBreaksCompleted ≥ 5`
- **THEN** the system selects a cumulative template referencing the total

#### Scenario: Trial-ending adds gentle urgency only in its own pool
- **WHEN** the variant is `trial_ending` and `days_remaining` is between 1 and 3
- **THEN** the message includes the days-left note exactly once, phrased warmly, and other variants never mention days remaining

#### Scenario: New users are celebrated, never shown zeros
- **WHEN** `totalBreaksCompleted < 5` and `breakStreak < 2`
- **THEN** the system shows start-celebrating copy with no numbers rather than any "0 breaks" line

### Requirement: Each variant draws from its own template pool
The system SHALL maintain separate template pools for `trial_ending`, `expired`, and `winback`, and a compose call for one variant SHALL never return a template belonging to another.

#### Scenario: Correct register per segment
- **WHEN** composing for variant `expired`
- **THEN** the returned `templateId` belongs to the `expired` pool and contains no trial-countdown language

### Requirement: Consecutive nudges never repeat
The system SHALL guarantee the same message is never shown twice in a row and SHALL maximize distance between repeats via a per-variant shuffle-bag with per-template cooldowns, persisting `lastTemplateId` in the nudge state.

#### Scenario: No back-to-back repeat
- **WHEN** the previously shown template is drawn again by the shuffle-bag
- **THEN** the system redraws until the pick differs from `lastTemplateId` and persists the new id

#### Scenario: Bag exhaustion reshuffles fairly
- **WHEN** all templates in a variant pool have been shown
- **THEN** the system reshuffles the full pool rather than repeating the tail

### Requirement: Missing stats degrade to warm fallback copy
The system SHALL render a complete, warm, stat-free message whenever stats are unavailable or below display thresholds, and SHALL never render `undefined`, `NaN`, or empty slots.

#### Scenario: Unreadable stats fall back gracefully
- **WHEN** `get_break_stats` or screen-time reads fail in the nudge window
- **THEN** the system shows the generic warm fallback template with the support-framed CTA and records no error visible to the user

### Requirement: The ask is framed as open-source support
The system SHALL frame the CTA as supporting a free open-source project that unlocks premium extras (themes, multi-monitor), and SHALL NOT frame premium as ransom, loss-avoidance, or a hard sell.

#### Scenario: Support framing present
- **WHEN** any nudge message is composed
- **THEN** the CTA references supporting Blink Eye and names at least one premium extra, using no purchase-pressure verbs ("buy now", "pay", "or else")

### Requirement: Snooze and skip behavior is never referenced
The system SHALL NOT mention snoozes, skipped breaks, or any failure-adjacent stat in any template, slot, or fallback.

#### Scenario: Failure stats stay out of copy
- **WHEN** composing for a user with high `snoozesToday`
- **THEN** the message contains no mention of snoozing, skipping, or missed breaks
