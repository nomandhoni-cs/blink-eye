import { CheckCircle2Icon } from "lucide-react";

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
      <UsageTimeChart />
      {/* Glassmorphism Effect Overlay */}
      {!canAccessPremiumFeatures && (
        <div className="absolute p-8 top-0 left-0 w-full h-full bg-[#000000] bg-opacity-95 backdrop-blur-3xl flex flex-col space-y-8 justify-center items-center rounded-lg">
          <h3 className="text-center text-white font-heading tracking-wide text-3xl">
            Your support will help the developer to make this project better &
            add more features.
          </h3>
          <Button asChild>
            <Link
              to="https://blinkeye.vercel.app/pricing"
              target="_blank"
              className="flex items-center justify-center px-6 py-3 bg-[#FE4C55] text-black text-lg rounded-lg hover:bg-[#e4434b] focus:outline-none"
            >
              <CheckCircle2Icon className="mr-2" />
              Get a License to Support this project, And Unlock All Features.
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsageTime;
