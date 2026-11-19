import { useTranslation } from "react-i18next";
import { BugIcon, MonitorCog } from "lucide-react";

const Soon = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center mt-24">
      <div className="text-center">
        {/* Construction Icon */}
        <MonitorCog className="mx-auto h-40 w-40 mb-4" />

        {/* Text */}
        <h1 className="text-2xl font-semibold mb-2 flex items-center justify-center">
          {t("soon.title")} <BugIcon className="mx-2" />
          {t("soon.titleSuffix")}
        </h1>
        <p className="text-lg">{t("soon.subtitle")}</p>
      </div>
    </div>
  );
};

export default Soon;
