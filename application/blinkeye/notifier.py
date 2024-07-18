import threading
import time
import webbrowser
import winotify
import os
from datetime import datetime
import customtkinter as ctk
import multiprocessing
import pystray
from PIL import Image

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
        self.openned_links = []
        self.original_volume = 0.0
        self.unmuted_sound = False
        self.setup_window()
        self.SCREEN_BREAK_INTERVAL = int(get_data("sbi"))
        self.FOCUS_BREAK = int(get_data("fb"))
        
       
    def fade_volume_sequence(self, restore: bool=False):
        if isWindows:
            if restore:
                volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
                self.original_volume = 0.0
                return volume_fade_values
            else:
                self.original_volume = get_volume()
                volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
                return volume_fade_values[::-1]
        else:
            return []
        
    def setup_window(self):
        self.root.title("Blink Eye")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')
        self.root.attributes('-alpha', 0.0)
        self.root.overrideredirect(True)
        self.create_widgets()

    def create_widgets(self):
        self.logo_label = ctk.CTkLabel(self.root, text="  Blink Eye", image=ctk.CTkImage(Image.open(resource_path("blink-eye-logo.png")), Image.open(resource_path("blink-eye-logo.png")), (30, 30)), compound="left", font=("Noto Sans", 20, "bold"))
        self.logo_label.place(relx=0.93, rely=0.05, anchor='center')

        self.counter_label = ctk.CTkLabel(self.root, text="", font=("Noto Sans", 160))
        self.counter_label.place(relx=0.5, rely=0.4, anchor='center')

        self.time_label = ctk.CTkLabel(self.root, text="", font=("Noto Sans", 24))
        self.time_label.place(relx=0.5, rely=0.6, anchor='center')

        self.look_away_msg = ctk.CTkLabel(self.root, text="Look 20 feet far away to protect your eyes", font=("Noto Sans", 32))
        self.look_away_msg.place(relx=0.5, rely=0.7, anchor='center')

        self.skip_button = ctk.CTkButton(self.root, text="Skip this time", command=self.skip_reminder, text_color=('gray10', '#DCE4EE'), compound='right', fg_color=("#FE4C55", "#FE4C55"), font=("Noto Sans", 18), image=ctk.CTkImage(Image.open(resource_path("skip icon light.png")), Image.open(resource_path("skip icon dark.png")), (13, 13)), height=32, hover_color=("#dc4c56", "#dc4c56"), corner_radius=50)
        
        if isWindows:
            self.skip_button.place(relx=0.45, rely=0.8, anchor='center')

            self.sound_button = ctk.CTkButton(self.root, text=f"", width=10, command=self.toggle_sound, text_color=('gray10', '#DCE4EE'), compound='right', fg_color=("#FE4C55", "#FE4C55"), font=("Noto Sans", 18), image=ctk.CTkImage(Image.open(resource_path("unmute icon light.png")), Image.open(resource_path("unmute icon dark.png")), (13, 13)), height=32, hover_color=("#dc4c56", "#dc4c56"), corner_radius=100)
        else:
            self.skip_button.place(relx=0.5, rely=0.8, anchor='center')

        self.create_navigation_buttons()

    def create_navigation_buttons(self):
        buttons = [
            ("Donate", "https://www.buymeacoffee.com/nomandhoni"),
            ("Github", "https://github.com/nomandhoni-cs/blink-eye"),
            ("Website", "https://blinkeye.vercel.app")
        ]
        for i, (text, link) in enumerate(buttons, start=1):
            button = ctk.CTkLabel(self.root, text=text, fg_color="transparent", width=100, font=("Consolas", 12), cursor='hand2')
            button.bind("<Button-1>", lambda e, b=button, l=link: self.open_link(b, l))
            button.place(relx=0.15 + 0.17 * i, rely=0.95, anchor='center')

    def hold_the_program(self):
        for _ in range(self.SCREEN_BREAK_INTERVAL):
            time.sleep(1)

    def skip_reminder(self):
        self.fade_to_black(True)
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
            for i, alphavalue in enumerate(ALPHA_VALUES):
                self.root.attributes('-alpha', alphavalue)
                if not self.unmuted_sound:
                    set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
                time.sleep(0.1)
        else:
            for c in self.root.winfo_children()[::-1][:3]:
                c.configure(text=c.cget('text').replace(' (Opened)', ''), cursor='hand2')

            volume_fade_values = self.fade_volume_sequence(True)
            values = ALPHA_VALUES.copy()
            values.reverse()
            for i, alphavalue in enumerate(values):
                self.root.attributes('-alpha', alphavalue)
                if not self.unmuted_sound:
                    set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
                time.sleep(0.1)

            self.root.withdraw()
            
    def show_timer_popup(self):
        while True:
            skiiped_iter = False
            self.root.update()

            self.root.deiconify()
            self.root.attributes("-topmost", True)
            
            current_time = datetime.now().strftime("%I:%M:%S %p")
            self.counter_label.configure(text=f"{self.FOCUS_BREAK}s")
            self.time_label.configure(text=current_time)
            self.unmuted_sound = False
            if isWindows:
                self.sound_button.configure(text=f"")
                self.sound_button.place(relx=0.54, rely=0.8, anchor='center')
            self.fade_to_black()

            for i in range(self.FOCUS_BREAK - 1, 0, -1):
                if self.skipped:
                    self.skipped = False
                    skiiped_iter = True
                    break
                current_time = datetime.now().strftime("%I:%M:%S %p")
                self.counter_label.configure(text=str(i) + "s")
                self.time_label.configure(text=current_time)
                time.sleep(1)
            
            if not skiiped_iter:
                self.fade_to_black(return_to_main=True)
            self.hold_the_program()

    def open_link(self, label: ctk.CTkLabel, link: str):
        if link not in self.openned_links:
            webbrowser.open(link)
            label.configure(text=f"{label.cget('text')} (Opened)", cursor="")

    def run(self, signal_queue: multiprocessing.Queue):
        threading.Thread(target=run_icon, args=(signal_queue, )).start()

        if self.launched_time == 0:
            toast = winotify.Notification(app_id="Blink Eye",
                    title="Blink Eye",
                    msg="Blink Eye has started running in the background and can be found on the system tray.",
                    icon=resource_path("blink-eye-logo.ico"),
                    duration="short")
            toast.set_audio(winotify.audio.Default, loop=False)
            toast.show()

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

def open_settings(icon, item, queue: multiprocessing.Queue):
    queue.put("open dash")

def run_icon(queue: multiprocessing.Queue):
    image = Image.open(resource_path(relative_path='blink-eye-logo.png'))
    icon = pystray.Icon(
        "name", 
        image, 
        "Blink Eye", 
        menu=pystray.Menu(
            pystray.MenuItem("Settings", lambda i, item: open_settings(i, item, queue), default=True),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem('Exit', lambda i, item: exit_action(i, item, queue))
            )
    )

    icon.run()