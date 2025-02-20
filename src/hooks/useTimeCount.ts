import { useEffect, useState, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";

interface TimeCount {
  hours: number;
  minutes: number;
}

const useTimeCount = (): { timeCount: TimeCount } => {
  const [timeCount, setTimeCount] = useState<TimeCount>({
    hours: 0,
    minutes: 0,
  });
  const [db, setDb] = useState<any>(null);

  // Get the current date in 'YYYY-MM-DD' format.
  const getCurrentDate = useCallback((): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    // console.log("[getCurrentDate] Current date:", dateStr);
    return dateStr;
  }, []);

  // Retrieve today's screen on time from SQLite.
  const fetchTodayScreenTime = useCallback(async () => {
    if (!db) {
      //   console.log(
      //     "[fetchTodayScreenTime] Database not loaded yet, skipping fetch."
      //   );
      return;
    }
    const currentDate = getCurrentDate();
    // console.log(
    //   `[fetchTodayScreenTime] Fetching screen time for date: ${currentDate}`
    // );
    try {
      const records: any[] = await db.select(
        "SELECT first_timestamp, second_timestamp FROM time_data WHERE date = ?",
        [currentDate]
      );
      //   console.log("[fetchTodayScreenTime] Fetched records:", records);
      let totalMs = 0;
      records.forEach((record) => {
        // console.log("[fetchTodayScreenTime] Record:", record);
        const diff = record.second_timestamp - record.first_timestamp;
        // console.log(`[fetchTodayScreenTime] Diff for record: ${diff} ms`);
        if (diff > 0) totalMs += diff;
      });
      //   console.log(
      //     "[fetchTodayScreenTime] Total milliseconds for today:",
      //     totalMs
      //   );
      const hours = Math.floor(totalMs / (3600 * 1000));
      const minutes = Math.floor((totalMs % (3600 * 1000)) / (60 * 1000));
      //   console.log(
      //     `[fetchTodayScreenTime] Calculated timeCount: ${hours} hours, ${minutes} minutes`
      //   );
      setTimeCount({ hours, minutes });
    } catch (error) {
      console.error(
        "[fetchTodayScreenTime] Error fetching today's screen on time:",
        error
      );
    }
  }, [db, getCurrentDate]);

  // Load the SQLite database on mount.
  useEffect(() => {
    (async () => {
      try {
        // console.log("[useEffect] Loading SQLite database...");
        const dbInstance = await Database.load("sqlite:UserScreenTime.db");
        // console.log("[useEffect] Database loaded successfully.");
        setDb(dbInstance);
      } catch (error) {
        console.error("[useEffect] Failed to load database:", error);
      }
    })();
  }, []);

  // Poll the database every minute to update today's screen on time.
  useEffect(() => {
    if (!db) {
      //   console.log(
      //     "[Interval Effect] Database is not available yet, not starting interval."
      //   );
      return;
    }
    // console.log(
    //   "[Interval Effect] Starting interval to fetch today's screen time every minute."
    // );
    // Initial fetch
    fetchTodayScreenTime();
    const interval = setInterval(() => {
      //   console.log(
      //     "[Interval Effect] Interval tick: fetching today's screen time..."
      //   );
      fetchTodayScreenTime();
    }, 60000);
    return () => {
      //   console.log(
      //     "[Interval Effect] Clearing interval for fetching screen time."
      //   );
      clearInterval(interval);
    };
  }, [db, fetchTodayScreenTime]);

  return { timeCount };
};

export default useTimeCount;
