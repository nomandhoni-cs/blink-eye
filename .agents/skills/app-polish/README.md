# app-polish

An agent skill for auditing, fixing, and release-testing web and mobile UX.

The skill teaches coding agents to make an app flow answer three questions: **What will this action do? Did it work? Can I recover?** It covers empty states, helper text, confirmations, error recovery, loading and progress, repeated form entry, icons and action labels, disclosures and permission prompts, filter reset, and important text that clips. It puts truthful state, accessibility, and user control ahead of cosmetic redesign.

Works with Claude Code, Codex, Cursor, OpenCode, and any other agent that supports the [Agent Skills](https://agentskills.io/specification) format. It pairs well with [app-retention](https://github.com/nomandhoni-cs/app-retention), but neither needs the other.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install the Skill

Requires Node.js 22.20 or later. Run this from your project:

```bash
npx skills add nomandhoni-cs/app-polish
```

Choose the coding agents to install to. The skill is installed to the current project by default; add `-g` to make it available across projects.

```bash
# Install for one agent
npx skills add nomandhoni-cs/app-polish --skill app-polish -a claude-code

# Install globally, without prompts
npx skills add nomandhoni-cs/app-polish --skill app-polish -g -y

# Preview what the repository contains
npx skills add nomandhoni-cs/app-polish --list
```

See the [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) for all options.

## Use the Skill Without Installing

Generate a prompt for the skill, or launch a supported coding agent with it:

```bash
npx skills use nomandhoni-cs/app-polish@app-polish --agent claude-code
```

Omit `--agent` to print the prompt instead.

## Try It

Ask your agent to use the `app-polish` skill on one flow at a time:

- "Audit checkout. Rank issues by what could block, mislead, or double-charge someone. Mark what you haven't verified."
- "Fix search recovery. Keep the query and sort when clearing filters, and test an old request arriving after the reset."
- "Write a release QA plan for saving and syncing a note. Include offline, app restart, and an unknown save result."

The skill works in three modes:

| Mode              | Returns                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Audit             | Ranked findings labeled observed, hypothesis, or not checked, each with a fix and a check    |
| Design or fix     | A scoped design or patch, before/after examples, tests run, and remaining risks              |
| Prepare a release | Per-case results, open gates and owners, known exclusions, and a release recommendation      |

Findings are ranked by consequence: **P0** for unsafe disclosure, misleading commitments, or unintended irreversible or duplicate actions; **P1** for real confusion or rework; **P2** for low-impact polish.

## The 12-Point Audit

| #  | Check                          | What good looks like                                                         |
| -- | ------------------------------ | ---------------------------------------------------------------------------- |
| 01 | Disclosure at the decision     | Price, renewal, and visibility are readable before the user commits          |
| 02 | Empty-state escape             | First use, no matches, offline, and denied access each look different        |
| 03 | Field help                     | Users know what to enter, why, and who sees it                               |
| 04 | Success and next step          | Pending, saved, and committed are shown truthfully, with a clear next step   |
| 05 | Correctable errors             | Specific fixes, input kept, no blind retry of consequential actions          |
| 06 | Waiting feedback               | Real progress only, with recovery if the wait breaks                         |
| 07 | Repeated entry                 | Known details can be reused safely, never across accounts                    |
| 08 | Icon meaning and consistency   | Icons are recognizable, consistent, and have accessible names                |
| 09 | Action labels                  | Next, save, submit, pay, and delete are clearly different                    |
| 10 | Permission timing and fallback | Access is asked for in context, and declining still leaves a way forward     |
| 11 | Filter control                 | Applied filters are visible, and clearing them keeps the query and sort      |
| 12 | Critical copy fits             | Important text survives large text sizes, small screens, and translation     |

## Manage the Skill

| Command                        | Description                  |
| ------------------------------ | ---------------------------- |
| `npx skills list`              | List installed skills        |
| `npx skills check`             | Check for available updates  |
| `npx skills update app-polish` | Update to the latest version |
| `npx skills remove app-polish` | Remove the skill             |

## What's Inside

```text
├── SKILL.md            # Agent entry point and workflow
├── references/         # State, copy, permissions, release QA, and evidence guides
├── assets/
│   ├── polish-audit.md            # 12-point audit template
│   ├── change-brief.md            # Spec for a small fix
│   ├── state-matrix.md            # States to test per environment
│   ├── qa-run.csv                 # QA ledger template (25 cases)
│   └── research-source-index.csv  # 34 indexed sources
├── scripts/
│   ├── validate-skill.py  # Package and local link checks
│   └── check-qa.py        # Offline QA ledger check
├── README.md
└── LICENSE
```

Once installed, the guides and templates work offline. Python is only needed for the optional helper scripts.

## Helper Scripts

Run these from the skill directory with Python 3.9 or later (standard library only).

Check the package layout, metadata, and local links:

```bash
python3 scripts/validate-skill.py
```

Track a release QA run in a copy of the ledger:

```bash
cp assets/qa-run.csv ./my-qa-run.csv
python3 scripts/check-qa.py ./my-qa-run.csv
```

A blank ledger reports as **open** (exit `1`) because no gates have run yet. Fill in results as you test.

| Exit code | Meaning                                                  |
| --------- | -------------------------------------------------------- |
| `0`       | All applicable gates were recorded as passed             |
| `1`       | Gates are still open, or every gate was marked out of scope |
| `2`       | The ledger is invalid                                    |

The script checks the ledger only. It does not run app tests, check external URLs, or certify accessibility or legal compliance.

## Documentation

- [State and recovery](references/state-and-recovery.md): empty, loading, invalid, offline, pending, committed, and unknown states, and filter reset
- [Copy, permissions, and accessibility](references/copy-permissions-and-accessibility.md): disclosures, field help, safe reuse, icons, labels, permissions, and critical text
- [Release QA and measurement](references/release-qa.md): fixtures, before/after checks, task comprehension, and guardrails
- [Video and evidence](references/video-and-evidence.md): notes on all 12 topics and a claim-by-claim evidence map
- [Source library](references/source-library.md) and [source index](assets/research-source-index.csv): standards, platform policies, and research

## Related Links

- [Skills CLI](https://github.com/vercel-labs/skills)
- [Skills Directory](https://skills.sh)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Source video by Wyatt Feaster](https://www.youtube.com/watch?v=q4TdOOkCDbw)
- [app-retention](https://github.com/nomandhoni-cs/app-retention), a companion skill

## License

The skill instructions, research notes, templates, and scripts are licensed under the [MIT License](LICENSE). Linked third-party material keeps its own terms; the original video, captions, screenshots, and papers are not redistributed here.
