import customtkinter as ctk
import threading
import time
from plyer import notification
import webbrowser
import sys
import os
from datetime import datetime
import pystray
from pystray import MenuItem as item
from PIL import Image
from ctypes import cast, POINTER
import comtypes
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

ctk.set_appearance_mode("system")

ALPHA_VALUES = [i / 10 for i in range(11)]
BREAK_INTERVAL = 1200 # 20 Minutes


def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS2
    except Exception:
        dirlist = os.listdir(os.path.abspath("."))
        if "Assets" in dirlist:
            base_path = os.path.abspath("./Assets")
        elif "application" in dirlist:
            base_path = os.path.abspath("./application/Assets")
    return os.path.join(base_path, relative_path)


class BlinkEyeApp:
    def __init__(self):
        self.root = ctk.CTk()
        self.launched_time = 0
        self.skipped = False
        self.openned_links = []
        self.original_volume = 0.0
        self.setup_window()

    def get_volume(self) -> float:
        comtypes.CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
        return volume_interface.GetMasterVolumeLevelScalar()

    def set_volume(self, volume) -> None:
        if volume is None:
            return
        comtypes.CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
        volume_interface.SetMasterVolumeLevelScalar(volume, None)
        return None
        
    def fade_volume_sequence(self, restore: bool=False):
        if restore:
            volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
            self.original_volume = 0.0
            return volume_fade_values
        else:
            self.original_volume = self.get_volume()
            volume_fade_values = [i / 10 for i in range(int((self.original_volume + 0.1) * 10))]
            return volume_fade_values[::-1]
        
    def setup_window(self):
        self.root.title("Blink Eye")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')
        self.root.attributes('-alpha', 0.0)
        self.root.iconbitmap(resource_path("blink-eye-logo.ico"))
        self.load_images()
        self.create_widgets()

    def load_images(self):
        self.logo_image = ctk.CTkImage(Image.open(resource_path("blink-eye-logo.png")), Image.open(resource_path("blink-eye-logo.png")))
        self.button_image = ctk.CTkImage(Image.open(resource_path("blink-eye-reminder-btn.png")), Image.open(resource_path("blink-eye-reminder-btn.png")), (155, 38))

    def create_widgets(self):
        self.counter_label = ctk.CTkLabel(self.root, text="", font=("Segoe UI", 160))
        self.counter_label.place(relx=0.5, rely=0.4, anchor='center')

        self.time_label = ctk.CTkLabel(self.root, text="", font=("Segoe UI", 24))
        self.time_label.place(relx=0.5, rely=0.6, anchor='center')

        self.look_away_msg = ctk.CTkLabel(self.root, text="Look 20 feet far away to protect your eyes", font=("Segoe UI", 32))
        self.look_away_msg.place(relx=0.5, rely=0.7, anchor='center')

        self.skip_button = ctk.CTkButton(self.root, text="Skip this time", command=self.skip_reminder, text_color=('gray10', '#DCE4EE'), compound='right', fg_color=("#fb4e54", "#fb4e54"), font=("Helvetica", 18), image=ctk.CTkImage(Image.open(resource_path("skip icon light.png")), Image.open(resource_path("skip icon dark.png")), (25, 25)), height=32, width=180, hover_color=("#a42621", "#a42621"), corner_radius=50)
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
        for _ in range(BREAK_INTERVAL):
            time.sleep(1)

    def skip_reminder(self):
        self.fade_to_black(True)
        self.skipped = True

    def fade_to_black(self, return_to_main: bool = False):
        if not return_to_main:
            volume_fade_values = self.fade_volume_sequence()
            for i, alphavalue in enumerate(ALPHA_VALUES):
                self.root.attributes('-alpha', alphavalue)
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
            self.counter_label.configure(text="20s")
            self.time_label.configure(text=current_time)
            self.fade_to_black()

            for i in range(19, 0, -1):
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
        if self.launched_time == 0:
            notification.notify(
                title="Blink Eye",
                message="Your program has started running.",
                app_icon=resource_path("blink-eye-logo.ico"),
                timeout=3
            )
            # Wait for 20 minutes before showing the first popup
            self.hold_the_program()
            self.launched_time += 1
        threading.Thread(target=self.show_timer_popup).start()
        self.root.mainloop()

def exit_action(icon, item):
    icon.stop()
    os._exit(0)

def run_icon():
    image = Image.open(resource_path(relative_path='blink-eye-logo.png'))
    icon = pystray.Icon("name", image, "Blink Eye", menu=pystray.Menu(item('Exit', exit_action)))
    icon.run()

if __name__ == "__main__":
    threading.Thread(target=run_icon).start()
    try:
        eye_care_app = BlinkEyeApp()
        eye_care_app.run()
    except KeyboardInterrupt:
        pass
