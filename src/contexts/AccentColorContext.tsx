import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { THEMES, type ThemeName } from "../lib/themes";
import { oklchStringToHex } from "../lib/color-utils";
import Database from "@tauri-apps/plugin-sql";

type AccentColorContextType = {
  accentTheme: ThemeName;
  accentHex: string;
  setAccentTheme: (theme: ThemeName) => void;
};

const DEFAULT_THEME: ThemeName = "red";

const AccentColorContext = createContext<AccentColorContextType | null>(null);

async function getThemeFromDB(): Promise<ThemeName | null> {
  try {
    const db = await Database.load("sqlite:appconfig.db");
    const result = (await db.select(
      "SELECT value FROM config WHERE key = 'selectedTheme'"
    )) as { value: string }[];
    if (result.length > 0 && THEMES.some((t) => t.name === result[0].value)) {
      return result[0].value as ThemeName;
    }
  } catch {
    // Database not available
  }
  return null;
}

async function saveThemeToDB(themeName: ThemeName): Promise<void> {
  try {
    const db = await Database.load("sqlite:appconfig.db");
    const existingRow = (await db.select(
      "SELECT value FROM config WHERE key = 'selectedTheme'"
    )) as { value: string }[];
    if (existingRow.length > 0) {
      await db.execute(
        "UPDATE config SET value = $1 WHERE key = 'selectedTheme'",
        [themeName]
      );
    } else {
      await db.execute(
        "INSERT INTO config (key, value) VALUES ('selectedTheme', $1)",
        [themeName]
      );
    }
  } catch {
    // Database not available
  }
}

function getAccentHex(themeName: ThemeName, isDark: boolean): string {
  const theme = THEMES.find((t) => t.name === themeName);
  if (!theme) return "#E85D3A";

  const mode = isDark ? "dark" : "light";
  const primary = theme.cssVars[mode]?.primary || theme.cssVars.light?.primary || "oklch(0.505 0.213 27.518)";
  return oklchStringToHex(primary);
}

// CSS variables that should NOT be overwritten by accent theme
// (these are controlled by the dark/light ThemeProvider)
const EXCLUDED_VARS = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

// Map CSS variable names to their -- prefix format
function applyThemeVars(themeName: ThemeName, isDark: boolean) {
  const theme = THEMES.find((t) => t.name === themeName);
  if (!theme) return;

  const root = document.documentElement;
  const mode = isDark ? "dark" : "light";
  const vars = theme.cssVars[mode] || theme.cssVars.light;

  if (!vars) return;

  // Only apply primary and primary-foreground (accent colors)
  Object.entries(vars).forEach(([key, value]) => {
    if (EXCLUDED_VARS.has(key)) return;
    if (key === "radius") {
      root.style.setProperty("--radius", value);
    } else {
      root.style.setProperty(`--${key}`, value);
    }
  });
}

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [isDark, setIsDark] = useState(false);

  // Load theme from database on mount
  useEffect(() => {
    const loadThemeFromDB = async () => {
      const dbTheme = await getThemeFromDB();
      if (dbTheme) {
        setAccentThemeState(dbTheme);
      }
    };
    loadThemeFromDB();
  }, []);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Apply theme variables when theme or mode changes
  useEffect(() => {
    applyThemeVars(accentTheme, isDark);
  }, [accentTheme, isDark]);

  const accentHex = useMemo(() => getAccentHex(accentTheme, isDark), [accentTheme, isDark]);

  const setAccentTheme = (theme: ThemeName) => {
    setAccentThemeState(theme);
    saveThemeToDB(theme);
  };

  return (
    <AccentColorContext.Provider value={{ accentTheme, accentHex, setAccentTheme }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (!context) {
    throw new Error("useAccentColor must be used within an AccentColorProvider");
  }
  return context;
}
