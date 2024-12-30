import React, { useEffect } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { nanoid } from "nanoid";
import Database from "@tauri-apps/plugin-sql";
import { encryptData } from "../lib/cryptoUtils";

// Define a type for the result row
interface UserDataRow {
  id: number;
  unique_nano_id: string;
  data: string | null;
}

const EncryptionComponent: React.FC = () => {
  // Initialize DB and create user entry with static ID and unique nano ID
  useEffect(() => {
    const setupDatabase = async () => {
      const dbFileExists = await exists("basicapplicationdata.db", {
        baseDir: BaseDirectory.AppData,
      });
      if (!dbFileExists) {
        const dbInstance = await Database.load(
          "sqlite:basicapplicationdata.db"
        );

        // Create the table if it doesn't exist
        await dbInstance.execute(`
        CREATE TABLE IF NOT EXISTS user_data (
          id INTEGER PRIMARY KEY,
          unique_nano_id TEXT,
          data TEXT
        );
      `);

        // Check if entry with id=1 exists
        const result = (await dbInstance.select(
          "SELECT id FROM user_data WHERE id = 1"
        )) as UserDataRow[];

        if (result.length === 0) {
          // Generate a unique nano ID
          const uniqueNanoId = nanoid();

          // Encrypt the current date in YYYY-MM-DD format
          const currentDate = new Date().toISOString().split("T")[0];
          const encryptedData = await encryptData(currentDate, uniqueNanoId);

          // Insert the new record with id=1
          await dbInstance.execute(
            "INSERT INTO user_data (id, unique_nano_id, data) VALUES (1, $1, $2)",
            [uniqueNanoId, JSON.stringify(encryptedData)]
          );
        } else {
          console.log("Entry with id=1 already exists.");
        }
      } else {
        return 0;
      }
    };

    setupDatabase();
  }, []);

  return <></>;
};

export default EncryptionComponent;
