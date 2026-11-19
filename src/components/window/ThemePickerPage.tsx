import { useTranslation } from "react-i18next";
import { ThemePicker } from "../ThemePicker";

const ThemePickerPage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 p-2">
      <h3 className="text-2xl font-heading tracking-wide">
        {t("common.themePicker")}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t("common.themePickerDescription")}
      </p>
      <ThemePicker />
    </div>
  );
};

export default ThemePickerPage;
