import { useEffect, useState, useRef, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";

interface TimeStamp {
  firstTimestamp: number;
  secondTimestamp: number;
}

const useSQLTimeCount = (): TimeStamp[] => {
  const [timeDatas, setTimeDatas] = useState<TimeStamp[]>([]);
  const [db, setDb] = useState<any>(null);
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

  // Load the SQLite database and create the table if needed.
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
      setDb(dbInstance);
    })();
  }, []);

  // Insert a new record for the given date and return all records for that date.
  const initializeNewDate = useCallback(
    async (date: string): Promise<TimeStamp[]> => {
      if (!db) return [];
      const timestamp = getCurrentLocalTimestamp();
      await db.execute(
        "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
        [date, timestamp, timestamp]
      );
      const result = await db.select(
        "SELECT first_timestamp, second_timestamp FROM time_data WHERE date = ?",
        [date]
      );
      return result.map((row: any) => ({
        firstTimestamp: row.first_timestamp,
        secondTimestamp: row.second_timestamp,
      }));
    },
    [db, getCurrentLocalTimestamp]
  );

  // Update the last record’s second_timestamp for the given date.
  const updateLastTimeData = useCallback(
    async (date: string): Promise<TimeStamp[]> => {
      if (!db) return [];
      const timestamp = getCurrentLocalTimestamp();
      // Get the most recent record for the day.
      const result = await db.select(
        "SELECT id FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1",
        [date]
      );
      if (result.length > 0) {
        const id = result[0].id;
        await db.execute(
          "UPDATE time_data SET second_timestamp = ? WHERE id = ?",
          [timestamp, id]
        );
      }
      const updatedRows = await db.select(
        "SELECT first_timestamp, second_timestamp FROM time_data WHERE date = ?",
        [date]
      );
      return updatedRows.map((row: any) => ({
        firstTimestamp: row.first_timestamp,
        secondTimestamp: row.second_timestamp,
      }));
    },
    [db, getCurrentLocalTimestamp]
  );

  // Initialize time data when the database is ready and the component mounts.
  useEffect(() => {
    const initializeTimeData = async () => {
      if (!db) return;
      const currentDate = getCurrentDate();
      const currentDateData = await initializeNewDate(currentDate);
      setTimeDatas(currentDateData);
      dateRef.current = currentDate;
    };

    initializeTimeData();
  }, [db, getCurrentDate, initializeNewDate]);

  // Timer to update the current time data every minute.
  useEffect(() => {
    if (!db) return;
    const interval = setInterval(async () => {
      const currentDate = getCurrentDate();
      // Check if the date has changed (i.e. midnight passed)
      if (currentDate !== (dateRef.current ?? "")) {
        console.log("Date changed from", dateRef.current, "to", currentDate);
        const newDateData = await initializeNewDate(currentDate);
        setTimeDatas(newDateData);
        dateRef.current = currentDate;
        return;
      }

      // Update the last record for the current date.
      const updatedData = await updateLastTimeData(currentDate);
      setTimeDatas(updatedData);
      console.log(getCurrentLocalTimestamp(), "Updated time data", updatedData);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [
    db,
    getCurrentDate,
    getCurrentLocalTimestamp,
    initializeNewDate,
    updateLastTimeData,
  ]);

  return timeDatas;
};

export default useSQLTimeCount;
