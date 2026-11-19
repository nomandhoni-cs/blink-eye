import { useTranslation } from "react-i18next";
import MultiMonitorToggle from "../MultiMonitorToggle";

const MultiMonitor = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-heading tracking-wide">
          {t("common.monitorSetup")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t("common.monitorSetupDesc")}
        </p>
      </div>

      <MultiMonitorToggle />

      <div className="rounded-lg border border-muted p-6 space-y-4">
        <h4 className="text-lg font-semibold">{t("common.howItWorks")}</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">
                {t("common.primaryMonitor")}
              </p>
              <p>{t("common.primaryMonitorDesc")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">
                {t("common.multiMonitorPremium")}
              </p>
              <p>{t("common.multiMonitorPremiumDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiMonitor;
