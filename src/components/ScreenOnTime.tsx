import { useTranslation } from "react-i18next";

interface TimeCount {
  hours: number;
  minutes: number;
}

interface TimeDisplayProps {
  timeCount: TimeCount;
}

const ScreenOnTime: React.FC<TimeDisplayProps> = ({ timeCount }) => {
  const { t } = useTranslation();
  const { hours, minutes } = timeCount;
  return (
    <div className="text-xl ">
      <span className="">
        {t("common.screenOnTime", { hours, minutes })}
      </span>
    </div>
  );
};

export default ScreenOnTime;
