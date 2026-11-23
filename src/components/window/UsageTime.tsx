import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, CheckCircle2Icon } from "lucide-react";

import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { usePremiumNudge } from "../../hooks/usePremiumNudge";
import { Link } from "react-router-dom";
import { pricingUrl } from "../../lib/links";
import { Button } from "../ui/button";
import UsageTimeChart from "../UsageTimeChart";

const UsageTime = () => {
  const { t } = useTranslation();
  const { canAccessPremiumFeatures, isPaidUser, isTrialOn } =
    usePremiumFeatures();
  const { fireTrigger } = usePremiumNudge();
  console.log(canAccessPremiumFeatures, isPaidUser, isTrialOn);

  // Post-activity hint: only fires after a real 5s dwell, not on route enter.
  // Rust decides whether the nudge actually shows.
  useEffect(() => {
    const timer = setTimeout(() => fireTrigger("stats_viewed"), 5000);
    return () => clearTimeout(timer);
  }, [fireTrigger]);

  return (
    <div className="relative">
      {canAccessPremiumFeatures ? (
        <UsageTimeChart />
      ) : (
        <div className="w-full h-96 flex flex-col space-y-8 justify-center items-center rounded-lg">
          <h3 className="text-center text-white font-heading tracking-wide text-3xl">
            {t("usageTime.supportTitle")}
          </h3>
          <Button asChild>
            <Link
              to={pricingUrl({
                source: "app_usage_time",
                campaign: "break_reminder_usage_time",
              })}
              target="_blank"
              className="flex items-center justify-center px-6 py-3 bg-[#FE4C55] text-black text-lg rounded-lg hover:bg-[#e4434b] focus:outline-none"
            >
              <CheckCircle2Icon className="mr-2" />
              {t("usageTime.getLicenseSeeUsage")}
              <b>
                <BarChart className="inline text-green-500" />
              </b>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsageTime;
