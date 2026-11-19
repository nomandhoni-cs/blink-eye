#!/usr/bin/env python3
"""Validate an App Polish QA ledger and report open gates without running app tests."""

import argparse
import csv
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

FIELDS = ['case_id', 'topic', 'priority', 'result', 'evidence_or_reason']
CASE_ID = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
TOPICS = {str(i) for i in range(1, 13)}
PRIORITIES = {'gate', 'follow-up'}
RESULTS = ('not-run', 'pass', 'fail', 'blocked', 'n/a')
BASELINE = Path(__file__).resolve().parent.parent / 'assets' / 'qa-run.csv'


@dataclass(frozen=True)
class Case:
    case_id: str
    topic: str
    priority: str
    result: str
    has_evidence: bool


def read_ledger(path):
    cases, errors, seen = [], [], set()
    try:
        with path.open(encoding='utf-8-sig', newline='') as handle:
            reader = csv.DictReader(handle, strict=True)
            if reader.fieldnames != FIELDS:
                return cases, [f'{path.name}: expected header: {",".join(FIELDS)}']
            for row in reader:
                where = f'{path.name} (ending at line {reader.line_num})'
                if None in row or any(value is None for value in row.values()):
                    errors.append(f'{where}: wrong number of columns')
                    continue
                case_id, topic, priority, result, proof = (row[field] for field in FIELDS)
                if not (1 <= len(case_id) <= 64 and CASE_ID.fullmatch(case_id)):
                    errors.append(f'{where}: case_id must have 1–64 lowercase letters/digits separated by single hyphens')
                    continue
                if case_id in seen:
                    errors.append(f'{where}: duplicate ID {case_id}')
                    continue
                seen.add(case_id)
                if topic not in TOPICS:
                    errors.append(f'{where} ({case_id}): topic must be an integer from 1 to 12')
                if priority not in PRIORITIES:
                    errors.append(f'{where} ({case_id}): priority must be gate or follow-up')
                if result not in RESULTS:
                    errors.append(f'{where} ({case_id}): result must be one of {", ".join(RESULTS)}')
                if result in RESULTS and result != 'not-run' and not proof.strip():
                    errors.append(f'{where} ({case_id}): {result} requires evidence_or_reason')
                cases.append(Case(case_id, topic, priority, result, bool(proof.strip())))
    except (OSError, UnicodeError, csv.Error) as exc:
        errors.append(f'{path.name}: could not read CSV ({exc})')
    if not cases and not errors:
        errors.append(f'{path.name}: ledger has no cases')
    return cases, errors


def evaluate(path):
    required, errors = read_ledger(BASELINE)
    if errors:
        return 2, {'status': 'invalid', 'errors': [f'Packaged baseline: {error}' for error in errors]}
    if ({case.topic for case in required} != TOPICS
            or not any(case.priority == 'gate' for case in required)
            or any(case.result != 'not-run' or case.has_evidence for case in required)):
        return 2, {'status': 'invalid', 'errors': ['Packaged baseline must cover all topics and be a blank run.']}

    cases, errors = read_ledger(path)
    if not errors:
        by_id = {case.case_id: case for case in cases}
        for expected in required:
            actual = by_id.get(expected.case_id)
            if actual is None:
                errors.append(f'missing baseline case {expected.case_id}; keep the row and explain n/a if justified')
                continue
            if expected.topic != actual.topic:
                errors.append(f'{actual.case_id}: baseline topic must remain {expected.topic}')
            if expected.priority == 'gate' and actual.priority != 'gate':
                errors.append(f'{actual.case_id}: cannot demote a baseline gate to follow-up')
    if errors:
        return 2, {'status': 'invalid', 'errors': errors}

    counts = Counter(case.result for case in cases)
    gate_count = sum(case.priority == 'gate' for case in cases)
    applicable = sum(case.priority == 'gate' and case.result != 'n/a' for case in cases)
    pending = {'not-run', 'fail', 'blocked'}

    def open_items(priority):
        return [{'case_id': case.case_id, 'result': case.result}
                for case in sorted(cases, key=lambda item: item.case_id)
                if case.priority == priority and case.result in pending]

    open_gates = open_items('gate')
    open_follow_ups = open_items('follow-up')
    resolved = applicable > 0 and not open_gates
    return (0 if resolved else 1), {
        'status': 'gates-resolved' if resolved else 'open',
        'total_cases': len(cases),
        'gate_count': gate_count,
        'applicable_gate_count': applicable,
        'counts': {result: counts[result] for result in RESULTS},
        'open_gates': open_gates,
        'open_follow_ups': open_follow_ups,
        'note': ('No applicable gate executed. ' if applicable == 0 else '')
        + 'Ledger only; review evidence, exclusions, and environment coverage before release.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog=(
        'Exit 0: applicable declared gates recorded as passed. '
        'Exit 1: open gates or no applicable gate executed. Exit 2: invalid ledger.'
    ))
    parser.add_argument('ledger', type=Path, help='path to a copy of assets/qa-run.csv')
    parser.add_argument('--json', action='store_true', help='print a structured report')
    args = parser.parse_args()
    code, report = evaluate(args.ledger)
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=True))
    elif code == 2:
        print('Invalid QA ledger:', file=sys.stderr)
        for error in report['errors']:
            print(f'- {error}', file=sys.stderr)
    else:
        print(f"{report['status']}: {report['total_cases']} cases; "
              f"{report['applicable_gate_count']}/{report['gate_count']} gate cases applicable")
        print(', '.join(f'{name}={count}' for name, count in report['counts'].items()))
        for title, field in [('Open gates', 'open_gates'), ('Open follow-ups', 'open_follow_ups')]:
            if report[field]:
                print(title + ':')
                for item in report[field]:
                    print(f"- {item['case_id']}: {item['result']}")
        print(report['note'])
    return code


if __name__ == '__main__':
    sys.exit(main())
