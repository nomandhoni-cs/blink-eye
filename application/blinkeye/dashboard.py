import threading
import time
import sys
import json
import multiprocessing
import customtkinter as ctk
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
        self.create()

    def on_close(self):
        if get_data('status') == 'on' and get_data('notifier_pid') != 0:
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
                    print(msg)
                    print(self.root.winfo_viewable())
                    if self.root.winfo_viewable() == 0:
                        self.on_close()

            time.sleep(0.5)

    def start_notifier_process(self):
        self.notifier_process = multiprocessing.Process(target=start_notifier, args=(self.signal_queue, ), daemon=True)
        self.notifier_process.start()
        set_data('notifier_pid', self.notifier_process.pid)

    def kill_notifier_process(self):
        os.kill(get_data("notifier_pid"), signal.SIGTERM)
        set_data("notifier_pid", 0)

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
            self.kill_notifier_process()
            time.sleep(1)
            self.start_notifier_process()
            self.save_button.configure(text="Save", state="normal", width=40, height=25)
            self.root.focus_force()

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
            if key == 'sbi':
                d = str(int(d) * 60)
            prepared_data[key] = d
        prepared_data['notifier_pid'] = get_data("notifier_pid")
        self.update_data(prepared_data)

    def refresh_data(self):
        temp_dict = self.data_objects.copy()
        temp_dict.pop('status')
        for key in temp_dict:
            if key == "sbi":
                d = str(int(get_data(key)) / 60 if int(get_data(key)) % 60 != 0 else int(int(get_data(key)) / 60))
                temp_dict[key]['textvar'].set(d)
            else:
                d = get_data(key)
                temp_dict[key]['textvar'].set(d)
            temp_dict[key]['obj'].delete(0, 'end')
            temp_dict[key]['obj'].insert(0, d)
    
    def create(self):
        self.logo_label = ctk.CTkLabel(self.root, text="  Blink Eye", image=ctk.CTkImage(Image.open(resource_path("blink-eye-logo.png")), Image.open(resource_path("blink-eye-logo.png")), (30, 30)), compound='left', font=("Noto Sans", 30, "bold"))
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
                    self.kill_notifier_process()
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
        sbi_var = ctk.StringVar(f2, value=str(int(get_data("sbi")) / 60 if int(get_data("sbi")) % 60 != 0 else int(int(get_data("sbi")) / 60)))
        ctk.CTkLabel(f2, text="minutes", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f2, font=("Noto Sans", 13), width=50, height=8, textvariable=sbi_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['sbi']['textvar'] = sbi_var
        self.data_objects['sbi']['obj'] = sentry

        # ========== Frame: 3 (Focus Break) ==========
        f3 = ctk.CTkFrame(self.main_frame)
        f3.pack(pady=1.25, anchor='center', fill=ctk.X)

        ctk.CTkLabel(f3, text="Focus Break", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="e", side='left')
        fb_var = ctk.StringVar(f3, value=get_data("fb"))
        ctk.CTkLabel(f3, text="seconds", anchor="w", font=("Noto Sans", 13)).pack(padx=10, pady=1.25, anchor="w", side='right')
        sentry = ctk.CTkEntry(f3, font=("Noto Sans", 13), width=50, height=8, textvariable=fb_var, validate='key', validatecommand=(self.root.register(self.validate_int), '%P'))
        sentry.pack(padx=2, pady=1.25, anchor="w", side='right')
        self.data_objects['fb']['textvar'] = fb_var
        self.data_objects['fb']['obj'] = sentry

        self.save_button = ctk.CTkButton(self.main_frame, text="Save", width=40, height=25, font=("Noto Sans", 13), command=lambda: threading.Thread(target=self.gather_data, daemon=True).start())
        self.save_button.pack(anchor="se", pady=5, padx=5, side="bottom")
        switch_event(True)