export const CONFIG = {
  twitter: "https://twitter.com/blinkeyeapp",
  github: "https://github.com/nomandhoni-cs/blink-eye",
  repository: "https://github.com/nomandhoni-cs/blink-eye",
  documentation: "https://github.com/nomandhoni-cs/blink-eye",
  nomandhoni: "https://twitter.com/nomandhoni",
  website: "https://blinkeye.app",
  buymecoffee: "https://www.buymeacoffee.com/nomandhoni",
  discord: "https://discord.gg/4VfTcEg9Vm",
  linkedin: "https://www.linkedin.com/company/blinkeyesoftware",
  command:
    "pyinstaller --name BlinkEye --onefile --windowed --icon=blink-eye-logo.ico --hidden-import plyer.platforms.win.notification blink-eye.py",
};

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
