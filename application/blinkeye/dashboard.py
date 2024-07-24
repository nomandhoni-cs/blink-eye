import threading
import time
import sys
import json
import multiprocessing
import customtkinter as ctk
import tkinter.messagebox
from PIL import Image
import os
import signal
try:
    from blinkeye.utils import resource_path, get_data, set_data
    from blinkeye.notifier import start_notifier
except ModuleNotFoundError as e:
    # Handle error caused by an attempt to run the file independently
    if str(e) == "No module named 'blinkeye'":
        raise Exception("\033[93mPlease run the application from 'main.py' and use 'import blinkeye.dashboard' to access the attributes and functions\033[0m")
    
class BlinkEyeDashboard:
    def __init__(self) -> None:
        self.safe_init()

    def safe_init(self):
        self.signal_queue = multiprocessing.Queue()
        self.root = ctk.CTk()
        self.root.title("Blink Eye")
        self.root.iconbitmap(resource_path("blink-eye-logo.ico"))
        self.root.geometry(f"700x400+{int(self.root.winfo_screenwidth()/2 - 700/2)}+{int(self.root.winfo_screenheight()/2 - 400/2) - 50}")
        if get_data('status') == "on":
            self.root.withdraw()
        threading.Thread(target=self.check_queue, daemon=True).start()
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.minsize(700, 400)
        self.load_language_pack()
        self.create()

    def available_languages(self):
        with open(resource_path("configuration.json", True), 'r', encoding="utf-8") as f:
            data = json.load(f)

        return data['languages']
    
    def load_language_pack(self):
        with open(resource_path("configuration.json", True), 'r', encoding="utf-8") as f:
            data = json.load(f)
        
        language = str(get_data("lang")).lower()
        ctk.FontManager.load_font(resource_path(data['font'][language]['filename'], font=True))
        self.FONTNAME = data['font'][language]['fontname']
        self.RELATIVESIZE = data['font'][language]['relsize']
        data = data['dashboard']
        self.LANGUAGE_DATA = {}
        for key in data:
            self.LANGUAGE_DATA[key] = data[key][language]
        return None
    
    def get_language_sentence(self, key: str):
        return self.LANGUAGE_DATA[key]
    
    def reload_dashboard(self):
        for c in self.root.winfo_children():
            c.destroy()
        self.load_language_pack()
        self.create()
    
    def on_close(self):
        if get_data('status') == 'on' and get_data('notifier_pid') != 0:
            if not self.is_updated(self.gather_data()):
                self.root.withdraw()
            else:
                if tkinter.messagebox.askyesno("Unsaved modifications", "Do you want to save the modifications?"):
                    self.update_data()
                self.root.withdraw()
        else:
            self.root.destroy()
            self.root.quit()
            sys.exit(0)

    def check_queue(self):
        while True:
            if not self.signal_queue.empty():
                msg = self.signal_queue.get()
                if msg == "open dash":
                    self.refresh_data()
                    self.root.geometry(f"700x400+{int(self.root.winfo_screenwidth()/2 - 700/2)}+{int(self.root.winfo_screenheight()/2 - 400/2) - 50}")
                    self.root.deiconify()
                elif msg == "closing notifier":
                    if self.root.winfo_viewable() == 0:
                        self.on_close()

            time.sleep(0.5)

    def start_notifier_process(self):
        self.notifier_process = multiprocessing.Process(target=start_notifier, args=(self.signal_queue, ), daemon=True)
        self.notifier_process.start()
        set_data('notifier_pid', self.notifier_process.pid)

    def kill_notifier_process(self):
        try:
            os.kill(get_data("notifier_pid"), signal.SIGTERM)
        except OSError:
            pass
        set_data("notifier_pid", 0)

    def validate_int(self, new_value):
        if new_value.isdigit() or new_value == "":
            return True
        return False

    def is_updated(self, data):
        with open(resource_path("data.json", True), 'r', encoding="utf-8") as f:
            old_data = json.load(f)

        if data != old_data:
            return True
        return False
    
    def update_data(self):
        data = self.gather_data()
        if self.is_updated(data):
            old_lang = get_data("lang")
            with open(resource_path("data.json", True), 'w', encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

            if data['lang'] != old_lang:
                self.reload_dashboard()
            self.save_button.configure(text=f"{self.get_language_sentence('save')}...")
            self.save_button.configure(state="disabled")
            self.kill_notifier_process()
            time.sleep(1)
            self.start_notifier_process()
            self.save_button.configure(text=self.get_language_sentence("save"), state="normal", width=40, height=25)
            self.root.focus_force()

    def gather_data(self):
        """
        Gathers all data from all different inputs
        """
        prepared_data = {}
        data = self.data_objects
        for key in data:
            if isinstance(data[key]['obj'][0], ctk.CTkSwitch):
                prepared_data[key] = data[key]['datavar'].get()
                continue
            if isinstance(data[key]['obj'][0], ctk.CTkRadioButton):
                prepared_data[key] = data[key]['datavar'].get()
                continue
            d = data[key]['obj'][0].get()
            if d == "" or d == "0":
                data[key]['obj'][0].delete(0, 'end')
                if key == 'sbi':
                    d = "1200"
                    data[key]['obj'][0].insert(0, "20")
                elif key == "fb":
                    d = "20"
                    data[key]['obj'][0].insert(0, "20")
            if key == 'sbi':
                d = str(int(d) * 60)
            prepared_data[key] = d
        prepared_data['notifier_pid'] = get_data("notifier_pid")
        return prepared_data

    def refresh_data(self):
        temp_dict = self.data_objects.copy()
        temp_dict.pop('status')
        for key in temp_dict:
            if key == "sbi":
                d = str(int(get_data(key)) / 60 if int(get_data(key)) % 60 != 0 else int(int(get_data(key)) / 60))
                temp_dict[key]['datavar'].set(d)
            else:
                d = get_data(key)
                temp_dict[key]['datavar'].set(d)
            if isinstance(temp_dict[key]['obj'][0], ctk.CTkEntry):
                temp_dict[key]['obj'][0].delete(0, 'end')
                temp_dict[key]['obj'][0].insert(0, d)
        
    def change_theme(self):
        if self.data_objects['betheme']['datavar'].get() != get_data("betheme"):
            ctk.set_appearance_mode(self.data_objects['betheme']['datavar'].get())
            set_data("betheme", self.data_objects['betheme']['datavar'].get())

    def create(self):
        self.logo_label = ctk.CTkLabel(self.root, text="  Blink Eye", image=ctk.CTkImage(Image.open(resource_path("blink-eye-logo.png")), Image.open(resource_path("blink-eye-logo.png")), (30, 30)), compound='left', font=("Noto Sans", 30, "bold"))
        self.logo_label.pack(pady=5, anchor='center')

        self.main_frame = ctk.CTkScrollableFrame(self.root, fg_color="transparent")
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
            },
            "fbsft": {
                "name": "Focus Break Screen Fade Transition",
                "obj": None
            },
            "betheme": {
                "name": "Blink Eye Theme",
                "obj": None
            }
            ,
            "lang": {
                "name": "Language",
                "obj": None
            }
        }

        # ========== Frame: 1 (Status) ==========
        def status_switch_event(boot: bool=False):
            switch_var = self.data_objects['status']['datavar']
            switch.configure(text=f"  {self.get_language_sentence('on')}" if switch_var.get() == "on" else f"  {self.get_language_sentence('off')}", text_color="#008000" if switch_var.get() == "on" else "#ff0000")
            if switch_var.get() != get_data('status'):
                if switch_var.get() == "off":
                    for frame in self.main_frame.winfo_children()[1:]:
                        if frame == ctk.CTkFrame:
                            for c in frame.winfo_children():
                                c.configure(state="disabled")
                    self.save_button.configure(cursor='arrow', hover=False)
                    self.kill_notifier_process()
                else:
                    for frame in self.main_frame.winfo_children()[1:]:
                        if frame == ctk.CTkFrame:
                            for c in frame.winfo_children():
                                c.configure(state="normal")
                    self.save_button.configure(cursor='hand2', hover=True)
                    self.start_notifier_process()
                set_data("status", switch_var.get())
            if boot:
                if get_data('status') == "off":
                    for frame in self.main_frame.winfo_children()[1:]:
                        if frame == ctk.CTkFrame:
                            for c in frame.winfo_children():
                                c.configure(state="disabled")
                    self.save_button.configure(cursor='arrow', hover=False)
                else:
                    for frame in self.main_frame.winfo_children()[1:]:
                        if frame == ctk.CTkFrame:
                            for c in frame.winfo_children():
                                c.configure(state="normal")
                    self.save_button.configure(cursor='hand2', hover=True)

        f1 = ctk.CTkFrame(self.main_frame)
        f1.pack(pady=1.25, anchor='center', fill=ctk.X)
        f1.grid_rowconfigure(0, weight=1)
        f1.grid_columnconfigure(0, weight=0)
        f1.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(f1, text=self.get_language_sentence("ebe"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).grid(row=0, column=0, sticky="e", pady=2.5, padx=10)

        switch_var = ctk.StringVar(f1, value=get_data('status'))
        switch = ctk.CTkSwitch(f1, text=f"  {self.get_language_sentence('on')}" if switch_var.get() == "on" else f"  {self.get_language_sentence('off')}", text_color="#008000" if switch_var.get() == "on" else "#ff0000", variable=switch_var, command=status_switch_event, onvalue="on", offvalue="off", font=(self.FONTNAME, float(13 * self.RELATIVESIZE)))
        switch.grid(row=0, column=1, sticky="e", pady=2.5)
        self.data_objects['status']['obj'] = [switch]
        self.data_objects['status']['datavar'] = switch_var

        # ========== Title: Time ==========
        ctk.CTkLabel(self.main_frame, text=self.get_language_sentence("timings"), font=(self.FONTNAME, float(16 * self.RELATIVESIZE), "bold")).pack(pady=3, anchor="nw")
        
        # ========== Frame: 2 (Screen Break Interval) ==========
        f2 = ctk.CTkFrame(self.main_frame)
        f2.pack(pady=1.25, anchor='center', fill=ctk.X)

        ctk.CTkLabel(f2, text=self.get_language_sentence("sbi"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).pack(padx=10, pady=1.25, anchor="e", side='left')
        sbi_var = ctk.StringVar(f2, value=str(int(get_data("sbi")) / 60 if int(get_data("sbi")) % 60 != 0 else int(int(get_data("sbi")) / 60)))
        ctk.CTkLabel(f2, text=self.get_language_sentence("min"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f2, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)), width=50, height=8, textvariable=sbi_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['sbi']['datavar'] = sbi_var
        self.data_objects['sbi']['obj'] = [sentry]

        # ========== Frame: 3 (Focus Break) ==========
        f3 = ctk.CTkFrame(self.main_frame)
        f3.pack(pady=1.25, anchor='center', fill=ctk.X)

        ctk.CTkLabel(f3, text=self.get_language_sentence("fb"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).pack(padx=10, pady=1.25, anchor="e", side='left')
        fb_var = ctk.StringVar(f3, value=get_data("fb"))
        ctk.CTkLabel(f3, text=self.get_language_sentence("sec"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f3, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)), width=50, height=8, textvariable=fb_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['fb']['datavar'] = fb_var
        self.data_objects['fb']['obj'] = [sentry]

        # ========== Title: Preferences ==========
        ctk.CTkLabel(self.main_frame, text=self.get_language_sentence("preferences"), font=(self.FONTNAME, float(16 * self.RELATIVESIZE), "bold")).pack(pady=3, anchor="nw")
        
        # ========== Frame: 4 (Focus Break Screen Fade Transition) ==========
        def switch_event():
            self.data_objects['fbsft']['obj'][0].configure(text=f"  {self.get_language_sentence('on')}" if self.data_objects['fbsft']['datavar'].get() == "on" else f"  {self.get_language_sentence('off')}")

        f5 = ctk.CTkFrame(self.main_frame)
        f5.pack(pady=1.25, anchor='center', fill=ctk.X)
        f5.grid_rowconfigure(0, weight=1)
        f5.grid_columnconfigure(0, weight=0)
        f5.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(f5, text=self.get_language_sentence("fbsft"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).grid(row=0, column=0, sticky="e", pady=2.5, padx=10)

        fbsft_var = ctk.StringVar(f5, value=get_data('fbsft'))
        fbsft_switch = ctk.CTkSwitch(f5, text=f"  {self.get_language_sentence('on')}" if fbsft_var.get() == "on" else f"  {self.get_language_sentence('off')}", variable=fbsft_var, command=switch_event, onvalue="on", offvalue="off", font=(self.FONTNAME, float(13 * self.RELATIVESIZE)))
        fbsft_switch.grid(row=0, column=1, sticky="e", pady=2.5)
        self.data_objects['fbsft']['obj'] = [fbsft_switch]
        self.data_objects['fbsft']['datavar'] = fbsft_var

        # ========== Frame: 5 (Blink Eye Theme) ==========
                  
        f5 = ctk.CTkFrame(self.main_frame)
        f5.pack(pady=1.25, anchor='center', fill=ctk.X)
        f5.grid_rowconfigure(0, weight=1)
        f5.grid_columnconfigure(0, weight=0)
        f5.grid_columnconfigure(1, weight=1)
        f5.grid_columnconfigure(2, weight=1)
        f5.grid_columnconfigure(3, weight=1)
        
        ctk.CTkLabel(f5, text=self.get_language_sentence("betheme"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).grid(row=0, column=0, sticky="e", pady=2.5, padx=10)

        betheme_var = ctk.StringVar(f5, value=get_data('betheme'))
        betheme_system_radio = ctk.CTkRadioButton(f5, text=self.get_language_sentence("system"), variable=betheme_var, value="system", command=self.change_theme, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)))
        betheme_system_radio.grid(row=0, column=1, sticky="e", pady=2.5)
        betheme_light_radio = ctk.CTkRadioButton(f5, text=self.get_language_sentence("light"), variable=betheme_var, value="light", command=self.change_theme, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)))
        betheme_light_radio.grid(row=0, column=2, sticky="e", pady=2.5)
        betheme_dark_radio = ctk.CTkRadioButton(f5, text=self.get_language_sentence("dark"), variable=betheme_var, value="dark", command=self.change_theme, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)))
        betheme_dark_radio.grid(row=0, column=3, sticky="e", pady=2.5)
        self.data_objects['betheme']['obj'] = [betheme_system_radio, betheme_light_radio, betheme_dark_radio]
        self.data_objects['betheme']['datavar'] = betheme_var

        # ========== Frame: 6 (Language) ==========
        f5 = ctk.CTkFrame(self.main_frame)
        f5.pack(pady=1.25, anchor='center', fill=ctk.X)
        f5.grid_rowconfigure(0, weight=1)
        f5.grid_columnconfigure(0, weight=0)
        f5.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(f5, text=self.get_language_sentence("lang"), anchor="w", font=(self.FONTNAME, float(13 * self.RELATIVESIZE))).grid(row=0, column=0, sticky="e", pady=2.5, padx=10)

        lang_var = ctk.StringVar(f5, value=get_data('lang'))
        lang_switch = ctk.CTkOptionMenu(f5, values=self.available_languages(), variable=lang_var, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)), fg_color=("#F9F9FA", "#343638"), button_color=("#F9F9FA", "#343638"), button_hover_color=("#979DA2", "#565B5E"))
        lang_switch.grid(row=0, column=1, sticky="e", pady=2.5)
        self.data_objects['lang']['obj'] = [lang_switch]
        self.data_objects['lang']['datavar'] = lang_var

        self.save_button = ctk.CTkButton(self.main_frame, text=self.get_language_sentence("save"), width=40, height=25, font=(self.FONTNAME, float(13 * self.RELATIVESIZE)), command=lambda: threading.Thread(target=self.update_data, daemon=True).start())
        self.save_button.pack(anchor="se", pady=5, padx=5, side="bottom")
        status_switch_event(True)