@echo off
title=Blink Eye for Windows Build Script
echo Installing Inno Setup...
winget install --id=JRSoftware.InnoSetup -e -s winget
echo Installing Dependencies...
python -m pip install wheel
python -m pip install -r REQUIREMENTS.txt
python -m pip install pyinstaller
echo Building the executable...
pyinstaller --name BlinkEye --onefile --windowed --icon="./Assets/blink-eye-logo.ico" --add-data="./Assets/*;./Assets" --hidden-import plyer.platforms.win.notification --clean blink_eye.py
echo Building the installer...
"%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" BuildFileForInnoSetup.iss
@REM If the above command does not work, try the following command will be used instead
"C:\Users\%USERNAME%\AppData\Local\Programs\Inno Setup 6\ISCC.exe" BuildFileForInnoSetup.iss
