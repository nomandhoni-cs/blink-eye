import { useEffect } from "react";
import { BaseDirectory } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";
import { migrateScreenTimeToSQLite } from "../lib/migrateScreenTimeToSQLite";

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
        await db.execute(`INSERT INTO config (key, value) VALUES (?, ?);`, [
          "useCircleProgressTimerStyle",
          "true",
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
          "Pause! Look into the distance, and best if you walk a bit."
        );
        await store.set("screenOnTimeLimit", 8);
        await store.save();
      } else {
        console.log("Store already exists. No action needed.");
      }

      //! Creating Initial Local Tasks Data
      const LocalTodoListExist = await exists("UserLocalTodoList.db", {
        baseDir: BaseDirectory.AppData,
      });

      if (!LocalTodoListExist) {
        const localTaskListDb = await Database.load(
          `sqlite:UserLocalTodoList.db`
        );
        await localTaskListDb.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          details TEXT,
          deadline TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        );
      `);
      }
      // Checking License DB, if not exist then create one

      const licenseDBFileExist = await exists("blink_eye_license.db", {
        baseDir: BaseDirectory.AppData,
      });
      if (!licenseDBFileExist) {
        const licenseDB = await Database.load("sqlite:blink_eye_license.db");
        await licenseDB.execute(`
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY,
          license_key TEXT UNIQUE,
          status TEXT,
          activation_limit TEXT,
          activation_usage TEXT,
          created_at TEXT,
          expires_at TEXT,
          test_mode TEXT,
          instance_name TEXT,
          store_id TEXT,
          order_id TEXT,
          order_item_id TEXT,
          variant_name TEXT,
          product_name TEXT,
          customer_name TEXT,
          customer_email TEXT,
          last_validated TEXT
        );
      `);
      }

      // Call the migration function on startup.
      // It will check the flag and run only if the migration hasn't been done.
      migrateScreenTimeToSQLite();
    };

    setupDatabase();
  }, []);

  return null; // This component does not render anything
};

export default ConfigDataLoader;
