import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Search } from "lucide-react";
import { Input } from "../ui/input";
import { LOCALES } from "../../i18n/config";
import { cn } from "../../lib/utils";

/**
 * First onboarding screen: pick the interface language.
 * English is selected by default so a user who just clicks "Next" gets the
 * familiar experience, and the choice can be changed later in Settings.
 */
export default function LanguageScreen({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (code: string) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCALES;
    return LOCALES.filter(
      (locale) =>
        locale.nativeName.toLowerCase().includes(q) ||
        locale.englishName.toLowerCase().includes(q) ||
        locale.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 py-2">
      <div className="flex w-full max-w-xl flex-col items-center space-y-5">
        <div className="space-y-1.5 text-center">
          <h2 className="text-2xl font-bold font-heading tracking-tight">
            {t("onboarding.languageTitle")}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("onboarding.languageSubtitle")}
          </p>
        </div>

        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("onboarding.languageSearchPlaceholder")}
            aria-label={t("onboarding.languageSearchPlaceholder")}
            className="h-10 rounded-full pl-9"
          />
        </div>

        <div className="max-h-[46vh] w-full overflow-y-auto rounded-2xl border border-border/60 bg-background/40 p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("common.noResults")}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
              {filtered.map((locale) => {
                const isSelected = locale.code === selected;
                return (
                  <li key={locale.code}>
                    <button
                      type="button"
                      onClick={() => onSelect(locale.code)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground/80 hover:bg-muted/60",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {locale.nativeName}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {locale.englishName}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
