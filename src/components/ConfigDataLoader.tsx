import { useEffect } from "react";
import { BaseDirectory } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

const ConfigDataLoader: React.FC = () => {
  const defaultWorkday = {
    Monday: { start: "09:00", end: "17:00" },
    Tuesday: { start: "09:00", end: "17:00" },
    Wednesday: { start: "09:00", end: "17:00" },
    Thursday: { start: "09:00", end: "17:00" },
    Friday: { start: "09:00", end: "17:00" },
    Saturday: null,
    Sunday: null,
  };

  useEffect(() => {
    const setupDatabase = async () => {
      // Check if the database file exists
      const dbExists = await exists("appconfig.db", {
        baseDir: BaseDirectory.AppData,
      });

      // Initialize the database
      const db = await Database.load("sqlite:appconfig.db");

      if (!dbExists) {
        console.log("Database does not exist. Initializing...");

        // Create the tables
        await db.execute(`
          CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT
          );
        `);

        // Insert default values
        await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
          "blinkEyeWorkday",
          JSON.stringify(defaultWorkday),
        ]);
        await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
          "isWorkdayEnabled",
          "false",
        ]);

        console.log("Database initialized with default configuration.");
      } else {
        console.log("Database already exists. No action needed.");
      }
    };

    setupDatabase();
  }, []);

  return null; // This component does not render anything
};

export default ConfigDataLoader;
