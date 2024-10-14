import multiprocessing
from blinkeye.dashboard import BlinkEyeDashboard
import platform
import json
import os, sys

if __name__ == "__main__":
    if platform.system().lower() == "windows":
        multiprocessing.freeze_support()

    try:
        dashboard = BlinkEyeDashboard()
        if json.load(open(os.path.join(os.path.join(os.path.join(sys._MEIPASS if hasattr(sys, '_MEIPASS') else os.path.abspath("."), 'application'), 'data'), "data.json"), 'r', encoding="utf-8"))['status'] == "on":
            dashboard.start_notifier_process()
        dashboard.root.mainloop()
    except KeyboardInterrupt:
        pass
