#!/usr/bin/env python3
"""Check this package's layout, metadata, local links, and evidence index."""

import argparse
import csv
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

REFS = {
    "references/activation-patterns.md", "references/return-patterns.md",
    "references/video-and-evidence.md", "references/source-library.md",
    "references/implementation-and-qa.md", "references/measurement-and-experiments.md",
}
ASSETS = {
    "assets/retention-brief.md", "assets/retention-audit.md",
    "assets/experiment-plan.md", "assets/research-source-index.csv",
}
REQUIRED = REFS | ASSETS | {
    "README.md", "SKILL.md", "LICENSE", ".gitignore",
    "scripts/validate-skill.py", "scripts/plan-sample-size.py",
}
INDEX_COLUMNS = {
    "id", "video_chapter_or_use", "publication_year", "title", "author_or_organization",
    "source_type", "relation_to_video", "primary_url", "additional_url",
    "additional_url_type", "what_it_supports", "limitations",
}
NAME = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
SOURCE_ID = re.compile(r"\b[EPGVL][0-9]{2}\b")
LINK = re.compile(r"(?<!!)\[[^\]\n]+\]\(([^)\s]+)\)")


def frontmatter(contents):
    # This repo uses a flat YAML mapping with plain or double-quoted scalars.
    # The Agent Skills reference validator also checks full YAML independently.
    lines = contents.splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        raise ValueError("expected opening and closing --- at the top of SKILL.md")
    close = lines.index("---", 1)
    if not "\n".join(lines[close + 1:]).strip():
        raise ValueError("missing instruction body")
    fields = {}
    for line in lines[1:close]:
        if not line.strip():
            continue
        match = re.fullmatch(r"([a-z][a-z-]*): +(.+)", line)
        if not match:
            raise ValueError(f"not a flat YAML scalar: {line!r}")
        key, raw = match.groups()
        if key in fields:
            raise ValueError(f"duplicate metadata key: {key}")
        fields[key] = json.loads(raw) if raw.startswith('"') else raw.strip()
    return fields


def count_links(path, body, root, errors):
    resolved_paths = set()
    for open_link in LINK.finditer(body):
        target = urlsplit(open_link[1].strip("<>"))
        if target.scheme or target.netloc or not target.path:
            continue
        destination = (path.parent / unquote(target.path)).resolve()
        try:
            relative = destination.relative_to(root).as_posix()
        except ValueError:
            errors.append(f"{path.relative_to(root)}: link leaves package: {open_link[1]}")
            continue
        if not destination.is_file():
            errors.append(f"{path.relative_to(root)}: link target missing: {open_link[1]}")
            continue
        resolved_paths.add(relative)
    return resolved_paths


def validate(root):
    errors = []
    for item in sorted(REQUIRED):
        path = root / item
        if not path.is_file():
            errors.append(f"missing file: {item}")
    entry = root / "SKILL.md"
    referenced = set()
    documents = sorted([*root.glob("*.md"), *root.glob("references/*.md"), *root.glob("assets/*.md")])
    source_ids = set()
    verified_links = 0
    line_count = 0
    for path in documents:
        body = path.read_text(encoding="utf-8")
        source_ids.update(SOURCE_ID.findall(body))
        links = count_links(path, body, root, errors)
        verified_links += len(links)
        if path != entry:
            continue
        line_count = len(body.splitlines())
        if line_count >= 500:
            errors.append(f"SKILL.md has {line_count} lines; limit is fewer than 500")
        try:
            fields = frontmatter(body)
            name = fields.get("name", "")
            if not isinstance(name, str) or len(name) > 64 or not NAME.fullmatch(name):
                errors.append("name must be 1–64 lowercase letters/digits separated by single hyphens")
            if name != root.name:
                errors.append(f"frontmatter name {name!r} must match folder name {root.name!r}")
            desc = fields.get("description", "")
            if not isinstance(desc, str) or not 1 <= len(desc.strip()) <= 1024:
                errors.append("description must be a nonempty string of at most 1024 characters")
            if fields.get("license") != "MIT":
                errors.append("this package expects license: MIT")
        except ValueError as exc:
            errors.append(f"invalid SKILL.md metadata: {exc}")
        referenced = links
    if entry.is_file():
        expected_targets = REFS | ASSETS | {"scripts/plan-sample-size.py"}
        if expected_targets - referenced:
            errors.append("SKILL.md has missing resource pointers: " + ", ".join(sorted(expected_targets - referenced)))

    csv_path = root / "assets/research-source-index.csv"
    citations = set()
    if csv_path.is_file():
        with csv_path.open(newline="", encoding="utf-8-sig") as handle:
            index = csv.DictReader(handle, strict=True)
            if set(index.fieldnames or []) != INDEX_COLUMNS or len(index.fieldnames or []) != len(INDEX_COLUMNS):
                errors.append("source index headers don't match the expected schema")
            for row in index:
                code = row.get("id") or ""
                if None in row or any(value is None for value in row.values()):
                    errors.append(f"source index line {index.line_num}: ragged row")
                    continue
                if not SOURCE_ID.fullmatch(code) or code in citations:
                    errors.append(f"source index line {index.line_num}: invalid or duplicate ID {code!r}")
                citations.add(code)
                for field in ("primary_url", "additional_url"):
                    link = row.get(field, "")
                    if field == "additional_url" and not link:
                        continue
                    parsed = urlsplit(link)
                    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                        errors.append(f"source index {code}: invalid {field}")
        if not citations:
            errors.append("source index is empty")
        if source_ids - citations:
            errors.append("unindexed evidence IDs: " + ", ".join(sorted(source_ids - citations)))
    return errors, line_count, verified_links, len(citations)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", nargs="?", type=Path,
                        default=Path(__file__).resolve().parent.parent,
                        help="skill folder (default: directory containing this script's parent)")
    args = parser.parse_args()
    try:
        errors, lines, links, sources = validate(args.directory.resolve())
    except (OSError, UnicodeError, ValueError, csv.Error) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    if errors:
        for error in errors:
            print(f"FAIL: {error}", file=sys.stderr)
        return 1
    print(f"PASS: {args.directory.name}; SKILL.md {lines} lines; {links} local resource links; {sources} source entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
