import AutoStartToggle from "../AutoStartToggle";
import StrictModeToggle from "../StrictModeToggle";
// import PomodoroTimerToggle from "../PomodoroTimerToggle";

const AllSettings = () => {
  return (
    <>
      <div className="space-y-2">
        <AutoStartToggle />
        {/* <PomodoroTimerToggle /> */}
        <StrictModeToggle />
      </div>
    </>
  );
};

export default AllSettings;
