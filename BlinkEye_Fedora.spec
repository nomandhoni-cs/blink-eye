Name:           BlinkEye
Version:        1.4.0
Release:        1%{?dist}
Summary:        Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage.

License:        MIT
URL:            https://github.com/nomandhoni-cs/blink-eye

%description
Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage. It provides customization timers, full-screen popups, audio mute functionality for a seamless user experience.

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/%{_bindir}
mkdir -p $RPM_BUILD_ROOT/%{_datadir}/icons
mkdir -p $RPM_BUILD_ROOT/%{_datadir}/applications/
cp dist/%{name} $RPM_BUILD_ROOT/%{_bindir}
cp %{name}.desktop $RPM_BUILD_ROOT/%{_datadir}/applications/
cp blink-eye-logo.png $RPM_BUILD_ROOT/%{_datadir}/icons/%{name}.png

%clean
rm -rf $RPM_BUILD_ROOT

%files
%{_bindir}/%{name}
%{_datadir}/applications/%{name}.desktop
%{_datadir}/icons/%{name}.png
%license LICENSE.txt

%changelog
* Mon Apr 01 2024 Moheshwar Amarnath Biswas
- First Linux Version
