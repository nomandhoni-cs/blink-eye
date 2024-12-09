import { useEffect } from "react";
import { BaseDirectory } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";

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

      if (!dbExists) {
        const db = await Database.load("sqlite:appconfig.db");
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
        await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
          "isUpdateAvailable",
          "false",
        ]);
        await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
          "usingStrictMode",
          "false",
        ]);
        // await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
        //   "showPauseButton",
        //   "false",
        // ]);
        console.log("Database initialized with default configuration.");
      } else {
        console.log("Database already exists. No action needed.");
      }

      const storeExists = await exists("store.json", {
        baseDir: BaseDirectory.AppData,
      });
      if (!storeExists) {
        const store = await load("store.json", { autoSave: false });
        await store.set("blinkEyeReminderDuration", 20);
        await store.set("blinkEyeReminderInterval", 20);
        await store.set(
          "blinkEyeReminderScreenText",
          "Look 20 feet away to protect your eyes."
        );
        await store.set("screenOnTimeLimit", 8);
        await store.save();
      } else {
        console.log("Store already exists. No action needed.");
      }
    };

    setupDatabase();
  }, []);

  return null; // This component does not render anything
};

export default ConfigDataLoader;
