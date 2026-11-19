import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { LOCALES } from "../i18n/config";
import { useLanguage } from "../i18n/useLanguage";

/**
 * Compact language switcher for the title bar, mirroring `ModeToggle`.
 * The full searchable picker lives in Settings; this one is for quick
 * switching without leaving the current screen.
 */
export function LanguageToggle() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.language")}
          title={t("common.language")}
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="max-h-80 overflow-y-auto">
          {LOCALES.map((locale) => (
            <DropdownMenuItem
              key={locale.code}
              onSelect={() => void setLanguage(locale.code)}
            >
              <span className="flex-1 truncate">{locale.nativeName}</span>
              {locale.code === language && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
