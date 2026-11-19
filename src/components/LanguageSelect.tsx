import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LOCALES } from "../i18n/config";

/**
 * Compact language dropdown used in Settings.
 * Values are locale codes; labels are the language's native name.
 */
export function LanguageSelect({
  value,
  onValueChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id="appLanguage"
        aria-label={ariaLabel}
        className="w-full rounded-3xl bg-background/50"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((locale) => (
          <SelectItem key={locale.code} value={locale.code}>
            {locale.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
