import AutoStartToggle from "../AutoStartToggle";
import PomodoroTimerToggle from "../PomodoroTimerToggle";

const AllSettings = () => {
  return (
    <>
      <div className="space-y-2">
        <AutoStartToggle />
        <PomodoroTimerToggle />
      </div>
    </>
  );
};

export default AllSettings;
