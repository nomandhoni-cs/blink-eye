# -*- coding: utf-8 -*-
"""Residual strings for locales that already had a fill_rest_* pass."""
from i18n_fill import apply_many

def s(p, d):
    return {p + "." + k: v for k, v in d.items()}

T = {}

# ---------------- update ----------------
UPD = {
 "af": {"checking":"Bezig om te kontroleer…","dialog.body":"Blink Eye v{{version}} is beskikbaar. Wil u nou opdateer?","dialog.later":"Nie nou nie","dialog.title":"Opdatering beskikbaar","dialog.update":"Opdateer","downloadUpdate":"Laai opdatering af","downloading":"Besig om af te laai… {{progress}}%","installUpdate":"Installeer opdatering v{{version}}","installUpdateAria":"Installeer opdatering weergawe {{version}}","preparing":"Berei opdatering voor…","retry":"Probeer weer","versionTooltip":"Weergawe {{version}} — klik om vir opdaterings te kontroleer"},
 "ca": {"checking":"Comprovant…","dialog.body":"Blink Eye v{{version}} està disponible. Voleu actualitzar ara?","dialog.later":"Ara no","dialog.title":"Actualització disponible","dialog.update":"Actualitza","downloadUpdate":"Baixa l'actualització","downloading":"Baixant… {{progress}}%","installUpdate":"Instal·la l'actualització v{{version}}","installUpdateAria":"Instal·la la versió d'actualització {{version}}","preparing":"Preparant l'actualització…","retry":"Torna-ho a provar","versionTooltip":"Versió {{version}} — feu clic per comprovar si hi ha actualitzacions"},
 "cs": {"checking":"Kontrola…","dialog.body":"Je k dispozici Blink Eye v{{version}}. Chcete nyní aktualizovat?","dialog.later":"Teď ne","dialog.title":"K dispozici je aktualizace","dialog.update":"Aktualizovat","downloadUpdate":"Stáhnout aktualizaci","downloading":"Stahování… {{progress}}%","installUpdate":"Nainstalovat aktualizaci v{{version}}","installUpdateAria":"Nainstalovat verzi aktualizace {{version}}","preparing":"Příprava aktualizace…","retry":"Zkusit znovu","versionTooltip":"Verze {{version}} — kliknutím zkontrolujete aktualizace"},
 "da": {"checking":"Kontrollerer…","dialog.body":"Blink Eye v{{version}} er tilgængelig. Vil du opdatere nu?","dialog.later":"Ikke nu","dialog.title":"Opdatering tilgængelig","dialog.update":"Opdater","downloadUpdate":"Download opdatering","downloading":"Downloader… {{progress}}%","installUpdate":"Installer opdatering v{{version}}","installUpdateAria":"Installer opdateringsversion {{version}}","preparing":"Forbereder opdatering…","retry":"Prøv igen","versionTooltip":"Version {{version}} — klik for at kontrollere opdateringer"},
 "de": {"checking":"Prüft…","downloadUpdate":"Update herunterladen","installUpdate":"Update v{{version}} installieren","installUpdateAria":"Update-Version {{version}} installieren","preparing":"Update wird vorbereitet…","retry":"Erneut versuchen","versionTooltip":"Version {{version}} — klicken, um nach Updates zu suchen"},
 "el": {"checking":"Έλεγχος…","dialog.body":"Το Blink Eye v{{version}} είναι διαθέσιμο. Θέλετε να ενημερώσετε τώρα;","dialog.later":"Όχι τώρα","dialog.title":"Διαθέσιμη ενημέρωση","dialog.update":"Ενημέρωση","downloadUpdate":"Λήψη ενημέρωσης","downloading":"Λήψη… {{progress}}%","installUpdate":"Εγκατάσταση ενημέρωσης v{{version}}","installUpdateAria":"Εγκατάσταση έκδοσης ενημέρωσης {{version}}","preparing":"Προετοιμασία ενημέρωσης…","retry":"Δοκιμή ξανά","versionTooltip":"Έκδοση {{version}} — κάντε κλικ για έλεγχο ενημερώσεων"},
 "es-ES": {"checking":"Comprobando…","downloadUpdate":"Descargar actualización","installUpdate":"Instalar actualización v{{version}}","installUpdateAria":"Instalar versión de actualización {{version}}","preparing":"Preparando actualización…","retry":"Reintentar","versionTooltip":"Versión {{version}} — haz clic para comprobar si hay actualizaciones"},
 "fi": {"checking":"Tarkistetaan…","dialog.body":"Blink Eye v{{version}} on saatavilla. Haluatko päivittää nyt?","dialog.later":"Ei nyt","dialog.title":"Päivitys saatavilla","dialog.update":"Päivitä","downloadUpdate":"Lataa päivitys","downloading":"Ladataan… {{progress}}%","installUpdate":"Asenna päivitys v{{version}}","installUpdateAria":"Asenna päivitysversio {{version}}","preparing":"Valmistellaan päivitystä…","retry":"Yritä uudelleen","versionTooltip":"Versio {{version}} — napsauta tarkistaaksesi päivitykset"},
 "fr": {"checking":"Vérification…","downloadUpdate":"Télécharger la mise à jour","installUpdate":"Installer la mise à jour v{{version}}","installUpdateAria":"Installer la version de mise à jour {{version}}","preparing":"Préparation de la mise à jour…","retry":"Réessayer","versionTooltip":"Version {{version}} — cliquez pour vérifier les mises à jour"},
 "hu": {"checking":"Ellenőrzés…","dialog.body":"Elérhető a Blink Eye v{{version}}. Szeretné most frissíteni?","dialog.later":"Most nem","dialog.title":"Frissítés érhető el","dialog.update":"Frissítés","downloadUpdate":"Frissítés letöltése","downloading":"Letöltés… {{progress}}%","installUpdate":"{{version}} verziójú frissítés telepítése","installUpdateAria":"{{version}} frissítési verzió telepítése","preparing":"Frissítés előkészítése…","retry":"Újra","versionTooltip":"{{version}} verzió — kattintson a frissítések kereséséhez"},
 "it": {"checking":"Controllo…","dialog.body":"Blink Eye v{{version}} è disponibile. Vuoi aggiornare ora?","dialog.later":"Non ora","dialog.title":"Aggiornamento disponibile","dialog.update":"Aggiorna","downloadUpdate":"Scarica aggiornamento","installUpdate":"Installa aggiornamento v{{version}}","installUpdateAria":"Installa versione di aggiornamento {{version}}","preparing":"Preparazione dell'aggiornamento…","retry":"Riprova","versionTooltip":"Versione {{version}} — fai clic per cercare aggiornamenti"},
 "nl": {"checking":"Controleren…","dialog.body":"Blink Eye v{{version}} is beschikbaar. Wilt u nu bijwerken?","dialog.later":"Niet nu","dialog.title":"Update beschikbaar","dialog.update":"Bijwerken","downloadUpdate":"Update downloaden","installUpdate":"Update v{{version}} installeren","installUpdateAria":"Updateversie {{version}} installeren","preparing":"Update voorbereiden…","retry":"Opnieuw proberen","versionTooltip":"Versie {{version}} — klik om op updates te controleren"},
 "no": {"checking":"Kontrollerer…","dialog.body":"Blink Eye v{{version}} er tilgjengelig. Vil du oppdatere nå?","dialog.later":"Ikke nå","dialog.title":"Oppdatering tilgjengelig","dialog.update":"Oppdater","downloadUpdate":"Last ned oppdatering","downloading":"Laster ned… {{progress}}%","installUpdate":"Installer oppdatering v{{version}}","installUpdateAria":"Installer oppdateringsversjon {{version}}","preparing":"Forbereder oppdatering…","retry":"Prøv igjen","versionTooltip":"Versjon {{version}} — klikk for å kontrollere oppdateringer"},
 "pl": {"checking":"Sprawdzanie…","dialog.body":"Blink Eye v{{version}} jest dostępny. Czy chcesz zaktualizować teraz?","dialog.later":"Nie teraz","dialog.title":"Dostępna aktualizacja","dialog.update":"Aktualizuj","downloadUpdate":"Pobierz aktualizację","installUpdate":"Zainstaluj aktualizację v{{version}}","installUpdateAria":"Zainstaluj wersję aktualizacji {{version}}","preparing":"Przygotowywanie aktualizacji…","retry":"Spróbuj ponownie","versionTooltip":"Wersja {{version}} — kliknij, aby sprawdzić aktualizacje"},
 "pt": {"checking":"A verificar…","downloadUpdate":"Transferir atualização","installUpdate":"Instalar atualização v{{version}}","installUpdateAria":"Instalar versão de atualização {{version}}","preparing":"A preparar a atualização…","retry":"Tentar novamente","versionTooltip":"Versão {{version}} — clique para procurar atualizações"},
 "pt-BR": {"checking":"Verificando…","downloadUpdate":"Baixar atualização","installUpdate":"Instalar atualização v{{version}}","installUpdateAria":"Instalar versão da atualização {{version}}","preparing":"Preparando a atualização…","retry":"Tentar novamente","versionTooltip":"Versão {{version}} — clique para verificar atualizações"},
 "pt-PT": {"checking":"A verificar…","downloadUpdate":"Transferir atualização","installUpdate":"Instalar atualização v{{version}}","installUpdateAria":"Instalar versão de atualização {{version}}","preparing":"A preparar a atualização…","retry":"Tentar novamente","versionTooltip":"Versão {{version}} — clique para procurar atualizações"},
 "ro": {"checking":"Se verifică…","dialog.body":"Blink Eye v{{version}} este disponibil. Doriți să actualizați acum?","dialog.later":"Nu acum","dialog.title":"Actualizare disponibilă","dialog.update":"Actualizează","downloadUpdate":"Descarcă actualizarea","downloading":"Se descarcă… {{progress}}%","installUpdate":"Instalează actualizarea v{{version}}","installUpdateAria":"Instalează versiunea de actualizare {{version}}","preparing":"Se pregătește actualizarea…","retry":"Reîncearcă","versionTooltip":"Versiunea {{version}} — faceți clic pentru a verifica actualizările"},
 "ru": {"checking":"Проверка…","downloadUpdate":"Скачать обновление","installUpdate":"Установить обновление v{{version}}","installUpdateAria":"Установить версию обновления {{version}}","preparing":"Подготовка обновления…","retry":"Повторить","versionTooltip":"Версия {{version}} — нажмите, чтобы проверить обновления"},
 "sr": {"checking":"Provera…","dialog.body":"Blink Eye v{{version}} je dostupan. Želite li sada da ažurirate?","dialog.later":"Ne sada","dialog.title":"Dostupno je ažuriranje","dialog.update":"Ažuriraj","downloadUpdate":"Preuzmi ažuriranje","downloading":"Preuzimanje… {{progress}}%","installUpdate":"Instaliraj ažuriranje v{{version}}","installUpdateAria":"Instaliraj verziju ažuriranja {{version}}","preparing":"Priprema ažuriranja…","retry":"Pokušaj ponovo","versionTooltip":"Verzija {{version}} — kliknite da proverite ažuriranja"},
 "sv-SE": {"checking":"Kontrollerar…","dialog.body":"Blink Eye v{{version}} är tillgänglig. Vill du uppdatera nu?","dialog.later":"Inte nu","dialog.title":"Uppdatering tillgänglig","dialog.update":"Uppdatera","downloadUpdate":"Ladda ner uppdatering","downloading":"Laddar ner… {{progress}}%","installUpdate":"Installera uppdatering v{{version}}","installUpdateAria":"Installera uppdateringsversion {{version}}","preparing":"Förbereder uppdatering…","retry":"Försök igen","versionTooltip":"Version {{version}} — klicka för att kontrollera uppdateringar"},
 "tr": {"checking":"Kontrol ediliyor…","dialog.body":"Blink Eye v{{version}} kullanılabilir. Şimdi güncellemek ister misiniz?","dialog.later":"Şimdi değil","dialog.title":"Güncelleme mevcut","dialog.update":"Güncelle","downloadUpdate":"Güncellemeyi indir","installUpdate":"v{{version}} güncellemesini yükle","installUpdateAria":"{{version}} güncelleme sürümünü yükle","preparing":"Güncelleme hazırlanıyor…","retry":"Tekrar dene","versionTooltip":"Sürüm {{version}} — güncellemeleri kontrol etmek için tıklayın"},
 "uk": {"checking":"Перевірка…","dialog.body":"Blink Eye v{{version}} доступно. Оновити зараз?","dialog.later":"Не зараз","dialog.title":"Доступне оновлення","dialog.update":"Оновити","downloadUpdate":"Завантажити оновлення","downloading":"Завантаження… {{progress}}%","installUpdate":"Встановити оновлення v{{version}}","installUpdateAria":"Встановити версію оновлення {{version}}","preparing":"Підготовка оновлення…","retry":"Повторити","versionTooltip":"Версія {{version}} — натисніть, щоб перевірити оновлення"},
 "zh": {"checking":"正在检查…","downloadUpdate":"下载更新","installUpdate":"安装更新 v{{version}}","installUpdateAria":"安装更新版本 {{version}}","preparing":"正在准备更新…","retry":"重试","versionTooltip":"版本 {{version}} — 点击检查更新"},
 "zh-CN": {"checking":"正在检查…","downloadUpdate":"下载更新","installUpdate":"安装更新 v{{version}}","installUpdateAria":"安装更新版本 {{version}}","preparing":"正在准备更新…","retry":"重试","versionTooltip":"版本 {{version}} — 点击检查更新"},
 "zh-TW": {"checking":"正在檢查…","downloadUpdate":"下載更新","installUpdate":"安裝更新 v{{version}}","installUpdateAria":"安裝更新版本 {{version}}","preparing":"正在準備更新…","retry":"重試","versionTooltip":"版本 {{version}} — 點擊檢查更新"},
}
for c, d in UPD.items():
    T.setdefault(c, {}).update(s("update", d))

# ---------------- common ----------------
COM = {
 "af": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeGroups.warm":"Warm","themeTitles.amber":"Amber","themeTitles.indigo":"Indigo","themeTitles.mauve":"Mauve","themeTitles.taupe":"Taupe","themeTitles.teal":"Teal"},
 "ca": {"error":"Error","min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeGroups.neutral":"Neutre","themeTitles.indigo":"Indigo","themeTitles.neutral":"Neutre","themeTitles.taupe":"Taupe","themeTitles.zinc":"Zinc","timerStyleVertical":"Vertical"},
 "cs": {"min":"min","premiumBadge":"PRÉMIUM","themeTitles.indigo":"Indigo","themeTitles.taupe":"Taupe"},
 "da": {"min":"min","multiMonitorPremium":"Multi-monitor (Premium)","premium":"Premium","premiumBadge":"PREMIUM","session":"Session {{used}} / {{limit}}","system":"System","themeTitles.cyan":"Cyan","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.lime":"Lime","themeTitles.mauve":"Mauve","themeTitles.neutral":"Neutral","themeTitles.orange":"Orange","themeTitles.pink":"Pink","themeTitles.rose":"Rose","themeTitles.taupe":"Taupe","themeTitles.teal":"Teal","themeTitles.violet":"Violet","version":"Version"},
 "de": {"multiMonitor":"Multi-Monitor","premium":"Premium","premiumBadge":"PREMIUM","system":"System","themeGroups.neutral":"Neutral","themeGroups.warm":"Warm","themeTitles.cyan":"Cyan","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.mauve":"Mauve","themeTitles.neutral":"Neutral","themeTitles.orange":"Orange","themeTitles.rose":"Rose","themeTitles.taupe":"Taupe","version":"Version"},
 "el": {"premium":"Premium","premiumBadge":"PREMIUM"},
 "es-ES": {"error":"Error","min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.zinc":"Zinc","timerStyleVertical":"Vertical"},
 "fi": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.indigo":"Indigo","themeTitles.lime":"Lime","themeTitles.mauve":"Mauve","themeTitles.taupe":"Taupe"},
 "fr": {"min":"min","minute":"minute","minutes":"minutes","premium":"Premium","premiumBadge":"PREMIUM","session":"Session {{used}} / {{limit}}","themeTitles.cyan":"Cyan","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.mauve":"Mauve","themeTitles.olive":"Olive","themeTitles.orange":"Orange","themeTitles.taupe":"Taupe","themeTitles.zinc":"Zinc","timerStyleVertical":"Vertical","version":"Version"},
 "hu": {"themeTitles.lime":"Lime","themeTitles.mauve":"Mauve","themeTitles.taupe":"Taupe"},
 "id": {"multiMonitor":"Multi-Monitor","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.taupe":"Taupe","themeTitles.teal":"Teal","timerStyleDial":"Dial"},
 "it": {"min":"min","multiMonitorPremium":"Multi-monitor (Premium)","off":"Off","on":"On","premium":"Premium","premiumBadge":"PREMIUM","sec":"sec","themeTitles.lime":"Lime","themeTitles.taupe":"Taupe"},
 "nl": {"min":"min","multiMonitorPremium":"Multi-monitor (Premium)","premium":"Premium","premiumBadge":"PREMIUM","themeGroups.warm":"Warm","themeTitles.amber":"Amber","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.mauve":"Mauve","themeTitles.taupe":"Taupe","themeTitles.teal":"Teal","themeTitles.violet":"Violet"},
 "no": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","system":"System","themeTitles.cyan":"Cyan","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.lime":"Lime","themeTitles.mauve":"Mauve","themeTitles.rose":"Rose","themeTitles.taupe":"Taupe"},
 "pl": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.mauve":"Mauve","themeTitles.taupe":"Taupe"},
 "pt": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.taupe":"Taupe","timerStyleVertical":"Vertical"},
 "pt-BR": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.taupe":"Taupe","timerStyleVertical":"Vertical"},
 "pt-PT": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.taupe":"Taupe","timerStyleVertical":"Vertical"},
 "ro": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","themeTitles.cyan":"Cyan","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.taupe":"Taupe","themeTitles.violet":"Violet","themeTitles.zinc":"Zinc","timerStyleVertical":"Vertical"},
 "ru": {"premiumBadge":"ПРЕМИУМ"},
 "sr": {"premiumBadge":"PREMIUM"},
 "sv-SE": {"min":"min","premium":"Premium","premiumBadge":"PREMIUM","session":"Session {{used}} / {{limit}}","system":"System","themeTitles.fuchsia":"Fuchsia","themeTitles.indigo":"Indigo","themeTitles.lime":"Lime","themeTitles.mauve":"Mauve","themeTitles.neutral":"Neutral","themeTitles.orange":"Orange","themeTitles.taupe":"Taupe","version":"Version"},
 "tr": {"premium":"Premium","premiumBadge":"PREMIUM"},
 "uk": {"premiumBadge":"ПРЕМІУМ"},
}
for c, d in COM.items():
    T.setdefault(c, {}).update(s("common", d))

# ---------------- dashboard ----------------
DASH = {
 "af": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "ca": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "cs": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s"},
 "da": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "de": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "el": {"snoozes":"Αναβολές"},
 "es-ES": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s"},
 "fi": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s"},
 "fr": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "hu": {"snoozes":"Snoozes"},
 "id": {"countdownMinutes":"{{minutes}}m"},
 "it": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes","title":"Cruscotto"},
 "nl": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes","title":"Dashboard"},
 "no": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s"},
 "pl": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s"},
 "pt": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "pt-BR": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "pt-PT": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "ro": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "sv-SE": {"countdown":"{{minutes}}m {{seconds}}s","countdownMinutes":"{{minutes}}m","countdownSeconds":"{{seconds}}s","snoozes":"Snoozes"},
 "tr": {"countdownSeconds":"{{seconds}}s"},
}
for c, d in DASH.items():
    T.setdefault(c, {}).update(s("dashboard", d))

# ---------------- reminderStyles ----------------
RS = {
 "af": {"styles.balatro":"Balatro"},
 "ar": {"styles.balatro":"Balatro"},
 "bn": {"styles.balatro":"Balatro"},
 "ca": {"styles.aurora":"Aurora","styles.balatro":"Balatro","styles.ferrofluid":"Ferrofluid"},
 "cs": {"styles.balatro":"Balatro","styles.iridescence":"Iridescence"},
 "da": {"styles.balatro":"Balatro"},
 "de": {"styles.aurora":"Aurora","styles.balatro":"Balatro","styles.ferrofluid":"Ferrofluid"},
 "el": {"styles.balatro":"Balatro"},
 "es-ES": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "fa": {"styles.balatro":"Balatro"},
 "fi": {"styles.balatro":"Balatro"},
 "fr": {"styles.balatro":"Balatro","styles.iridescence":"Iridescence"},
 "he": {"styles.balatro":"Balatro"},
 "hi": {"styles.balatro":"Balatro"},
 "hu": {"styles.balatro":"Balatro"},
 "id": {"styles.aurora":"Aurora","styles.balatro":"Balatro","styles.crtWarp":"CRT Warp","styles.dither":"Dither","styles.freesprit":"Free Spirit"},
 "it": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "ja": {"styles.balatro":"Balatro"},
 "ko": {"styles.balatro":"Balatro"},
 "nl": {"styles.aurora":"Aurora","styles.balatro":"Balatro","styles.shuffle":"Shuffle"},
 "no": {"styles.balatro":"Balatro"},
 "pl": {"styles.balatro":"Balatro"},
 "pt": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "pt-BR": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "pt-PT": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "ro": {"styles.balatro":"Balatro"},
 "ru": {"styles.balatro":"Balatro"},
 "sr": {"styles.balatro":"Balatro"},
 "sv-SE": {"styles.balatro":"Balatro"},
 "th": {"styles.balatro":"Balatro"},
 "tr": {"styles.aurora":"Aurora","styles.balatro":"Balatro"},
 "uk": {"styles.balatro":"Balatro"},
 "ur": {"styles.balatro":"Balatro"},
 "vi": {"styles.balatro":"Balatro"},
 "zh": {"styles.balatro":"Balatro"},
 "zh-CN": {"styles.balatro":"Balatro"},
 "zh-TW": {"styles.balatro":"Balatro"},
}
for c, d in RS.items():
    T.setdefault(c, {}).update(s("reminderStyles", d))

# ---------------- screenSavers ----------------
SS = {
 "af": {"premium":"Premium"},
 "ca": {"premium":"Premium","styles.aurora":"Aurora"},
 "cs": {"premium":"Prémiové"},
 "da": {"premium":"Premium"},
 "de": {"premium":"Premium","styles.aurora":"Aurora"},
 "el": {"premium":"Premium"},
 "es-ES": {"premium":"Premium","styles.aurora":"Aurora"},
 "fi": {"premium":"Premium"},
 "fr": {"premium":"Premium"},
 "id": {"premium":"Premium","styles.aurora":"Aurora","styles.freesprit":"Free Spirit"},
 "it": {"premium":"Premium","styles.aurora":"Aurora"},
 "nl": {"premium":"Premium","styles.aurora":"Aurora"},
 "no": {"premium":"Premium"},
 "pl": {"premium":"Premium"},
 "pt": {"premium":"Premium","styles.aurora":"Aurora"},
 "pt-BR": {"premium":"Premium","styles.aurora":"Aurora"},
 "pt-PT": {"premium":"Premium","styles.aurora":"Aurora"},
 "ro": {"premium":"Premium"},
 "ru": {"premium":"Премиум"},
 "sr": {"premium":"Premium"},
 "sv-SE": {"premium":"Premium"},
 "tr": {"premium":"Premium","styles.aurora":"Aurora"},
 "uk": {"premium":"Премиум"},
}
for c, d in SS.items():
    T.setdefault(c, {}).update(s("screenSavers", d))

# ---------------- onboarding ----------------
OB = {
 "af": {"featurePremiumTitle":"Premium"},
 "ca": {"featurePremiumTitle":"Premium"},
 "cs": {"featurePremiumTitle":"Prémiové"},
 "da": {"featurePremiumTitle":"Premium"},
 "de": {"featurePremiumTitle":"Premium","openSource":"Open Source"},
 "el": {"featurePremiumTitle":"Premium"},
 "es-ES": {"featurePremiumTitle":"Premium"},
 "fi": {"featurePremiumTitle":"Premium"},
 "fr": {"featurePremiumTitle":"Premium"},
 "hu": {"reminderMessagePlaceholder":"Szünet! Nézz messze, és ha tudod, sétálj egy kicsit."},
 "id": {"featurePremiumTitle":"Premium"},
 "it": {"featurePremiumTitle":"Premium"},
 "nl": {"featurePremiumTitle":"Premium"},
 "no": {"featurePremiumTitle":"Premium"},
 "pl": {"featurePremiumTitle":"Premium"},
 "pt": {"featurePremiumTitle":"Premium"},
 "pt-BR": {"featurePremiumTitle":"Premium"},
 "pt-PT": {"featurePremiumTitle":"Premium"},
 "ro": {"featurePremiumTitle":"Premium"},
 "sr": {"featurePremiumTitle":"Premium"},
 "sv-SE": {"featurePremiumTitle":"Premium"},
 "tr": {"featurePremiumTitle":"Premium"},
 "uk": {"featurePremiumTitle":"Премиум"},
}
for c, d in OB.items():
    T.setdefault(c, {}).update(s("onboarding", d))

# ---------------- small leftovers ----------------
EXTRA = {
 "ca": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "es-ES": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "fr": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total : {{value}}","license.active":"ACTIF","license.inactive":"INACTIF","nudge.rest.minute":"{{count}} minute","nudge.rest.minutes":"{{count}} minutes"},
 "id": {"timerStyle.dial":"Dial","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "pt": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "pt-BR": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "pt-PT": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "ro": {"timerStyle.vertical":"Vertical","usageTimeChart.monthlyTotal":"{{month}} - Total: {{value}}"},
 "cs": {"settings.export":"Export","settings.import":"Import"},
 "da": {"todo.deadline":"Deadline"},
 "de": {"todo.details":"Details","about.community":"Community"},
 "nl": {"todo.deadline":"Deadline","todo.details":"Details","about.community":"Community","about.website":"Website","nav.dashboard":"Dashboard","tray.dashboard":"Dashboard"},
 "ro": {"todo.active":"Active"},
 "sv-SE": {"todo.deadline":"Deadline","about.community":"Community","reminderSettings.snoozesPerSession":"Snoozes per session"},
 "hu": {"reminderSettings.skipLimits":"Skip limits"},
 "it": {"nav.dashboard":"Cruscotto","tray.dashboard":"Cruscotto"},
}
for c, d in EXTRA.items():
    for key, val in d.items():
        sec = key.split(".")[0]
        T.setdefault(c, {}).update(s(sec, {key.split(".", 1)[1]: val}))

apply_many(T)
