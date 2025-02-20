import Database from "@tauri-apps/plugin-sql";
import { load } from "@tauri-apps/plugin-store";

interface TimeStamp {
  firstTimestamp: number;
  secondTimestamp: number;
}

interface TimeData {
  [date: string]: TimeStamp[];
}

/**
 * Migrates the usage time data from a JSON store (userScreenOnTime.json)
 * into a SQLite database (testUserScreenTime.db). The JSON store is expected
 * to have two keys: "timeData" containing the records and
 * "isUsageTimeMigratedToSQLite" which is a boolean flag indicating if the
 * migration has already been performed.
 */
export async function migrateScreenTimeToSQLite(): Promise<void> {
  try {
    // Load the JSON store
    const store = await load("userScreenOnTime.json", { autoSave: false });
    const isMigrated: boolean =
      (await store.get("isUsageTimeMigratedToSQLite")) || false;

    if (isMigrated) {
      console.log("Usage time data has already been migrated to SQLite.");
      return;
    }

    // Load existing JSON time data
    const jsonTimeData: TimeData = (await store.get("timeData")) || {};

    // Load the SQLite database and create the table if it doesn't exist
    const db = await Database.load("sqlite:testUserScreenTime.db");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        first_timestamp INTEGER NOT NULL,
        second_timestamp INTEGER NOT NULL
      );
    `);

    // Begin a transaction (assuming your plugin supports it)
    await db.execute("BEGIN TRANSACTION;");

    try {
      // Iterate over each date in the JSON data and insert the timestamps
      for (const date in jsonTimeData) {
        if (Object.prototype.hasOwnProperty.call(jsonTimeData, date)) {
          const timestamps = jsonTimeData[date];
          for (const ts of timestamps) {
            // Ensure secondTimestamp is never less than firstTimestamp
            const firstTimestamp = ts.firstTimestamp;
            const secondTimestamp =
              ts.secondTimestamp >= firstTimestamp
                ? ts.secondTimestamp
                : firstTimestamp;

            await db.execute(
              "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
              [date, firstTimestamp, secondTimestamp]
            );
          }
        }
      }

      // Commit the transaction if all inserts succeed
      await db.execute("COMMIT;");
    } catch (insertError) {
      // Rollback if any error occurs during inserts
      await db.execute("ROLLBACK;");
      throw insertError;
    }

    // Mark the migration as complete in the JSON store
    await store.set("isUsageTimeMigratedToSQLite", true);
    await store.save();

    console.log("Migration to SQLite completed successfully.");
  } catch (error) {
    console.error("Failed to migrate usage time data:", error);
  }
}
