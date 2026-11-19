#!/usr/bin/env python3
"""Check the App Polish package, local resource links, source map, and QA template."""

import argparse
import csv
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlsplit

REFERENCES = {f'references/{name}.md' for name in (
    'video-and-evidence', 'state-and-recovery', 'copy-permissions-and-accessibility',
    'release-qa', 'source-library',
)}
ASSETS = {f'assets/{name}' for name in (
    'polish-audit.md', 'change-brief.md', 'state-matrix.md', 'qa-run.csv', 'research-source-index.csv',
)}
POINTERS = REFERENCES | ASSETS | {'scripts/check-qa.py'}
REQUIRED = POINTERS | {'SKILL.md', 'README.md', 'LICENSE', '.gitignore', 'scripts/validate-skill.py'}
SOURCE_FIELDS = ['id', 'topics', 'source_type', 'title', 'author_or_organization',
                 'publication_or_revision', 'primary_url', 'related_url', 'related_url_type',
                 'access_checked', 'takeaway', 'limitations', 'checked_on']
QA_FIELDS = ['case_id', 'topic', 'priority', 'result', 'evidence_or_reason']
SOURCE_ID = re.compile(r'\b[VWPLDRTM][0-9]{2}\b')
LINK = re.compile(r'(?<!!)\[[^\]\n]+\]\(([^)\s]+)\)')
SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
TOPICS = [f'{n:02d}' for n in range(1, 13)]


def frontmatter(content):
    # App Polish uses flat YAML scalars. Run official skills-ref for full spec validation.
    lines = content.splitlines()
    if not lines or lines[0] != '---' or '---' not in lines[1:]:
        raise ValueError('frontmatter requires opening and closing --- at top of SKILL.md')
    end = lines.index('---', 1)
    if not any(line.strip() for line in lines[end + 1:]):
        raise ValueError('missing instruction body')
    fields = {}
    for line in lines[1:end]:
        if not line.strip():
            continue
        match = re.fullmatch(r'([a-z][a-z-]*): +(.+)', line)
        if not match or match[1] in fields:
            raise ValueError(f'invalid or duplicate flat YAML field {line!r}')
        key, raw = match.groups()
        fields[key] = json.loads(raw) if raw.startswith('"') else raw.strip()
    return fields


def declared_links(body, local_name, root, errors):
    checked = set()
    for match in LINK.finditer(body):
        target = match[1].strip('<>')
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        base = (root / local_name).parent
        if parsed.path.startswith('/') or '\\' in unquote(parsed.path):
            errors.append(f'{local_name}: not a relative path: {target}')
            continue
        resolved = (base / unquote(parsed.path)).resolve()
        try:
            relative = resolved.relative_to(root).as_posix()
        except ValueError:
            errors.append(f'{local_name}: link leaves package: {target}')
            continue
        if not resolved.is_file():
            errors.append(f'{local_name}: missing link target: {target}')
        else:
            checked.add(relative)
    return checked


def read_index(path, fields, errors):
    with path.open(encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle, strict=True)
        if reader.fieldnames != fields:
            errors.append(f'{path.name}: wrong CSV headers')
            return []
        rows = []
        for row in reader:
            if None in row or any(value is None for value in row.values()):
                errors.append(f'{path.name} line {reader.line_num}: wrong number of columns')
            else:
                rows.append(row)
        if not rows:
            errors.append(f'{path.name}: missing rows')
        return rows


def check_sources(root, documents, errors):
    rows = read_index(root / 'assets/research-source-index.csv', SOURCE_FIELDS, errors)
    catalog = {}
    for row in rows:
        code = row['id']
        if not SOURCE_ID.fullmatch(code) or code in catalog:
            errors.append(f'invalid or duplicate research ID: {code!r}')
            continue
        catalog[code] = row['primary_url']
        optional = {'related_url', 'related_url_type'}
        if any(not row[key].strip() for key in set(SOURCE_FIELDS) - optional):
            errors.append(f'{code}: source record omits required details')
        if bool(row['related_url']) != bool(row['related_url_type']):
            errors.append(f'{code}: related URL and type must both be supplied or both omitted')
        for field in ('primary_url', 'related_url'):
            value = row[field]
            if field == 'related_url' and not value:
                continue
            parsed = urlsplit(value)
            if parsed.scheme != 'https' or not parsed.hostname or any(s.isspace() for s in value):
                errors.append(f'{code}: invalid HTTPS {field}')
        try:
            date.fromisoformat(row['checked_on'])
        except ValueError:
            errors.append(f'{code}: invalid checked_on date (expected YYYY-MM-DD)')
    known = set(catalog)
    cited = set().union(*(set(SOURCE_ID.findall(body)) for body in documents.values()))
    if cited - known:
        errors.append('unindexed evidence IDs: ' + ', '.join(sorted(cited - known)))
    library = documents.get('references/source-library.md', '')
    entries = re.findall(r'^\*\*([VWPLDRTM][0-9]{2}) · \[[^\]\n]+\]\(([^)\s]+)\)\*\*', library, re.M)
    if len(entries) != len(catalog) or dict(entries) != catalog:
        errors.append('source library entries must match CSV source IDs and primary URLs exactly')
    guide = documents.get('references/video-and-evidence.md', '')
    sections = re.split(r'^## (\d{2})\. ', guide, flags=re.M)
    if sections[1::2] != TOPICS:
        errors.append('video guide must cover topics 01–12 in spoken order')
    else:
        for topic, section in zip(TOPICS, sections[2::2]):
            if not (set(SOURCE_ID.findall(section)) & known):
                errors.append(f'video topic {topic}: missing indexed evidence')
    return len(catalog)


def check_template(root, documents, errors):
    audit = re.findall(r'^\| (\d{2}) \|', documents.get('assets/polish-audit.md', ''), re.M)
    if audit != TOPICS:
        errors.append('audit must cover checks 01–12 in order')
    matrix = re.findall(r'^\| `([a-z0-9-]+)` \| (\d{1,2}) \| (gate|follow-up) \|',
                        documents.get('assets/state-matrix.md', ''), re.M)
    template = read_index(root / 'assets/qa-run.csv', QA_FIELDS, errors)
    ids = [row['case_id'] for row in template]
    if len(set(ids)) != len(ids) or any(not (1 <= len(item) <= 64 and SLUG.fullmatch(item)) for item in ids):
        errors.append('QA template case IDs must be valid and unique')
    if {row['topic'] for row in template} != {str(n) for n in range(1, 13)}:
        errors.append('QA template must cover topics 1–12')
    if [(row['case_id'], row['topic'], row['priority']) for row in template] != matrix:
        errors.append('QA matrix and blank CSV must have matching IDs, topics, and priorities in order')
    if any(row['result'] != 'not-run' or row['evidence_or_reason'] for row in template):
        errors.append('bundled QA template must be blank: not-run, with no evidence')
    return len(template)


def validate(root):
    errors = []
    for name in sorted(REQUIRED):
        path = root / name
        if not path.is_file():
            errors.append(f'missing file: {name}')
        elif path.is_symlink() or root not in path.resolve().parents:
            errors.append(f'expected regular package file, not a symlink or external target: {name}')
    if errors:
        return errors, {}
    documents = {name: (root / name).read_text(encoding='utf-8') for name in sorted(REQUIRED) if name.endswith('.md')}
    lines = len(documents['SKILL.md'].splitlines())
    if lines >= 500:
        errors.append(f'SKILL.md has {lines} lines; expected fewer than 500')
    try:
        metadata = frontmatter(documents['SKILL.md'])
        name = metadata.get('name', '')
        if not isinstance(name, str) or not (1 <= len(name) <= 64 and SLUG.fullmatch(name)):
            errors.append('invalid SKILL.md name')
        if name != root.name or name != 'app-polish':
            errors.append(f'expected name and folder to be app-polish (got {name!r} and {root.name!r})')
        desc = metadata.get('description', '')
        if not isinstance(desc, str) or not 1 <= len(desc.strip()) <= 1024:
            errors.append('description must be a nonempty string of at most 1024 characters')
        if metadata.get('license') != 'MIT':
            errors.append('this package expects license: MIT')
    except ValueError as exc:
        errors.append(str(exc))
    files_linked = {name: declared_links(body, name, root, errors) for name, body in documents.items()}
    missing_pointers = POINTERS - files_linked['SKILL.md']
    if missing_pointers:
        errors.append('SKILL.md lacks resource links: ' + ', '.join(sorted(missing_pointers)))
    sources = check_sources(root, documents, errors)
    cases = check_template(root, documents, errors)
    return errors, {'lines': lines, 'links': sum(len(paths) for paths in files_linked.values()),
                    'sources': sources, 'cases': cases}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', nargs='?', type=Path, default=Path(__file__).resolve().parent.parent,
                        help='path to app-polish/ (default: parent of scripts/)')
    args = parser.parse_args()
    try:
        errors, info = validate(args.directory.resolve())
    except (OSError, UnicodeError, ValueError, csv.Error) as exc:
        errors = [str(exc)]
    if errors:
        print('Invalid App Polish package:', file=sys.stderr)
        for error in errors:
            print(f'- {error}', file=sys.stderr)
        return 1
    print('OK: {lines} SKILL.md lines; {links} checked local resource links; '
          '{sources} indexed sources; {cases} QA cases.'.format(**info))
    return 0


if __name__ == '__main__':
    sys.exit(main())
