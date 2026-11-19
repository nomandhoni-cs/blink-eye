# -*- coding: utf-8 -*-
"""Add the missing `nudge` chrome/highlight keys (batch C)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES = os.path.join(ROOT, "src", "i18n", "locales")

DATA = {
    "el": {
        "title": "Η πρόοδός σας", "unlock": "Ξεκλείδωμα Premium", "upgrade": "Αναβάθμιση σε Premium",
        "fallback.headline": "Η πρόοδός σας μέχρι τώρα",
        "fallback.body": "Το Blink Eye είναι δωρεάν και ανοιχτού κώδικα. Το Premium ξεκλειδώνει θέματα, πολλαπλές οθόνες και διατηρεί το έργο ζωντανό.",
        "fallback.cta": "Προβολή Premium",
        "daysLeftNote.one": " Σας μένει {{count}} ημέρα premium — αξιοποιήστε την.",
        "daysLeftNote.other": " Σας μένουν {{count}} ημέρες premium — αξιοποιήστε τις.",
        "rest.minute": "{{count}} λεπτό", "rest.minutes": "{{count}} λεπτά",
        "rest.hour": "{{count}} ώρα", "rest.hours": "{{count}} ώρες",
        "hero.breakOne": "διακοπή που κάναμε μαζί", "hero.breakOther": "διακοπές που κάναμε μαζί",
        "hero.daysOfKinderEyes": "ημέρες πιο ελαφριών ματιών",
        "hero.restCaption": "≈ {{rest}} ξεκούραση για τα μάτια σας",
        "hero.startedHere": "Κάθε συνήθεια ξεκινά κάπου — δική σας ξεκίνησε εδώ.",
        "tile.streak": "ημέρες σε σειρά", "tile.bestStreak": "καλύτερη σειρά",
        "tile.dayTogether": "ημέρα μαζί", "tile.daysTogether": "ημέρες μαζί",
    },
    "cs": {
        "title": "Váš pokrok", "unlock": "Odemknout Premium", "upgrade": "Přejít na Premium",
        "fallback.headline": "Váš pokrok doposud",
        "fallback.body": "Blink Eye je zdarma a open source. Premium odemyká motivy, více monitorů a udržuje projekt naživu.",
        "fallback.cta": "Zobrazit Premium",
        "daysLeftNote.one": " Zbývá vám {{count}} den premium — využijte ho.",
        "daysLeftNote.other": " Zbývají vám {{count}} dny premium — využijte je.",
        "rest.minute": "{{count}} minuta", "rest.minutes": "{{count}} min.",
        "rest.hour": "{{count}} hodina", "rest.hours": "{{count}} hod.",
        "hero.breakOne": "pauza udělaná společně", "hero.breakOther": "pauzy udělané společně",
        "hero.daysOfKinderEyes": "dní šetřících oči",
        "hero.restCaption": "≈ {{rest}} odpočinku pro vaše oči",
        "hero.startedHere": "Každý zvyk začíná někde — váš začal tady.",
        "tile.streak": "dní v řadě", "tile.bestStreak": "nejlepší série",
        "tile.dayTogether": "den společně", "tile.daysTogether": "dní společně",
    },
    "da": {
        "title": "Dine fremskridt", "unlock": "Lås op for Premium", "upgrade": "Opgrader til Premium",
        "fallback.headline": "Dine fremskridt indtil videre",
        "fallback.body": "Blink Eye er gratis og open source. Premium låser temaer, flere skærme op og holder projektet i live.",
        "fallback.cta": "Se Premium",
        "daysLeftNote.one": " Du har {{count}} dag premium tilbage — få mest muligt ud af den.",
        "daysLeftNote.other": " Du har {{count}} dage premium tilbage — få mest muligt ud af dem.",
        "rest.minute": "{{count}} minut", "rest.minutes": "{{count}} minutter",
        "rest.hour": "{{count}} time", "rest.hours": "{{count}} timer",
        "hero.breakOne": "pause taget sammen", "hero.breakOther": "pauser taget sammen",
        "hero.daysOfKinderEyes": "dage med mildere øjne",
        "hero.restCaption": "≈ {{rest}} hvile til dine øjne",
        "hero.startedHere": "Enhver vane begynder et sted — din begyndte her.",
        "tile.streak": "dage i træk", "tile.bestStreak": "bedste række",
        "tile.dayTogether": "dag sammen", "tile.daysTogether": "dage sammen",
    },
    "fi": {
        "title": "Edistymisesi", "unlock": "Avaa Premium", "upgrade": "Päivitä Premiumiin",
        "fallback.headline": "Edistymisesi tähän asti",
        "fallback.body": "Blink Eye on ilmainen ja avointa lähdekoodia. Premium avaa teemat, useat näytöt ja pitää projektin elossa.",
        "fallback.cta": "Näytä Premium",
        "daysLeftNote.one": " Sinulla on {{count}} päivä premiumia jäljellä — hyödynnä se.",
        "daysLeftNote.other": " Sinulla on {{count}} päivää premiumia jäljellä — hyödynnä ne.",
        "rest.minute": "{{count}} minuutti", "rest.minutes": "{{count}} min",
        "rest.hour": "{{count}} tunti", "rest.hours": "{{count}} t",
        "hero.breakOne": "yhdessä otettu tauko", "hero.breakOther": "yhdessä otetut tauot",
        "hero.daysOfKinderEyes": "mietojen silmien päiviä",
        "hero.restCaption": "≈ {{rest}} lepoa silmillesi",
        "hero.startedHere": "Jokainen tapa alkaa jostain — sinun alkoi täällä.",
        "tile.streak": "päivää peräkkäin", "tile.bestStreak": "paras putki",
        "tile.dayTogether": "päivä yhdessä", "tile.daysTogether": "päivää yhdessä",
    },
    "hu": {
        "title": "Előrehaladásod", "unlock": "Premium feloldása", "upgrade": "Premiumra váltás",
        "fallback.headline": "Előrehaladásod eddig",
        "fallback.body": "A Blink Eye ingyenes és nyílt forráskódú. A Premium feloldja a témákat, a több monitort és életben tartja a projektet.",
        "fallback.cta": "Premium megtekintése",
        "daysLeftNote.one": " Még {{count}} napod van a premiumra — használd ki.",
        "daysLeftNote.other": " Még {{count}} napod van a premiumra — használd ki.",
        "rest.minute": "{{count}} perc", "rest.minutes": "{{count}} perc",
        "rest.hour": "{{count}} óra", "rest.hours": "{{count}} óra",
        "hero.breakOne": "együtt tartott szünet", "hero.breakOther": "együtt tartott szünetek",
        "hero.daysOfKinderEyes": "gyengédebb napok a szemednek",
        "hero.restCaption": "≈ {{rest}} pihenés a szemednek",
        "hero.startedHere": "Minden szokás valahol kezdődik — a tiéd itt kezdődött.",
        "tile.streak": "egymást követő nap", "tile.bestStreak": "legjobb sorozat",
        "tile.dayTogether": "nap együtt", "tile.daysTogether": "nap együtt",
    },
    "no": {
        "title": "Fremgangen din", "unlock": "Lås opp Premium", "upgrade": "Oppgrader til Premium",
        "fallback.headline": "Fremgangen din så langt",
        "fallback.body": "Blink Eye er gratis og åpen kildekode. Premium låser opp temaer, flere skjermer og holder prosjektet i live.",
        "fallback.cta": "Se Premium",
        "daysLeftNote.one": " Du har {{count}} dag med premium igjen — få mest mulig ut av den.",
        "daysLeftNote.other": " Du har {{count}} dager med premium igjen — få mest mulig ut av dem.",
        "rest.minute": "{{count}} minutt", "rest.minutes": "{{count}} minutter",
        "rest.hour": "{{count}} time", "rest.hours": "{{count}} timer",
        "hero.breakOne": "pause tatt sammen", "hero.breakOther": "pauser tatt sammen",
        "hero.daysOfKinderEyes": "dager med mildere øyne",
        "hero.restCaption": "≈ {{rest}} hvile for øynene dine",
        "hero.startedHere": "Enhver vane starter et sted — din startet her.",
        "tile.streak": "dager på rad", "tile.bestStreak": "beste rekke",
        "tile.dayTogether": "dag sammen", "tile.daysTogether": "dager sammen",
    },
    "ro": {
        "title": "Progresul tău", "unlock": "Deblochează Premium", "upgrade": "Treci la Premium",
        "fallback.headline": "Progresul tău până acum",
        "fallback.body": "Blink Eye este gratuit și open source. Premium deblochează teme, mai multe monitoare și ține proiectul în viață.",
        "fallback.cta": "Vezi Premium",
        "daysLeftNote.one": " Mai ai {{count}} zi de premium — profită de ea.",
        "daysLeftNote.other": " Mai ai {{count}} zile de premium — profită de ele.",
        "rest.minute": "{{count}} minut", "rest.minutes": "{{count}} min.",
        "rest.hour": "{{count}} oră", "rest.hours": "{{count}} ore",
        "hero.breakOne": "pauză făcută împreună", "hero.breakOther": "pauze făcute împreună",
        "hero.daysOfKinderEyes": "zile de ochi mai odihniți",
        "hero.restCaption": "≈ {{rest}} de odihnă pentru ochii tăi",
        "hero.startedHere": "Orice obicei începe undeva — al tău a început aici.",
        "tile.streak": "zile la rând", "tile.bestStreak": "cea mai bună serie",
        "tile.dayTogether": "zi împreună", "tile.daysTogether": "zile împreună",
    },
    "sr": {
        "title": "Ваш напредак", "unlock": "Отључај Premium", "upgrade": "Пређи на Premium",
        "fallback.headline": "Ваш напредак до сада",
        "fallback.body": "Blink Eye је бесплатан и отворен кôд. Premium отључава теме, више монитора и одржава пројекат живим.",
        "fallback.cta": "Погледај Premium",
        "daysLeftNote.one": " Имате још {{count}} дан premium — искористите га.",
        "daysLeftNote.other": " Имате још {{count}} дана premium — искористите их.",
        "rest.minute": "{{count}} минут", "rest.minutes": "{{count}} мин.",
        "rest.hour": "{{count}} сат", "rest.hours": "{{count}} ч.",
        "hero.breakOne": "заједничка пауза", "hero.breakOther": "заједничке паузе",
        "hero.daysOfKinderEyes": "дана неге очију",
        "hero.restCaption": "≈ {{rest}} одмора за ваше очи",
        "hero.startedHere": "Свака навика почиње негде — ваша је почела овде.",
        "tile.streak": "дана заредом", "tile.bestStreak": "најбољи низ",
        "tile.dayTogether": "дан заједно", "tile.daysTogether": "дана заједно",
    },
    "af": {
        "title": "Jou vordering", "unlock": "Ontgrendel Premium", "upgrade": "Opgradeer na Premium",
        "fallback.headline": "Jou vordering tot dusver",
        "fallback.body": "Blink Eye is gratis en oopbron. Premium ontgrendel temas, multi-monitor en hou die projek aan die gang.",
        "fallback.cta": "Bekyk Premium",
        "daysLeftNote.one": " Jy het nog {{count}} dag premium — maak die beste daarvan.",
        "daysLeftNote.other": " Jy het nog {{count}} dae premium — maak die beste daarvan.",
        "rest.minute": "{{count}} minuut", "rest.minutes": "{{count}} min.",
        "rest.hour": "{{count}} uur", "rest.hours": "{{count}} u.",
        "hero.breakOne": "saam geneemde rus", "hero.breakOther": "saam geneemde rus",
        "hero.daysOfKinderEyes": "dae van sagter oë",
        "hero.restCaption": "≈ {{rest}} rus vir jou oë",
        "hero.startedHere": "Elke gewoonte begin iewers — joune het hier begin.",
        "tile.streak": "dae in 'n ry", "tile.bestStreak": "beste reeks",
        "tile.dayTogether": "dag saam", "tile.daysTogether": "dae saam",
    },
    "ca": {
        "title": "El teu progrés", "unlock": "Desbloqueja Premium", "upgrade": "Passa a Premium",
        "fallback.headline": "El teu progrés fins ara",
        "fallback.body": "Blink Eye és gratuït i de codi obert. Premium desbloqueja temes, diverses pantalles i manté el projecte viu.",
        "fallback.cta": "Veure Premium",
        "daysLeftNote.one": " Et queden {{count}} dia de premium — aprofita'l.",
        "daysLeftNote.other": " Et queden {{count}} dies de premium — aprofita'ls.",
        "rest.minute": "{{count}} minut", "rest.minutes": "{{count}} min",
        "rest.hour": "{{count}} hora", "rest.hours": "{{count}} h",
        "hero.breakOne": "descans fet junts", "hero.breakOther": "descansos fets junts",
        "hero.daysOfKinderEyes": "dies d'ulls més descansats",
        "hero.restCaption": "≈ {{rest}} de descans per als teus ulls",
        "hero.startedHere": "Cada hàbit comença en algun lloc — el teu va començar aquí.",
        "tile.streak": "dies seguits", "tile.bestStreak": "millor sèrie",
        "tile.dayTogether": "dia junts", "tile.daysTogether": "dies junts",
    },
}


def apply(code, flat):
    path = os.path.join(LOCALES, f"{code}.json")
    data = json.load(open(path, encoding="utf-8"))
    nudge = data.setdefault("nudge", {})
    for dotted, value in flat.items():
        parts = dotted.split(".")
        target = nudge
        for part in parts[:-1]:
            target = target.setdefault(part, {})
        target[parts[-1]] = value
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("updated", code)


for code, flat in DATA.items():
    apply(code, flat)
