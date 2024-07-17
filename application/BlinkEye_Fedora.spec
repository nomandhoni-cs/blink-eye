Name:           BlinkEye
Version:        1.5.0
Release:        1%{?dist}
Summary:        Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage.

License:        MIT
URL:            https://github.com/nomandhoni-cs/blink-eye

%description
Blink Eye is a minimalist eye care reminder app designed to reduce eye strain during extended screen usage. It provides customization timers, full-screen popups, audio mute functionality for a seamless user experience.

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/%{_bindir}
cp dist/%{name} $RPM_BUILD_ROOT/%{_bindir}

%clean
rm -rf $RPM_BUILD_ROOT

%files
%{_bindir}/%{name}
%license LICENSE.txt

%changelog
* Tue Jul 16 2024 Sayad Uddin Tahsin
- First implementation of Blink Eye Dashboard
