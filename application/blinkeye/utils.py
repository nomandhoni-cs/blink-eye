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

def resource_path(relative_path, data: bool = False, font: bool = False):
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

    if font:
        if "font" in dirlist:
            base_path = os.path.join(base_path, 'font')
        elif "application" in dirlist:
            base_path = os.path.join(base_path, 'application')
            base_path = os.path.join(base_path, 'font')
        return os.path.join(base_path, relative_path)
    
    if "assets" in dirlist:
        base_path = os.path.join(base_path, 'assets')
    elif "application" in dirlist:
        base_path = os.path.join(base_path, 'application')
        base_path = os.path.join(base_path, 'assets')

    return os.path.join(base_path, relative_path)

def get_data(key: str):
    with open(resource_path("data.json", data=True), 'r', encoding="utf-8") as f:
        data = json.load(f)
    return data[key]

def set_data(key: str, value: str):
    with open(resource_path("data.json", data=True), 'r', encoding="utf-8") as f:
        data = json.load(f)
    
    data[key] = value

    with open(resource_path("data.json", data=True), 'w', encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


