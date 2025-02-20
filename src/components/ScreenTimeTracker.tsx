import { useEffect, useRef, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";

const ScreenTimeTracker = () => {
  const dbRef = useRef<any>(null);
  const dateRef = useRef<string | null>(null);

  // Get current date in 'YYYY-MM-DD' format
  const getCurrentDate = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Get current timestamp adjusted for local time
  const getCurrentLocalTimestamp = useCallback(() => {
    const now = new Date();
    return now.getTime() - now.getTimezoneOffset() * 60000;
  }, []);

  // Load the SQLite database and create the table if not already created
  useEffect(() => {
    (async () => {
      const dbInstance = await Database.load("sqlite:UserScreenTime.db");
      await dbInstance.execute(`
        CREATE TABLE IF NOT EXISTS time_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          first_timestamp INTEGER NOT NULL,
          second_timestamp INTEGER NOT NULL
        );
      `);
      // console.log("[DB] Database loaded and table ensured.");
      dbRef.current = dbInstance;
    })();
  }, []);

  // Insert a new record for the given date
  const initializeNewDate = useCallback(
    async (date: string) => {
      if (!dbRef.current) return;
      const timestamp = getCurrentLocalTimestamp();
      // console.log(
      //   `[initializeNewDate] Inserting new row for date ${date} with timestamp ${timestamp}`
      // );
      await dbRef.current.execute(
        "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
        [date, timestamp, timestamp]
      );
    },
    [getCurrentLocalTimestamp]
  );

  // Update the last record’s `second_timestamp` for the given date
  // If the new timestamp is not greater than both first_timestamp and second_timestamp,
  // and if first_timestamp > second_timestamp (indicating manual time change),
  // insert a new row for today.
  const updateLastTimeData = useCallback(
    async (date: string) => {
      if (!dbRef.current) return;
      const timestamp = getCurrentLocalTimestamp();
      // console.log(
      //   `[updateLastTimeData] Updating record for date ${date} with timestamp ${timestamp}`
      // );

      // Get the latest record for the day
      const result: any[] = await dbRef.current.select(
        "SELECT id, first_timestamp, second_timestamp FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1",
        [date]
      );

      if (result.length > 0) {
        const { id, first_timestamp, second_timestamp } = result[0];
        // console.log(
        //   `[updateLastTimeData] Latest record: id=${id}, first_timestamp=${first_timestamp}, second_timestamp=${second_timestamp}`
        // );
        // Valid update condition: new timestamp is greater than both timestamps.
        if (timestamp >= second_timestamp && timestamp >= first_timestamp) {
          // console.log(
          //   `[updateLastTimeData] Condition met. Updating record id ${id}.`
          // );
          await dbRef.current.execute(
            "UPDATE time_data SET second_timestamp = ? WHERE id = ?",
            [timestamp, id]
          );
        } else if (first_timestamp > second_timestamp) {
          // If the first timestamp is greater than second_timestamp,
          // then we assume the user manually changed the time.
          // console.log(
          //   "[updateLastTimeData] Manual time change detected. Inserting new row."
          // );
          await initializeNewDate(date);
        } else {
          // console.log(
          //   "[updateLastTimeData] Update condition not met and manual time change not detected. No action taken."
          // );
        }
      } else {
        // console.log(
        //   "[updateLastTimeData] No record found for date. Inserting new row."
        // );
        await initializeNewDate(date);
      }
    },
    [getCurrentLocalTimestamp, initializeNewDate]
  );

  // Initialize time data on component mount
  useEffect(() => {
    const initializeTimeData = async () => {
      if (!dbRef.current) return;
      const currentDate = getCurrentDate();
      // console.log(
      //   `[initializeTimeData] Initializing time data for ${currentDate}`
      // );
      await initializeNewDate(currentDate);
      dateRef.current = currentDate;
    };

    initializeTimeData();
  }, [initializeNewDate, getCurrentDate]);

  // Timer to update time data every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentDate = getCurrentDate();

      // If the date has changed, initialize new date data
      if (currentDate !== (dateRef.current ?? "")) {
        // console.log(
        //   `[Interval] Date changed from ${dateRef.current} to ${currentDate}`
        // );
        await initializeNewDate(currentDate);
        dateRef.current = currentDate;
        return;
      }

      // Update the latest record for the current date
      await updateLastTimeData(currentDate);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getCurrentDate, initializeNewDate, updateLastTimeData]);

  return null; // No UI
};

export default ScreenTimeTracker;
