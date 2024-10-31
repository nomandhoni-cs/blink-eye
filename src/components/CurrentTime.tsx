import { useEffect, useState } from "react";

const CurrentTime = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const isAM = hours < 12;
      const formattedHours = hours % 12 || 12; // Convert 24-hour format to 12-hour
      const formattedTime = `${String(formattedHours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )} ${isAM ? "AM" : "PM"}`;
      setTime(formattedTime);
    };

    updateTime(); // Initial call to set time immediately
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <div className="text-xl text-white">
      Current Time: <span className="text-white">{time}</span>
    </div>
  );
};

export default CurrentTime;
