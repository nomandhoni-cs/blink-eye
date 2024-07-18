import sys
import os
import json
import platform
import customtkinter as ctk

isWindows = False
if platform.system().lower() == "windows":
    isWindows = True

ctk.set_appearance_mode("system")

ALPHA_VALUES = [i / 10 for i in range(11)]

def resource_path(relative_path, data: bool = False):
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    dirlist = os.listdir(base_path)
    if data:
        if "data" in dirlist:
            base_path = os.path.join(base_path, 'data')
        elif "application" in dirlist:
            base_path = os.path.join(base_path, 'application')
            base_path = os.path.join(base_path, 'data')
        return os.path.join(base_path, relative_path)
        
    if "Assets" in dirlist:
        base_path = os.path.join(base_path, 'Assets')
    elif "application" in dirlist:
        base_path = os.path.join(base_path, 'application')
        base_path = os.path.join(base_path, 'Assets')

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

