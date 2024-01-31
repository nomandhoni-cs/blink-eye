# notification.py
import os
import sys
from plyer import notification
def show_notification(title, message):
    notification.notify(
        title=title,
        message=message,
        app_icon="../logo.ico",
        timeout=3
    )

if __name__ == "__main__":
    show_notification("Blink Eye", "Your program has started running.")
