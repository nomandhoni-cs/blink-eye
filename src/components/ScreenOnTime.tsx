interface TimeCount {
  hours: number;
  minutes: number;
}

interface TimeDisplayProps {
  timeCount: TimeCount;
}

const ScreenOnTime: React.FC<TimeDisplayProps> = ({ timeCount }) => {
  const { hours, minutes } = timeCount;
  return (
    <div className="text-xl ">
      <span className="">
        Screen On Time: {hours}h {minutes}m
      </span>
    </div>
  );
};

export default ScreenOnTime;
