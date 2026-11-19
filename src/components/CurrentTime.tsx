import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CurrentTime = () => {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Locale-aware 12/24-hour formatting follows the app language.
      const formattedTime = new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now);
      setTime(formattedTime);
    };

    updateTime(); // Initial call to set time immediately
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [i18n.language]);

  return (
    <div className="text-xl ">
      {t("common.currentTime")} <span className="">{time}</span>
    </div>
  );
};

export default CurrentTime;
