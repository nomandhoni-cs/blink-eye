# notification.py
import os
import sys
from plyer import notification
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS2
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def show_notification(title, message):
    notification.notify(
        title=title,
        message=message,
        app_icon=resource_path("logo.ico"),
        timeout=3
    )

if __name__ == "__main__":
    show_notification("Program Started", "Your program has started running.")
