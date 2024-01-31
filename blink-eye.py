import tkinter as tk
import threading
import time
from tkinter import PhotoImage
import webbrowser
import sys
import os

# Global variable to track if the program has just been launched
launchedTime = 0

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS2
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

class BlinkEyeApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Blink Eye")
        self.root.attributes("-fullscreen", True)
        self.root.configure(bg='black')

        icon_path = resource_path("logo.png")
        window_icon = PhotoImage(file=icon_path)
        self.root.iconphoto(True, window_icon)

        logo_path = resource_path("logo.png")
        self.logo_image = PhotoImage(file=logo_path)

        button_image_path = resource_path("reminder-btn.png")
        self.button_image = PhotoImage(file=button_image_path)

        self.counter_label = tk.Label(self.root, text="", font=("Helvetica", 96), fg='white', bg='black')
        self.counter_label.place(relx=0.5, rely=0.4, anchor='center')

        self.quote_label = tk.Label(self.root, text="Look 20 feet far away to protect your eyes", font=("Helvetica", 16), fg='white', bg='black')
        self.quote_label.place(relx=0.5, rely=0.8, anchor='center')

        self.skip_button = tk.Button(self.root, image=self.button_image, command=self.skip_reminder, cursor='hand2', borderwidth=0, highlightthickness=0, relief=tk.FLAT, activebackground='black', activeforeground='black')
        self.skip_button.place(relx=0.5, rely=0.9, anchor='center')

        self.donate_button = tk.Button(self.root, text="Donate", font=("Helvetica", 12), fg='white', bg='black', bd=0, cursor='hand2', command=lambda: self.open_link("https://www.buymeacoffee.com/nomandhoni"))
        self.donate_button.place(relx=0.45, rely=0.95, anchor='center')

        self.github_button = tk.Button(self.root, text="Github", font=("Helvetica", 12), fg='white', bg='black', bd=0, cursor='hand2', command=lambda: self.open_link("https://github.com/nomandhoni-cs/blink-eye"))
        self.github_button.place(relx=0.50, rely=0.95, anchor='center')

        self.website_button = tk.Button(self.root, text="Website", font=("Helvetica", 12), fg='white', bg='black', bd=0, cursor='hand2', command=lambda: self.open_link("https://blinkeye.vercel.app"))
        self.website_button.place(relx=0.55, rely=0.95, anchor='center')

    def skip_reminder(self):
        self.root.withdraw()

    def show_timer_popup(self):
        while True:
            self.root.deiconify()
            self.root.attributes("-topmost", True)

            for i in range(20, -1, -1):
                self.counter_label.config(text=str(i) + "s")
                time.sleep(1)

            self.root.withdraw()
            # Wait for 20 minutes before showing the next popup
            time.sleep(1200)

    def open_link(self, link):
        webbrowser.open(link)

    def run(self):
        global launchedTime
        if launchedTime == 0:
            # Wait for 20 minutes before showing the first popup
            time.sleep(1200)
            launchedTime += 1
        threading.Thread(target=self.show_timer_popup).start()
        self.root.mainloop()

if __name__ == "__main__":
    eye_care_app = BlinkEyeApp()
    eye_care_app.run()