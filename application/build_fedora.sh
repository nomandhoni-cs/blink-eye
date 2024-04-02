#!/usr/bin/env bash

ver="1.4.0"

echo Installing Dependencies...
sudo dnf install -y rpmdevtools rpmlint python3-devel python3-pip python3-tkinter
pip install wheel
pip install -r REQUIREMENTS.txt
pip install pyinstaller
echo Building the executable...
pyinstaller --name BlinkEye --onefile --windowed --icon="./Assets/blink-eye-logo.ico" --add-data="./Assets/*;./Assets" --hidden-import plyer.platforms.linux.notification --clean blink-eye.py
echo Building the installer...
rpmdev-setuptree
cp -r ./* ~/rpmbuild/BUILD
rpmbuild -bb ./BlinkEye_Fedora.spec
rm -rf ~/rpmbuild/BUILD
mv ~/rpmbuild/RPMS/x86_64/BlinkEye-$ver-1.fc39.x86_64.rpm ./ExecutableFile/BlinkEye-$ver-1.fc39.x86_64.rpm