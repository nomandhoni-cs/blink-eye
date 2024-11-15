import { BugIcon, CheckCircle2Icon, MonitorCog } from "lucide-react";
import { useTimeCountContext } from "../../contexts/TimeCountContext";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const UsageTime = () => {
  const { timeCount } = useTimeCountContext();
  const canAccessPremiumFeatures = usePremiumFeatures();

  return (
    <div className="relative">
      <div className="max-w-4xl w-full rounded-lg shadow-xl ">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Today's Usage Time</h1>
          <p className="text-lg mt-2">
            Here's how much time you've spent today
          </p>
        </div>

        <div className="flex justify-center items-center bg-gradient-to-r from-yellow-300 via-pink-400 to-red-400 bg-[length:400%_400%] animate-gradient-animation bg-opacity-50 p-6 rounded-lg">
          <div className="relative flex justify-center items-center">
            <div className="relative">
              <div className="flex justify-center items-center">
                <div className="text-center">
                  <p className="text-6xl font-extrabold">{timeCount.hours}</p>
                  <p className="text-2xl">Hours</p>
                </div>
                <div className="mx-8">
                  <p className="text-6xl font-extrabold">{timeCount.minutes}</p>
                  <p className="text-2xl">Minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="mb-6">
            Need to track more or want to take a break? Get your usage insights
            and make the most of your time!
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center mt-8 border-t-2 border-gray-300 pt-8 opacity-50">
        <div className="text-center">
          <MonitorCog className="mx-auto h-32 w-40 mb-4" />

          <h1 className="text-2xl font-semibold mb-2 flex items-center justify-center">
            Fixing some last moment bugs <BugIcon className="mx-2" /> and making
            improvements
          </h1>
          <p className="text-lg">More features will be available soon.</p>
        </div>
      </div>

      {/* Glassmorphism Effect Overlay */}
      {!canAccessPremiumFeatures && (
        <div className="absolute p-8 top-0 left-0 w-full h-full bg-black bg-opacity-60 backdrop-blur-lg flex flex-col space-y-8 justify-center items-center rounded-lg">
          <h3 className="text-center text-white font-bold text-3xl">
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
