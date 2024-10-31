import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState, useRef, useCallback } from "react";

interface TimeCount {
  hours: number;
  minutes: number;
}

interface TimeData {
  [date: string]: TimeCount;
}

const useTimeCount = (): TimeCount => {
  const [timeCount, setTimeCount] = useState<TimeCount>({
    hours: 0,
    minutes: 0,
  });
  
  const dateRef = useRef(new Date().toISOString().split("T")[0]);
  const startTimeRef = useRef(Date.now());

  const getCurrentDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const initializeNewDate = useCallback(async (date: string): Promise<TimeCount> => {
    const store = await load("store.json", { autoSave: false });
    const storedTimeData: TimeData = (await store.get("timeData")) || {};
    
    // If this date doesn't exist in the store, initialize it
    if (!storedTimeData[date]) {
      storedTimeData[date] = { hours: 0, minutes: 0 };
      await store.set("timeData", storedTimeData);
      await store.save();
    }
    
    return storedTimeData[date];
  }, []);

  const saveTimeData = useCallback(async (date: string, newTimeCount: TimeCount) => {
    const store = await load("store.json", { autoSave: false });
    const storedTimeData: TimeData = (await store.get("timeData")) || {};
    
    storedTimeData[date] = {
      hours: newTimeCount.hours,
      minutes: newTimeCount.minutes
    };

    await store.set("timeData", storedTimeData);
    await store.save();
  }, []);

  // Initialize time data when the component mounts
  useEffect(() => {
    const initializeTimeData = async () => {
      const currentDate = getCurrentDate();
      const currentDateData = await initializeNewDate(currentDate);
      setTimeCount(currentDateData);
      dateRef.current = currentDate;
      startTimeRef.current = Date.now();
    };

    initializeTimeData();
  }, [getCurrentDate, initializeNewDate]);

  // Timer and date change effect
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentDate = getCurrentDate();
      
      // Check if date has changed (midnight crossed)
      if (currentDate !== dateRef.current) {
        console.log('Date changed from', dateRef.current, 'to', currentDate);
        
        // Initialize the new date
        const newDateData = await initializeNewDate(currentDate);
        setTimeCount(newDateData);
        startTimeRef.current = Date.now();
        dateRef.current = currentDate;
        return;
      }

      // Calculate elapsed time for current date
      const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const currentHours = Math.floor(elapsedTime / 3600);
      const currentMinutes = Math.floor((elapsedTime % 3600) / 60);
      
      const newTimeCount = {
        hours: currentHours,
        minutes: currentMinutes
      };

      setTimeCount(newTimeCount);
      await saveTimeData(currentDate, newTimeCount);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [getCurrentDate, initializeNewDate, saveTimeData]);

  return timeCount;
};

export default useTimeCount;