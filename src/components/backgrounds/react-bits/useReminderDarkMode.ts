import { useEffect, useState } from "react";
import { useTheme } from "../../ThemeProvider";

/** Resolve the app's saved/system theme for fullscreen reminder backgrounds. */
export function useReminderDarkMode() {
  const { theme } = useTheme();
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return theme === "dark" || (theme === "system" && systemPrefersDark);
}
