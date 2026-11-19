# app-retention

An agent skill for designing and auditing app activation and retention.

The skill teaches coding agents to help people get value from an app and come back when they need it again. It covers onboarding, first value, repeat use, reminders, streaks, defaults, stopping points, saved progress, personalization, and retention A/B tests. It optimizes for completed user goals, not time on screen or compulsive checking.

Works with Claude Code, Codex, Cursor, OpenCode, and any other agent that supports the [Agent Skills](https://agentskills.io/specification) format.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install the Skill

Requires Node.js 22.20 or later. Run this from your project:

```bash
npx skills add nomandhoni-cs/app-retention
```

Choose the coding agents to install to. The skill is installed to the current project by default; add `-g` to make it available across projects.

```bash
# Install for one agent
npx skills add nomandhoni-cs/app-retention --skill app-retention -a claude-code

# Install globally, without prompts
npx skills add nomandhoni-cs/app-retention --skill app-retention -g -y

# Preview what the repository contains
npx skills add nomandhoni-cs/app-retention --list
```

See the [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) for all options.

## Use the Skill Without Installing

Generate a prompt for the skill, or launch a supported coding agent with it:

```bash
npx skills use nomandhoni-cs/app-retention@app-retention --agent claude-code
```

Omit `--agent` to print the prompt instead.

## Try It

Ask your agent to use the `app-retention` skill:

- "Plan first use and a useful next-visit flow for a weekly invoicing app."
- "Audit this onboarding for first-task blockers. Show what you verified and what is a hypothesis."
- "Plan an A/B test for a resume card. Our first-value baseline is 20%, and we care about a 3 percentage-point lift."

The skill works in four modes:

| Mode       | Returns                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------- |
| Build      | User job and cadence, a first-release flow with copy and edge states, and acceptance tests |
| Audit      | Ranked findings with observed state, user impact, fix, measure, and acceptance check      |
| Experiment | Hypothesis, assignment, outcome and guardrails, run length, decision rule, and QA         |
| Evidence   | Finding, evidence type, limits on transfer, and source link                               |

## The Six Patterns

The skill matches each change to the bottleneck the evidence points to:

| Pattern           | Problem                                                     | Typical fix                                                  |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| The Itch          | People want to do the task but miss the right moment        | User-chosen cues, a visible resume card, optional reminders  |
| The Lazy Thumb    | People get lost, type too much, or hit the wrong control    | One clear start/resume action, fewer unnecessary steps       |
| The Paved Path    | People don't know what to do next                           | One explained suggestion with a visible alternative          |
| The Slot Machine  | People can't tell they succeeded, or the task feels repetitive | Dependable feedback, saved results, useful variety       |
| The Bottomless Pit | People get stuck on errors or continue past their intention | An honest end, easy exit, and voluntary continuation        |
| The Piggy Bank    | Returning means starting over                               | Saved drafts, history, and preferences the user controls     |

## Manage the Skill

| Command                                  | Description                     |
| ---------------------------------------- | ------------------------------- |
| `npx skills list`                        | List installed skills           |
| `npx skills check`                       | Check for available updates     |
| `npx skills update app-retention`        | Update to the latest version    |
| `npx skills remove app-retention`        | Remove the skill                |

## What's Inside

```text
├── SKILL.md                  # Agent entry point and workflow
├── references/               # Six focused guides, loaded as needed
├── assets/                   # Build brief, audit and experiment templates; 65-source CSV
├── scripts/
│   ├── validate-skill.py     # Package and local link checks
│   └── plan-sample-size.py   # Approximate A/B test sizing for binary outcomes
├── README.md
└── LICENSE
```

Using the skill needs no network access, Node.js, or Python. Python is only needed for the optional helper scripts.

## Helper Scripts

Run these from the skill directory with Python 3.8 or later (standard library only).

Check the package layout, metadata, local links, and evidence index:

```bash
python3 scripts/validate-skill.py
```

Estimate the sample size for an equal-allocation, fixed-horizon A/B test with one binary outcome:

```bash
python3 scripts/plan-sample-size.py --baseline 0.20 --delta 0.03 \
  --eligible-per-week 1000 --follow-up-days 14
```

This example returns **2,943 units per arm**, before losses or design adjustments. Run `python3 scripts/plan-sample-size.py --help` for all options.

## Documentation

- [Activation patterns](references/activation-patterns.md): cue design, fast entry, and reversible defaults
- [Repeat-use patterns](references/return-patterns.md): progress feedback, stopping points, saved work, and personalization
- [Implementation and QA](references/implementation-and-qa.md): screen states, instrumentation, accessibility, and release QA
- [Measurement and experiments](references/measurement-and-experiments.md): metric definitions, experimental design, and guardrails
- [Video and evidence](references/video-and-evidence.md): original video timestamps and numeric claims
- [Source library](references/source-library.md) and [source index](assets/research-source-index.csv): studies, product docs, and open copies

## Related Links

- [Skills CLI](https://github.com/vercel-labs/skills)
- [Skills Directory](https://skills.sh)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Source video by App Breakdown](https://www.youtube.com/watch?v=NHIq3HnokOI)

## License

The skill instructions, research notes, templates, and scripts are licensed under the [MIT License](LICENSE). Linked third-party material keeps its own terms; the original video, captions, and publications are not redistributed here.
