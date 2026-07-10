import { useTimeCountContext } from "../../contexts/TimeCountContext";
import DashboardPendingTasks from "../DashboardPendingTasks";

const Dashboard = () => {
  const usageTimeLimit = 8;
  const { timeCount } = useTimeCountContext();

  const totalHours = timeCount.hours + timeCount.minutes / 60;
  const percentage = (totalHours / 24) * 100;
  const isOverLimit = totalHours > usageTimeLimit;

  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);

  return (
    <div className="p-2 space-y-4 flex flex-col h-full relative">
      <div className="flex justify-between items-center space-x-8 mt-6 mb-6">
        <div>
          <h1 className="text-5xl font-heading font-semibold tracking-wider text-foreground">
            {currentDate.toLocaleString("en-US", { weekday: "long" })}
          </h1>
          <p className="text-xl text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="86"
              className="stroke-muted stroke-[20px] fill-none"
              strokeLinecap="round"
            />
            <circle
              cx="96"
              cy="96"
              r="86"
              className={`stroke-[20px] fill-none transition-all duration-500 ease-in-out ${
                isOverLimit ? "stroke-destructive" : "stroke-primary"
              }`}
              strokeDasharray={`${(percentage * 540.4) / 100} 540.4`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-heading tracking-wide">{`${timeCount.hours}h ${timeCount.minutes}m`}</span>
            <span className="text-sm text-muted-foreground">Usage Time</span>
          </div>
        </div>
      </div>

      <div className="flex-1 pb-4">
        <DashboardPendingTasks />
      </div>
    </div>
  );
};

export default Dashboard;
