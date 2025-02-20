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
    const today = new Date();
    return today.getTime() - today.getTimezoneOffset() * 60000;
  }, []);

  // Load the SQLite database and create the table if not already created
  useEffect(() => {
    (async () => {
      const dbInstance = await Database.load("sqlite:testUserScreenTime.db");
      await dbInstance.execute(`
        CREATE TABLE IF NOT EXISTS time_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          first_timestamp INTEGER NOT NULL,
          second_timestamp INTEGER NOT NULL
        );
      `);
      dbRef.current = dbInstance;
    })();
  }, []);

  // Insert a new record for the given date
  const initializeNewDate = useCallback(
    async (date: string) => {
      if (!dbRef.current) return;
      const timestamp = getCurrentLocalTimestamp();
      await dbRef.current.execute(
        "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
        [date, timestamp, timestamp]
      );
    },
    [getCurrentLocalTimestamp]
  );

  // Update the last record’s `second_timestamp` for the given date
  const updateLastTimeData = useCallback(
    async (date: string) => {
      if (!dbRef.current) return;
      const timestamp = getCurrentLocalTimestamp();

      // Get the latest record for the day
      const result = await dbRef.current.select(
        "SELECT id, first_timestamp, second_timestamp FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1",
        [date]
      );

      if (result.length > 0) {
        const { id, first_timestamp, second_timestamp } = result[0];

        // Only update if the new timestamp is greater than the current second_timestamp
        if (timestamp >= second_timestamp && timestamp >= first_timestamp) {
          await dbRef.current.execute(
            "UPDATE time_data SET second_timestamp = ? WHERE id = ?",
            [timestamp, id]
          );
        }
      }
    },
    [getCurrentLocalTimestamp]
  );

  // Initialize time data on component mount
  useEffect(() => {
    const initializeTimeData = async () => {
      if (!dbRef.current) return;
      const currentDate = getCurrentDate();
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
      if (currentDate !== dateRef.current) {
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
