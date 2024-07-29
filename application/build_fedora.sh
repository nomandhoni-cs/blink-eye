#!/usr/bin/env bash

ver="1.5.0"

echo Installing Dependencies...
sudo dnf install -y rpmdevtools rpmlint python3-devel python3-pip
pip install wheel
pip install -r REQUIREMENTS.txt
pip install pyinstaller
echo Building the executable...
pyinstaller --name BlinkEye --onefile --windowed --add-data="./assets/*;./assets" --add-data="./font/*;./font" --add-data="./data/*;./data" --hidden-import plyer.platforms.win.notification --clean main.py
echo Building the installer...
rpmdev-setuptree
cp -r ./* ~/rpmbuild/BUILD
cp ../LICENSE.txt ~/rpmbuild/BUILD/LICENSE.txt
rpmbuild -bb ./BlinkEye_Fedora.spec
rm -rf ~/rpmbuild/BUILD
mkdir -p ./ExecutableFile/
mv ~/rpmbuild/RPMS/x86_64/BlinkEye-$ver-1.fc39.x86_64.rpm ./ExecutableFile/BlinkEye-$ver-1.fc39.x86_64.rpm
