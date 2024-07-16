import customtkinter as ctk
import threading
import time
import webbrowser
import sys
import winotify
import os
from datetime import datetime
import pystray
from pystray import MenuItem as item
from PIL import Image
import platform
import json
import multiprocessing

isWindows = False
if platform.system().lower() == "windows":
    isWindows = True
    from ctypes import cast, POINTER
    import comtypes
    from comtypes import CLSCTX_ALL
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

ctk.set_appearance_mode("system")

ALPHA_VALUES = [i / 10 for i in range(11)]

def resource_path(relative_path, data: bool = False):
    try:
        base_path = sys._MEIPASS2
    except Exception:
        dirlist = os.listdir(os.path.abspath("."))
        if data:
            if "data" in dirlist:
                base_path = os.path.abspath("./data")
            elif "application" in dirlist:
                base_path = os.path.abspath("./application/data")
            return os.path.join(base_path, relative_path)
            
        if "Assets" in dirlist:
            base_path = os.path.abspath("./Assets")
        elif "application" in dirlist:
            base_path = os.path.abspath("./application/Assets")
    return os.path.join(base_path, relative_path)

def get_data(key: str):
    with open(resource_path("data.json", data=True), 'r') as f:
        data = json.load(f)
    return data[key]

def set_data(key: str, value: str):
    with open(resource_path("data.json", data=True), 'r') as f:
        data = json.load(f)
    
    data[key] = value

    with open(resource_path("data.json", data=True), 'w') as f:
        json.dump(data, f, indent=4)

ctk.FontManager.load_font(resource_path("Noto Sans.ttf"))
ctk.FontManager.load_font(resource_path("Consolas.ttf"))

open_dash = threading.Condition()

class BlinkEyeNotifier:
    def __init__(self):
        self.root = ctk.CTk()
        self.launched_time = 0
        self.skipped = False
        self.openned_links = []
        self.original_volume = 0.0
        self.unmuted_sound = False
        self.setup_window()
        # self.off = False if get_data("status") == 'on' else True
        self.SCREEN_BREAK_INTERVAL = int(get_data("sbi"))
        self.FOCUS_BREAK = int(get_data("fb"))
        
    def get_volume(self) -> float:
        if isWindows:
            comtypes.CoInitialize()
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(
                IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
            return volume_interface.GetMasterVolumeLevelScalar()
        else:
            return None

    def set_volume(self, volume) -> None:
        if isWindows:
            if volume is None:
                return
            comtypes.CoInitialize()
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(
                IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
            volume_interface.SetMasterVolumeLevelScalar(volume, None)
            return None
        else:
            return None
        
    def fade_volume_sequence(self, restore: bool=False):
        if isWindows:
            if restore:
                volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
                self.original_volume = 0.0
                return volume_fade_values
            else:
                self.original_volume = self.get_volume()
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
            sys.exit(0)
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
            self.set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
            time.sleep(0.1)
    
    def mute_sound(self):
        self.unmuted_sound = False
        self.sound_button.configure(text=f"", image=ctk.CTkImage(Image.open(resource_path("unmute icon light.png")), Image.open(resource_path("unmute icon dark.png")), (13, 13)))
        volume_fade_values = self.fade_volume_sequence()
        for i in range(len(volume_fade_values)):
            self.set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
            time.sleep(0.1)

    def fade_to_black(self, return_to_main: bool = False):
        if not return_to_main:
            volume_fade_values = self.fade_volume_sequence()
            for i, alphavalue in enumerate(ALPHA_VALUES):
                self.root.attributes('-alpha', alphavalue)
                if not self.unmuted_sound:
                    self.set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
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
                    self.set_volume(volume_fade_values[i] if len(volume_fade_values) >= i + 1 else None)
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

    def run(self):
        threading.Thread(target=run_icon).start()

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

notifier = None
def start_notifier():
    global notifier

    notifier = BlinkEyeNotifier()
    notifier.run()

class BlinkEyeDashboard:
    def __init__(self) -> None:
        if get_data('status') == "on":
            self.start_notifier_process()
        self.root = ctk.CTk()
        self.root.title("Blink Eye")
        self.root.iconbitmap(resource_path("blink-eye-logo.ico"))
        self.root.geometry("700x400")
        self.create()

    def start_notifier_process(self):
        self.notifier_process = multiprocessing.Process(target=start_notifier)
        self.notifier_process.start()

    def validate_int(self, new_value):
        if new_value.isdigit() or new_value == "":
            return True
        return False

    def update_data(self, data):
        with open(resource_path("data.json", True), 'r') as f:
            old_data = json.load(f)

        if data != old_data:
            with open(resource_path("data.json", True), 'w') as f:
                json.dump(data, f, indent=4)

            self.save_button.configure(text="Saving...")
            self.save_button.configure(state="disabled")
            self.notifier_process.terminate()
            time.sleep(1)
            self.start_notifier_process()
            self.save_button.configure(text="Save", state="normal", width=40, height=25)

    def gather_data(self):
        """
        Gathers all data from all different inputs
        """
        prepared_data = {}
        data = self.data_objects
        for key in data:
            if data[key]['obj'] == ctk.CTkSwitch:
                prepared_data['status'] = data[key]['data_var'].get()
            d = data[key]['obj'].get()
            if d == "" or d == "0":
                data[key]['obj'].delete(0, 'end')
                if key == 'sbi':
                    d = "1200"
                    data[key]['obj'].insert(0, "20")
                elif key == "fb":
                    d = "20"
                    data[key]['obj'].insert(0, "20")
            prepared_data[key] = d
        self.update_data(prepared_data)

    def create(self):
        self.logo_label = ctk.CTkLabel(self.root, text="Blink Eye", font=("Noto Sans", 30, "bold"))
        self.logo_label.pack(pady=5, anchor='center')

        self.main_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.main_frame.pack(pady=10, padx=5, anchor='center', fill=ctk.BOTH, expand=True)
        
        self.data_objects = {
            "status": {
                "name": "Status",
                "obj": None,
                "data_var": None
            },
            "sbi": {
                "name": "Screen Break Interval",
                "obj": None
            },
            "fb": {
                "name": "Focus Break",
                "obj": None
            }
        }

        # ========== Frame: 1 (Status) ==========
        def switch_event(boot: bool=False):
            switch.configure(text="  ON" if switch_var.get() == "on" else "  OFF", text_color="#008000" if switch_var.get() == "on" else "#ff0000")
            if switch_var.get() != get_data('status'):
                if switch_var.get() == "off":
                    for frame in self.main_frame.winfo_children()[1:]:
                        for c in frame.winfo_children():
                            c.configure(state="disabled")
                    self.save_button.configure(cursor='arrow', hover=False)
                    self.notifier_process.terminate()
                else:
                    for frame in self.main_frame.winfo_children()[1:]:
                        for c in frame.winfo_children():
                            c.configure(state="normal")
                    self.save_button.configure(cursor='hand2', hover=True)
                    self.start_notifier_process()
                set_data("status", switch_var.get())
            if boot:
                if get_data('status') == "off":
                    for frame in self.main_frame.winfo_children()[1:]:
                        for c in frame.winfo_children():
                            c.configure(state="disabled")
                    self.save_button.configure(cursor='arrow', hover=False)
                else:
                    for frame in self.main_frame.winfo_children()[1:]:
                        for c in frame.winfo_children():
                            c.configure(state="normal")
                    self.save_button.configure(cursor='hand2', hover=True)

        f1 = ctk.CTkFrame(self.main_frame)
        f1.pack(pady=1.25, anchor='center', fill=ctk.X)
        f1.grid_rowconfigure(0, weight=1)
        f1.grid_columnconfigure(0, weight=0)
        f1.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(f1, text="Enable Blink Eye", anchor="w", font=("Noto Sans", 13)).grid(row=0, column=0, sticky="e", pady=2.5, padx=10)

        switch_var = ctk.StringVar(f1, value=get_data('status'))
        switch = ctk.CTkSwitch(f1, text="  ON" if switch_var.get() == "on" else "  OFF", text_color="#008000" if switch_var.get() == "on" else "#ff0000", variable=switch_var, command=switch_event, onvalue="on", offvalue="off", font=("Noto Sans", 13))
        switch.grid(row=0, column=1, sticky="e", pady=2.5)
        self.data_objects['status']['obj'] = switch
        self.data_objects['status']['data_var'] = switch_var

        # ========== Frame: 2 (Screen Break Interval) ==========
        f2 = ctk.CTkFrame(self.main_frame)
        f2.pack(pady=1.25, anchor='center', fill=ctk.X)

        ctk.CTkLabel(f2, text="Screen Break Interval", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="e", side='left')
        sbi_var = ctk.StringVar(f2, value=get_data("sbi"))
        ctk.CTkLabel(f2, text="minutes", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f2, font=("Noto Sans", 13), width=50, height=8, textvariable=sbi_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['sbi']['obj'] = sentry

        # ========== Frame: 3 (Focus Break) ==========
        f3 = ctk.CTkFrame(self.main_frame)
        f3.pack(pady=1.25, anchor='center', fill=ctk.X)

        ctk.CTkLabel(f3, text="Focus Break", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="e", side='left')
        fb_var = ctk.StringVar(f3, value=get_data("fb"))
        ctk.CTkLabel(f3, text="seconds", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f3, font=("Noto Sans", 13), width=50, height=8, textvariable=fb_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['fb']['obj'] = sentry

        self.save_button = ctk.CTkButton(self.main_frame, text="Save", width=40, height=25, font=("Noto Sans", 13), command=lambda: threading.Thread(target=self.gather_data, daemon=True).start())
        self.save_button.pack(anchor="se", pady=5, padx=5, side="bottom")
        switch_event(True)


    def run(self):
        self.root.mainloop()

def exit_action(icon, item):
    icon.stop()
    os._exit(0)

def open_settings(icon, item):
    with open_dash:
        open_dash.notify()

icon = None
def run_icon():
    global icon

    image = Image.open(resource_path(relative_path='blink-eye-logo.png'))
    icon = pystray.Icon(
        "name", 
        image, 
        "Blink Eye", 
        menu=pystray.Menu(
            item("Settings", open_settings, default=True),
            pystray.Menu.SEPARATOR,
            item('Exit', exit_action)
            )
    )

    icon.run()

if __name__ == "__main__":
    try:
        dashboard = BlinkEyeDashboard()
        dashboard.run()
    except KeyboardInterrupt:
        pass
