import multiprocessing
from blinkeye.utils import isWindows, get_data
from blinkeye.dashboard import BlinkEyeDashboard

if __name__ == "__main__":
    if isWindows:
        multiprocessing.freeze_support()

    try:
        dashboard = BlinkEyeDashboard()
        if get_data('status') == "on":
            dashboard.start_notifier_process()
        dashboard.root.mainloop()
    except KeyboardInterrupt:
        pass
