import sys
import os
import json
import platform
import customtkinter as ctk
import logging
import traceback

if not os.path.exists("./Logs"):
    os.makedirs("./Logs")

if os.path.exists("./Logs/BlinkEye.log"):
    open('./Logs/BlinkEye.log', 'w').close()

logger = logging.getLogger('BlinkEyeLogger')
logger.setLevel(logging.DEBUG)

file_handler = logging.FileHandler('./Logs/BlinkEye.log')
file_handler.setLevel(logging.DEBUG)  # Log all levels to the file

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)  # Log INFO and above to the console

custom_format = '%(asctime)s - %(filename)s - %(levelname)s - %(message)s'

class ColoredFormatter(logging.Formatter):
    # Define color codes for different log levels
    LEVEL_COLORS = {
        'DEBUG': '\033[34m',    # Blue
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[41m'  # Red background
    }

    MESSAGE_COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m'  # Magenta
    }
    
    RESET = '\033[0m'  # Reset color

    def format(self, record):
        # Get the color for the log level and message based on the level name
        level_color = self.LEVEL_COLORS.get(record.levelname, self.RESET)
        message_color = self.MESSAGE_COLORS.get(record.levelname, self.RESET)

        # Format the message with the colors
        log_fmt = (
            f'\033[1;34m%(asctime)s\033[0m - \033[1;36m%(filename)s\033[0m - '
            f'{level_color}\033[1m%(levelname)s\033[0m - '
            f'{message_color}%(message)s{self.RESET}'
        )
        
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

formatter = logging.Formatter(custom_format)

file_handler.setFormatter(formatter)
console_handler.setFormatter(ColoredFormatter())

logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Define a custom logging filter to add the filename
class FileNameFilter(logging.Filter):
    def __init__(self, name: str = None) -> None:
        self.name = name if name is not None else __file__
        super().__init__(name)
    
    def filter(self, record):
        record.filename = f"{os.path.basename(self.name).split('.')[0].upper()} [{os.path.basename(self.name)}]"
        return True

logger.addFilter(FileNameFilter(__file__))

def error_logger(exception_type, exception_value, exception_traceback):
    tb_details = traceback.extract_tb(exception_traceback)
    files = []
    lines = []
    for tb in tb_details:
        if tb.filename not in files:
            files.append(tb.filename)
        if tb.lineno not in lines:
            lines.append(str(tb.lineno))
    logger.error(
        f"{exception_type.__name__} in file {', '.join(files)}, line {', '.join(lines)}",
        exc_info=(exception_type, exception_value, exception_traceback)
    )

sys.excepthook = error_logger

logger.info("Logger started!")

isWindows = False
if platform.system().lower() == "windows":
    isWindows = True
logger.info(f"Detected OS: {platform.system()} {platform.architecture()[0]} [Version: {platform.version()}]")
    
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

def current_function_name():
    return sys._getframe(1).f_code.co_name

_theme = get_data("betheme")
ctk.set_appearance_mode(_theme)
logger.info(f"Using theme from `data.json`: {_theme}")

ctk.FontManager.load_font(resource_path("NotoSans-Regular.ttf", font=True))
logger.info("Font `NotoSans-Regular.ttf` Loaded")
