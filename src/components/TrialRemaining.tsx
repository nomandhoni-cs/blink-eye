import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { CheckCircle2Icon } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const TrialRemaining: React.FC = () => {
  const { isTrialOn, remainingDays } = useOnlineStatus();

  return (
    <div className="w-full border-8 border-[#FE4C55] rounded-md p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg text-center mb-4 text-white">
      {remainingDays !== null ? (
        <>
          <h2 className="font-heading text-2xl mb-2">
            {isTrialOn && remainingDays > 0
              ? `Only ${remainingDays} day${
                  remainingDays > 1 ? "s" : ""
                } left in your trial!`
              : "Your trial period has expired."}
          </h2>
          <p className="text-lg mb-2 font-normal">
            {isTrialOn && remainingDays > 0
              ? "Want the full experience? Support the developer and unlock all features with a license!"
              : "Your trial has ended. Help support this open-source project by purchasing a license to continue enjoying all features!"}
          </p>
          <Button asChild>
            <Link to="https://blinkeye.app/en/pricing" target="_blank">
              <CheckCircle2Icon className="mr-2" />
              {isTrialOn && remainingDays > 0
                ? "Get a License"
                : "Get a License to Support this project"}
            </Link>
          </Button>
        </>
      ) : (
        <p className="text-white">
          Trial info loading… probably lost in a wormhole 🌌🕳️. Hang tight! 🚀✨
          Maybe A Refresh will fix it!
        </p>
      )}
    </div>
  );
};

export default TrialRemaining;
