// src/hooks/useTimeCount.ts
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

interface TimeCount {
  hours: number;
  minutes: number;
}

interface TimeData {
  [date: string]: TimeCount; // Store time counts against each date
}

const useTimeCount = (): TimeCount => {
  const [timeCount, setTimeCount] = useState<TimeCount>({
    hours: 0,
    minutes: 0,
  });
  const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format

  // Load stored time data from the store when the component mounts
  useEffect(() => {
    const fetchTimeData = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedTimeData: TimeData | undefined = await store.get("timeData");

      // If there's stored time data, set the time count for the current date
      if (storedTimeData) {
        const storedTimeCount = storedTimeData[currentDate] || {
          hours: 0,
          minutes: 0,
        };
        setTimeCount(storedTimeCount);
      }
    };

    fetchTimeData();
  }, [currentDate]);

  // Update the time count every minute
  useEffect(() => {
    const startTime =
      Date.now() - (timeCount.hours * 3600 + timeCount.minutes * 60) * 1000;

    const interval = setInterval(async () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // in seconds
      const hours = Math.floor(elapsedTime / 3600);
      const minutes = Math.floor((elapsedTime % 3600) / 60);
      const newTimeCount = { hours, minutes };

      setTimeCount(newTimeCount);

      // Save the current time data to the store every minute
      const store = await load("store.json", { autoSave: false });
      const storedTimeData: TimeData | undefined =
        (await store.get("timeData")) || {};

      // Sum up the hours and minutes for the current date
      const currentStoredCount = storedTimeData[currentDate] || {
        hours: 0,
        minutes: 0,
      };
      const totalHours = currentStoredCount.hours + newTimeCount.hours;
      const totalMinutes = currentStoredCount.minutes + newTimeCount.minutes;

      // Normalize minutes to hours
      const finalHours = totalHours + Math.floor(totalMinutes / 60);
      const finalMinutes = totalMinutes % 60;

      // Update the time data for the current date
      storedTimeData[currentDate] = {
        hours: finalHours,
        minutes: finalMinutes,
      };
      await store.set("timeData", storedTimeData);
      await store.save();
    }, 60000); // Run every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [timeCount, currentDate]); // No conditionals in the hook

  return timeCount; // Return the current time spent for today
};

export default useTimeCount;
