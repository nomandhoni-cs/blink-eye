import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState, useRef, useCallback } from "react";

interface TimeStamp {
  firstTimestamp: number;
  secondTimestamp: number;
}

interface TimeData {
  [date: string]: TimeStamp[];
}

const useTimeCount = (): TimeStamp[] => {
  const [timeDatas, setTimeDatas] = useState<TimeStamp[]>([]);
  const dateRef = useRef<string | null>(null);

  const getCurrentDate = useCallback(() => {
    // Get the local date in the format 'YYYY-MM-DD'
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getCurrentLocalTimestamp = useCallback(() => {
    const today = new Date();
    const localTimestamp = today.getTime() - today.getTimezoneOffset() * 60000;
    return localTimestamp;
  }, []);

  const initializeNewDate = useCallback(
    async (date: string): Promise<TimeStamp[]> => {
      const store = await load("userScreenOnTime.json", { autoSave: false });
      const storedTimeData: TimeData = (await store.get("timeData")) || {};

      storedTimeData[date] = [
        ...(storedTimeData[date] || []),
        {
          firstTimestamp: getCurrentLocalTimestamp(),
          secondTimestamp: getCurrentLocalTimestamp(),
        },
      ];

      await store.set("timeData", storedTimeData);
      await store.save();

      return storedTimeData[date];
    },
    []
  );

  const saveTimeData = useCallback(
    async (date: string, newTimeData: TimeStamp[]) => {
      const store = await load("userScreenOnTime.json", { autoSave: false });
      const storedTimeData: TimeData = (await store.get("timeData")) || {};

      storedTimeData[date] = newTimeData;
      await store.set("timeData", storedTimeData);
      await store.save();
    },
    []
  );

  // Initialize time data when the component mounts
  useEffect(() => {
    const initializeTimeData = async () => {
      const currentDate = getCurrentDate();
      const currentDateData = await initializeNewDate(currentDate);
      setTimeDatas(currentDateData);
      dateRef.current = currentDate;
    };

    initializeTimeData();
  }, [getCurrentDate, initializeNewDate]);

  // Timer and date change effect
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentDate = getCurrentDate();

      // Check if date has changed (midnight crossed)
      if (currentDate !== (dateRef.current ?? "")) {
        console.log("Date changed from", dateRef.current, "to", currentDate);

        // Initialize the new date
        const newDateData = await initializeNewDate(currentDate);
        setTimeDatas(newDateData);
        dateRef.current = currentDate;
        return;
      }

      // Fetch the last stored time data (timestamp array)
      const store = await load("userScreenOnTime.json", { autoSave: false });
      const storedTimeData: TimeData = (await store.get("timeData")) || {};
      const currentDateData = storedTimeData[currentDate] || [];

      // If there are existing timestamp pairs, update the last one
      if (currentDateData.length > 0) {
        const lastTimeData = currentDateData[currentDateData.length - 1];

        // Update the second timestamp for the last timestamp pair
        const updatedLastTimeData = {
          firstTimestamp: lastTimeData.firstTimestamp,
          secondTimestamp: getCurrentLocalTimestamp(),
        };

        // Replace the last timestamp pair with the updated one
        currentDateData[currentDateData.length - 1] = updatedLastTimeData;

        // Save the updated time data back to the store
        await saveTimeData(currentDate, currentDateData);
        setTimeDatas(currentDateData); // Update state
        console.log(
          getCurrentLocalTimestamp(),
          "Updated time data",
          currentDateData
        );
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [
    getCurrentDate,
    getCurrentLocalTimestamp,
    initializeNewDate,
    saveTimeData,
  ]);

  return timeDatas;
};

export default useTimeCount;
