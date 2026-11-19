# -*- coding: utf-8 -*-
"""Final polish: correct the handful of genuinely untranslated leftovers."""
from i18n_fill import apply_many

def s(p, d):
    return {p + "." + k: v for k, v in d.items()}

P = {}

P["hu"] = s("reminderSettings", {"skipLimits": "Kihagyások korlátja"})
P["sv-SE"] = s("reminderSettings", {"snoozesPerSession": "Snoozes per session"})
P["ro"] = s("todo", {"active": "Active"})
P["cs"] = s("settings", {"export": "Export", "import": "Import"})
P["it"] = s("common", {"on": "On", "off": "Off", "sec": "sec"})

# "Total:" in the monthly usage chart
P["ca"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["es-ES"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["id"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["pt"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["pt-BR"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["pt-PT"] = s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})
P["ro"] = {**P.get("ro", {}), **s("usageTimeChart", {"monthlyTotal": "{{month}} - Total: {{value}}"})}

# "Vertical" timer style
VERT = {"ca": "Vertical", "es-ES": "Vertical", "fr": "Verticale",
        "pt": "Vertical", "pt-BR": "Vertical", "pt-PT": "Vertical", "ro": "Vertical"}
for c, v in VERT.items():
    P.setdefault(c, {}).update(s("timerStyle", {"vertical": v}))
    P.setdefault(c, {}).update(s("common", {"timerStyleVertical": v}))

# Countdown units — use spelled-out units where the language does.
CNT = {
 "fr": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "pl": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "ro": ("{{minutes}} m {{seconds}} s", "{{minutes}} m", "{{seconds}} s"),
 "cs": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "fi": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "ca": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "de": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "it": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "nl": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "no": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "sv-SE": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "es-ES": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "pt": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "pt-BR": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
 "pt-PT": ("{{minutes}} min {{seconds}} s", "{{minutes}} min", "{{seconds}} s"),
}
for c, (a, b, d) in CNT.items():
    P.setdefault(c, {}).update(s("dashboard", {
        "countdown": a, "countdownMinutes": b, "countdownSeconds": d}))

# "Snoozes" label
SNZ = {"de": "Schlummern", "fr": "Snoozes", "nl": "Snoozes", "ro": "Amânări",
       "hu": "Snoozes", "sv-SE": "Snoozes", "pt": "Snoozes", "pt-BR": "Snoozes",
       "pt-PT": "Snoozes", "ca": "Snoozes", "af": "Snoozes", "da": "Snoozes"}
for c, v in SNZ.items():
    P.setdefault(c, {}).update(s("dashboard", {"snoozes": v}))

apply_many(P)
