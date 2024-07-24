import threading
import time
import webbrowser
import os
from datetime import datetime
import customtkinter as ctk
import multiprocessing
import pystray
from PIL import Image
from plyer import notification
import json

try:
    from blinkeye.utils import isWindows, resource_path, get_data, set_data, ALPHA_VALUES
    from blinkeye.audio import get_volume, set_volume
except ModuleNotFoundError as e:
    # Handle error caused by an attempt to run the file independently
    if str(e) == "No module named 'blinkeye'":
        raise Exception("\033[93mPlease run the application from 'main.py' and use 'import blinkeye.notifier' to access the attributes and functions\033[0m")

class BlinkEyeNotifier:
    def __init__(self):
        self.root = ctk.CTk()
        self.launched_time = 0
        self.skipped = False
        self.openned_cmds = []
        self.original_volume = 0.0
        self.unmuted_sound = False
        self.SCREEN_BREAK_INTERVAL = int(get_data("sbi"))
        self.FOCUS_BREAK = int(get_data("fb"))
        self.ISTRANSITION = True if get_data("fbsft") == 'on' else False
        self.THEME = get_data("betheme")
        self.load_language_pack()
        self.setup_window()
        
    def load_language_pack(self):
        with open(resource_path("configuration.json", True), 'r', encoding="utf-8") as f:
            data = json.load(f)
        
        language = str(get_data("lang")).lower()
        ctk.FontManager.load_font(resource_path(data['font'][language]['filename'], font=True))
        self.FONTNAME = data['font'][language]['fontname']
        self.RELATIVESIZE = data['font'][language]['relsize']
        data = data['notifier']
        self.LANGUAGE_DATA = {}
        for key in data:
            self.LANGUAGE_DATA[key] = data[key][language]
        self.LANGUAGE_NUMBERINGS = self.LANGUAGE_DATA['numberings']
        return None
    
    def get_language_sentence(self, key: str):
        return self.LANGUAGE_DATA[key]
    
    def fade_volume_sequence(self, restore: bool=False):
        if isWindows:
            if restore:
                if self.original_volume is not None:
                    volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
                    self.original_volume = 0.0
                    return volume_fade_values
                return []
            else:
                self.original_volume = get_volume()
                if self.original_volume is not None:
                    volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
                    return volume_fade_values[::-1]
                return []
        else:
            return []
        
    def setup_window(self):
        self.root.title("Blink Eye")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')
        self.root.attributes('-alpha', 0.0)
        self.root.overrideredirect(True)
        ctk.set_appearance_mode(self.THEME)
        self.create_widgets()

    def constract_number(self, num: int):
        number = list(str(num))
        lang_number = ""
        for n in number:
            lang_number += self.LANGUAGE_NUMBERINGS[n]
        return lang_number

    def create_widgets(self):
        self.logo_label = ctk.CTkLabel(self.root, text="  Blink Eye", image=ctk.CTkImage(Image.open(resource_path("blink-eye-logo.png")), Image.open(resource_path("blink-eye-logo.png")), (30, 30)), compound="left", font=("Noto Sans", 20, "bold"))
        self.logo_label.pack(pady=20, padx=20, anchor="e")

        self.counter_label = ctk.CTkLabel(self.root, text="", font=(self.FONTNAME, int(160 * self.RELATIVESIZE)))
        self.counter_label.pack(anchor='center', pady=(110, 10))

        self.time_label = ctk.CTkLabel(self.root, text="", font=(self.FONTNAME, int(24 * self.RELATIVESIZE)))
        self.time_label.pack(pady=5, anchor='center')

        self.look_away_msg = ctk.CTkLabel(self.root, text=self.get_language_sentence("20-ft-msg"), font=(self.FONTNAME, int(32 * self.RELATIVESIZE)))
        self.look_away_msg.pack(pady=(15, 5), anchor='center')

        self.button_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.button_frame.pack(pady=(30, 50), anchor='center')
        self.skip_button = ctk.CTkButton(self.button_frame, text=self.get_language_sentence("skip-msg"), command=self.skip_reminder, text_color=('gray10', '#DCE4EE'), compound='right', fg_color=("#FE4C55", "#FE4C55"), font=(self.FONTNAME, int(18 * self.RELATIVESIZE)), image=ctk.CTkImage(Image.open(resource_path("skip icon light.png")), Image.open(resource_path("skip icon dark.png")), (13, 13)), height=32, hover_color=("#dc4c56", "#dc4c56"), corner_radius=50)
        
        if isWindows:
            self.skip_button.pack(anchor='center', side="left", padx=5)

            self.sound_button = ctk.CTkButton(self.button_frame, text=f"", width=10, command=self.toggle_sound, text_color=('gray10', '#DCE4EE'), compound='right', fg_color=("#FE4C55", "#FE4C55"), font=(self.FONTNAME, int(18 * self.RELATIVESIZE)), image=ctk.CTkImage(Image.open(resource_path("unmute icon light.png")), Image.open(resource_path("unmute icon dark.png")), (13, 13)), height=32, hover_color=("#dc4c56", "#dc4c56"), corner_radius=100)
        else:
            self.skip_button.pack(anchor='center')

        self.create_navigation_buttons()

    def create_navigation_buttons(self):
        self.nav_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.nav_frame.pack(pady=20, anchor='center', side="bottom")
        buttons = [
            (self.get_language_sentence("donate"), "open https://www.buymeacoffee.com/nomandhoni"),
            (self.get_language_sentence("dash"), "dashboard"),
            (self.get_language_sentence("github"), "open https://github.com/nomandhoni-cs/blink-eye"),
            (self.get_language_sentence("website"), "open https://blinkeye.vercel.app")
        ]
        for i, (text, cmd) in enumerate(buttons, start=1):
            button = ctk.CTkLabel(self.nav_frame, text=text, fg_color="transparent", font=(self.FONTNAME, int(12 * self.RELATIVESIZE)), cursor='hand2')
            button.bind("<Button-1>", lambda e, b=button, c=cmd: self.redirect(b, c))
            button.pack(anchor='center', side="left", padx=80)

    def hold_the_program(self):
        for _ in range(self.SCREEN_BREAK_INTERVAL):
            time.sleep(1)

    def skip_reminder(self):
        self.fade_to_black(True)
        self.root.withdraw()
        self.skipped = True

    def toggle_sound(self):
        if not self.unmuted_sound:
            self.unmute_sound()
        elif self.unmuted_sound:
            self.mute_sound()

    def unmute_sound(self):
        self.unmuted_sound = True
        self.sound_button.configure(text=f"", image=ctk.CTkImage(Image.open(resource_path("mute icon light.png")), Image.open(resource_path("mute icon dark.png")), (13, 13)))
        volume_fade_values = self.fade_volume_sequence(True)
        for i in range(len(volume_fade_values)):
            set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
            time.sleep(0.1)
    
    def mute_sound(self):
        self.unmuted_sound = False
        self.sound_button.configure(text=f"", image=ctk.CTkImage(Image.open(resource_path("unmute icon light.png")), Image.open(resource_path("unmute icon dark.png")), (13, 13)))
        volume_fade_values = self.fade_volume_sequence()
        for i in range(len(volume_fade_values)):
            set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
            time.sleep(0.1)

    def fade_to_black(self, return_to_main: bool = False):
        if not return_to_main:
            volume_fade_values = self.fade_volume_sequence()
            if not self.ISTRANSITION:
                self.root.attributes('-alpha', 1)

            for i, alphavalue in enumerate(ALPHA_VALUES):
                if self.ISTRANSITION:
                    self.root.attributes('-alpha', alphavalue)
                if not self.unmuted_sound and isWindows:
                    set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
                time.sleep(0.1)
        else:
            for c in self.nav_frame.winfo_children()[::-1][:3]:
                c.configure(state="normal", cursor='hand2')

            volume_fade_values = self.fade_volume_sequence(True)
            values = ALPHA_VALUES.copy()
            values.reverse()
            if not self.ISTRANSITION:
                self.root.attributes('-alpha', 0)

            for i, alphavalue in enumerate(values):
                if self.ISTRANSITION:
                    self.root.attributes('-alpha', alphavalue)
                if not self.unmuted_sound and isWindows:
                    set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
                time.sleep(0.1)
            self.root.withdraw()
        
            
    def show_timer_popup(self):
        while True:
            skiiped_iter = False
            self.root.update()
            theme = get_data("betheme")
            if theme != self.THEME:
                self.THEME = theme
                ctk.set_appearance_mode(theme)

            self.root.deiconify()
            self.root.attributes("-topmost", True)
            
            current_time = datetime.now().strftime("%I:%M:%S %p")
            self.counter_label.configure(text=f"{self.constract_number(self.FOCUS_BREAK)}")
            current_time, meridian = current_time.split(" ")
            hour, minute, second = current_time.split(":")
            self.time_label.configure(text=f"{self.constract_number(hour)}:{self.constract_number(minute)}:{self.constract_number(second)} {self.get_language_sentence(meridian.lower())}")
            self.unmuted_sound = False
            if isWindows:
                self.sound_button.configure(text=f"")
                self.sound_button.pack(anchor='center', side="right", padx=5)
            self.fade_to_black()

            for i in range(self.FOCUS_BREAK - 1, 0, -1):
                if self.skipped:
                    self.skipped = False
                    skiiped_iter = True
                    break
                current_time = datetime.now().strftime("%I:%M:%S %p")
                current_time, meridian = current_time.split(" ")
                hour, minute, second = current_time.split(":")
                self.counter_label.configure(text=f"{self.constract_number(int(i))}")
                self.time_label.configure(text=f"{self.constract_number(hour)}:{self.constract_number(minute)}:{self.constract_number(second)} {self.get_language_sentence(meridian.lower())}")
                time.sleep(1)
            
            if not skiiped_iter:
                self.fade_to_black(return_to_main=True)

            self.hold_the_program()

    def redirect(self, label: ctk.CTkLabel, cmd: str):
        if cmd not in self.openned_cmds:
            if cmd.startswith("open "):
                prefix, link = cmd.split(" ", 1)
                webbrowser.open(link)
            elif cmd == "dashboard":
                open_settings(self.signal_queue)
            self.openned_cmds.append(cmd)
            label.configure(state="disabled", cursor="")

    def run(self, signal_queue: multiprocessing.Queue):
        self.signal_queue = signal_queue
        threading.Thread(target=run_icon, args=(self.signal_queue, )).start()

        if self.launched_time == 0:
            notification.notify(
                title="Blink Eye",
                message="Blink Eye has started running in the background and can be found on the system tray.",
                app_icon=resource_path("blink-eye-logo.ico"),
                timeout=3
            )

            self.hold_the_program()
            self.launched_time += 1

        threading.Thread(target=self.show_timer_popup).start()
        self.root.mainloop()

def start_notifier(signal_queue: multiprocessing.Queue):
    notifier = BlinkEyeNotifier()
    notifier.run(signal_queue)

def exit_action(icon, item, queue: multiprocessing.Queue):
    queue.put("closing notifier")
    icon.stop()
    set_data("notifier_pid", 0)
    time.sleep(0.5)
    os._exit(0)

def open_settings(queue: multiprocessing.Queue, icon=None, item=None):
    queue.put("open dash")

def run_icon(queue: multiprocessing.Queue):
    image = Image.open(resource_path(relative_path='blink-eye-logo.png'))
    icon = pystray.Icon(
        "name", 
        image, 
        "Blink Eye", 
        menu=pystray.Menu(
            pystray.MenuItem("Settings", lambda i, item: open_settings(queue, i, item), default=True),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem('Exit', lambda i, item: exit_action(i, item, queue))
            )
    )

    icon.run()