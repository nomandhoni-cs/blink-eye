import tkinter as tk
import threading
import time
from tkinter import PhotoImage
from plyer import notification
import webbrowser
import sys
import os
from datetime import datetime
import pystray
from pystray import MenuItem as item
from PIL import Image

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
        self.root = tk.Tk()
        self.launched_time = 0
        self.setup_window()

    def setup_window(self):
        self.root.title("Blink Eye")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')
        self.root.attributes('-alpha', 0.0)
        self.load_images()
        self.create_widgets()

    def load_images(self):
        self.logo_image = tk.PhotoImage(file=resource_path("blink-eye-logo.png"))
        self.button_image = tk.PhotoImage(file=resource_path("blink-eye-reminder-btn.png"))

    def create_widgets(self):
        self.counter_label = tk.Label(self.root, text="", font=("Helvetica", 160), fg='white', bg='black')
        self.counter_label.place(relx=0.5, rely=0.4, anchor='center')

        self.time_label = tk.Label(self.root, text="", font=("Helvetica", 24), fg='white', bg='black')
        self.time_label.place(relx=0.5, rely=0.7, anchor='center')

        self.quote_label = tk.Label(self.root, text="Look 20 feet far away to protect your eyes", font=("Helvetica", 32), fg='white', bg='black')
        self.quote_label.place(relx=0.5, rely=0.8, anchor='center')

        self.skip_button = tk.Button(self.root, image=self.button_image, command=self.skip_reminder, cursor='hand2', borderwidth=0, highlightthickness=0, relief=tk.FLAT, activebackground='black', activeforeground='black')
        self.skip_button.place(relx=0.5, rely=0.9, anchor='center')

        self.create_navigation_buttons()

    def create_navigation_buttons(self):
        buttons = [
            ("Donate", "https://www.buymeacoffee.com/nomandhoni"),
            ("Github", "https://github.com/nomandhoni-cs/blink-eye"),
            ("Website", "https://blinkeye.vercel.app")
        ]
        for i, (text, link) in enumerate(buttons, start=1):
            button = tk.Button(self.root, text=text, font=("Helvetica", 12), fg='white', bg='black', bd=0, cursor='hand2', command=lambda l=link: self.open_link(l))
            button.place(relx=0.4 + 0.05 * i, rely=0.95, anchor='center')

    def skip_reminder(self):
        self.root.withdraw()

    def fade_to_black(self, return_to_main: bool = False):
        if not return_to_main:
            for alphavalue in [i / 10 for i in range(11)]:
                self.root.attributes('-alpha', alphavalue)
                time.sleep(0.1)
        else:
            values = [i / 10 for i in range(11)]
            values.reverse()
            for alphavalue in values:
                self.root.attributes('-alpha', alphavalue)
                time.sleep(0.1)
            self.root.withdraw()
            
    def show_timer_popup(self):
        while True:
            self.root.deiconify()
            self.root.attributes("-topmost", True)
            
            current_time = datetime.now().strftime("%I:%M:%S %p")
            self.counter_label.config(text="20s")
            self.time_label.config(text=current_time)
            self.fade_to_black()

            for i in range(19, 0, -1):
                current_time = datetime.now().strftime("%I:%M:%S %p")
                self.counter_label.config(text=str(i) + "s")
                self.time_label.config(text=current_time)
                time.sleep(1)

            self.fade_to_black(return_to_main=True)
            # Wait for 20 minutes before showing the next popup
            time.sleep(1200)

    def open_link(self, link):
        webbrowser.open(link)

    def run(self):
        if self.launched_time == 0:
            notification.notify(
                title="Blink Eye",
                message="Your program has started running.",
                app_icon=resource_path("blink-eye-logo.ico"),
                timeout=3
            )
            # Wait for 20 minutes before showing the first popup
            time.sleep(1200)
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
