import { BarChart, CheckCircle2Icon } from "lucide-react";

import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import UsageTimeChart from "../UsageTimeChart";

const UsageTime = () => {
  const { canAccessPremiumFeatures, isPaidUser, isTrialOn } =
    usePremiumFeatures();
  console.log(canAccessPremiumFeatures, isPaidUser, isTrialOn);

  return (
    <div className="relative">
      {canAccessPremiumFeatures ? (
        <UsageTimeChart />
      ) : (
        <div className="w-full h-96 flex flex-col space-y-8 justify-center items-center rounded-lg">
          <h3 className="text-center text-white font-heading tracking-wide text-3xl">
            Your support will help the developer to make this project better &
            add more features.
          </h3>
          <Button asChild>
            <Link
              to="https://blinkeye.app/pricing?utm_source=app_usage_time&utm_medium=cta&utm_campaign=break_reminder_usage_time"
              target="_blank"
              className="flex items-center justify-center px-6 py-3 bg-[#FE4C55] text-black text-lg rounded-lg hover:bg-[#e4434b] focus:outline-none"
            >
              <CheckCircle2Icon className="mr-2" />
              Get a License to Support this project, And{" "}
              <b>
                See your
                <BarChart className="inline text-green-500" /> Usage Time
              </b>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsageTime;
