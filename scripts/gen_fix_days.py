# -*- coding: utf-8 -*-
"""Backfill `workday.days.*` everywhere and the remaining `nudge` chrome keys."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES = os.path.join(ROOT, "src", "i18n", "locales")

DAYS = {
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "zh": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "zh-CN": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "zh-TW": ["週一", "週二", "週三", "週四", "週五", "週六", "週日"],
    "hi": ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"],
    "es-ES": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    "ar": ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    "pt": ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"],
    "pt-BR": ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"],
    "pt-PT": ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"],
    "de": ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    "ru": ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"],
    "ja": ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
    "bn": ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"],
    "fr": ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    "ur": ["پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار"],
    "id": ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    "ko": ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
    "it": ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"],
    "tr": ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    "vi": ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"],
    "th": ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"],
    "fa": ["دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"],
    "pl": ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"],
    "nl": ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
    "af": ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag", "Sondag"],
    "ca": ["dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge"],
    "cs": ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"],
    "da": ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"],
    "el": ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"],
    "fi": ["maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai", "sunnuntai"],
    "he": ["יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "יום שבת", "יום ראשון"],
    "hu": ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"],
    "no": ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"],
    "ro": ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"],
    "sr": ["понедељак", "уторак", "среда", "четвртак", "петак", "субота", "недеља"],
    "sv-SE": ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"],
    "uk": ["понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота", "неділя"],
}

CHROME = {
    "af": {"storyLabel": "Jou Blink Eye-verhaal", "progressLabel": "Jou vordering", "viewPremium": "Bekyk Premium", "remindNextWeek": "Herinner my volgende week", "notNow": "Nie nou nie"},
    "ca": {"storyLabel": "La teva història amb Blink Eye", "progressLabel": "El teu progrés", "viewPremium": "Veure Premium", "remindNextWeek": "Recorda-m'ho la setmana vinent", "notNow": "Ara no"},
    "cs": {"storyLabel": "Tvá historie s Blink Eye", "progressLabel": "Váš pokrok", "viewPremium": "Zobrazit Premium", "remindNextWeek": "Připomenout příští týden", "notNow": "Teď ne"},
    "da": {"storyLabel": "Din Blink Eye-historie", "progressLabel": "Dine fremskridt", "viewPremium": "Se Premium", "remindNextWeek": "Påmind mig næste uge", "notNow": "Ikke nu"},
    "el": {"storyLabel": "Η ιστορία σας με το Blink Eye", "progressLabel": "Η πρόοδός σας", "viewPremium": "Προβολή Premium", "remindNextWeek": "Υπενθύμιση την επόμενη εβδομάδα", "notNow": "Όχι τώρα"},
    "fi": {"storyLabel": "Sinun Blink Eye -tarina", "progressLabel": "Edistymisesi", "viewPremium": "Näytä Premium", "remindNextWeek": "Muistuta ensi viikolla", "notNow": "Ei nyt"},
    "hu": {"storyLabel": "A Blink Eye történeted", "progressLabel": "Előrehaladásod", "viewPremium": "Premium megtekintése", "remindNextWeek": "Emlékeztető jövő héten", "notNow": "Most nem"},
    "no": {"storyLabel": "Din Blink Eye-historie", "progressLabel": "Fremgangen din", "viewPremium": "Se Premium", "remindNextWeek": "Påminn meg neste uke", "notNow": "Ikke nå"},
    "ro": {"storyLabel": "Povestea ta cu Blink Eye", "progressLabel": "Progresul tău", "viewPremium": "Vezi Premium", "remindNextWeek": "Amintește-mi săptămâna viitoare", "notNow": "Nu acum"},
    "sr": {"storyLabel": "Ваша прича са Blink Eye", "progressLabel": "Ваш напредак", "viewPremium": "Погледај Premium", "remindNextWeek": "Подсети ме следеће недеље", "notNow": "Не сада"},
    "sv-SE": {"storyLabel": "Din Blink Eye-historia", "progressLabel": "Dina framsteg", "viewPremium": "Visa Premium", "remindNextWeek": "Påminn mig nästa vecka", "notNow": "Inte nu"},
    "uk": {"storyLabel": "Ваша історія з Blink Eye", "progressLabel": "Ваш прогрес", "viewPremium": "Дивитися Premium", "remindNextWeek": "Нагадати наступного тижня", "notNow": "Зараз ні"},
}

KEYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

for code, names in DAYS.items():
    path = os.path.join(LOCALES, f"{code}.json")
    data = json.load(open(path, encoding="utf-8"))
    # `workday.days` is the weekday-name map (Monday…Sunday). Some earlier
    # overlays accidentally stored a plain "Days" label here, so replace it.
    days = {}
    for key, name in zip(KEYS, names):
        days[key] = name
    data.setdefault("workday", {})["days"] = days
    if code in CHROME:
        nudge = data.setdefault("nudge", {})
        nudge.update(CHROME[code])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

print("backfilled workday.days for", len(DAYS), "locales")
