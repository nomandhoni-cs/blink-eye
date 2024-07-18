from ctypes import cast, POINTER
import comtypes
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

try:
    from blinkeye.utils import isWindows
except ModuleNotFoundError as e:
    # Handle error caused by an attempt to run the file independently
    if str(e) == "No module named 'blinkeye'":
        raise Exception("\033[93mPlease run the application from 'main.py' and use 'import blinkeye.audio' to access the attributes and functions\033[0m")

def get_volume() -> float:
    if isWindows:
        comtypes.CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
        return volume_interface.GetMasterVolumeLevelScalar()
    else:
        return None

def set_volume(volume) -> None:
    if isWindows:
        if volume is None:
            return
        comtypes.CoInitialize()
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume_interface = cast(interface, POINTER(IAudioEndpointVolume))
        volume_interface.SetMasterVolumeLevelScalar(volume, None)
        return None
    else:
        return None