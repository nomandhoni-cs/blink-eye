import { useAccentColor } from "../../contexts/AccentColorContext";
import { THEMES, type ThemeName } from "../../lib/themes";
import { oklchStringToHex } from "../../lib/color-utils";

const THEME_GROUPS = [
  {
    label: "Neutral",
    themes: ["neutral", "stone", "zinc", "olive", "mist", "taupe"],
  },
  {
    label: "Warm",
    themes: ["yellow", "amber", "orange", "red", "rose", "pink"],
  },
  {
    label: "Green",
    themes: ["lime", "green", "emerald", "teal", "cyan", "sky"],
  },
  {
    label: "Cool",
    themes: ["fuchsia", "purple", "violet", "indigo", "blue", "mauve"],
  },
];

export default function ThemePickerOnboarding() {
  const { accentTheme, setAccentTheme } = useAccentColor();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold tracking-tight">
          Pick Your Style
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Choose an accent color that will be applied across the entire app.
        </p>
      </div>

      <div className="space-y-5 w-full max-w-4xl mx-auto">
        {THEME_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {group.themes.map((themeName) => {
                const theme = THEMES.find((t) => t.name === themeName);
                if (!theme) return null;
                return (
                  <ThemeButton
                    key={theme.name}
                    name={theme.name}
                    title={theme.title}
                    isSelected={accentTheme === theme.name}
                    onClick={() => setAccentTheme(theme.name as ThemeName)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeButton({
  name,
  title,
  isSelected,
  onClick,
}: {
  name: string;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const theme = THEMES.find((t) => t.name === name);
  const primary = theme?.cssVars.light?.primary || "oklch(0.505 0.213 27.518)";
  const hex = oklchStringToHex(primary);

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex flex-col items-center gap-2 px-3 py-2.5 rounded-full
        hover:scale-105 active:scale-95
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-foreground/30
      `}
      style={{ transition: "transform 200ms ease" }}
    >
      <div
        className={`
          relative w-28 h-12 rounded-full shrink-0
          ${isSelected ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-background" : ""}
        `}
        style={{ backgroundColor: hex }}
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white drop-shadow-sm"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground leading-none whitespace-nowrap">
        {title}
      </span>
    </button>
  );
}
