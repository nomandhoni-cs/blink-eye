# -*- coding: utf-8 -*-
"""Helpers for back-filling translated strings into locale catalogs.

Usage from a batch script:

    from i18n_fill import apply_many
    apply_many({
        "de": {"common.next": "Weiter", "nav.settings": "Einstellungen"},
    })

Only keys whose current value is still the English source (or missing) are
written, so existing translations are never overwritten.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES = os.path.join(ROOT, "src", "i18n", "locales")

with open(os.path.join(LOCALES, "en.json"), encoding="utf-8") as _f:
    EN = json.load(_f)


def _get(data, path):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def _set(data, path, value):
    parts = path.split(".")
    cur = data
    for part in parts[:-1]:
        nxt = cur.get(part)
        if not isinstance(nxt, dict):
            nxt = {}
            cur[part] = nxt
        cur = nxt
    cur[parts[-1]] = value


def apply_locale(code, mapping):
    path = os.path.join(LOCALES, code + ".json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    changed = 0
    for key, value in mapping.items():
        current = _get(data, key)
        source = _get(EN, key)
        if current is None or current == source:
            _set(data, key, value)
            changed += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return changed


def apply_many(table):
    total = 0
    for code, mapping in table.items():
        n = apply_locale(code, mapping)
        total += n
        print("filled", code, n)
    print("total", total)
