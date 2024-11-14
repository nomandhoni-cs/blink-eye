import React, { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { nanoid } from "nanoid";
import Database from "@tauri-apps/plugin-sql";

// Define a type for the result row
interface UserDataRow {
  id: string;
  data: string | null;
}

const EncryptionComponent: React.FC = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [userId, setUserId] = useState<string>("");

  // Initialize DB and create user ID
  useEffect(() => {
    const setupDatabase = async () => {
      const dbFileExists = await exists("basicapplicationdata.db", {
        baseDir: BaseDirectory.AppData,
      });

      const dbInstance = await Database.load("sqlite:basicapplicationdata.db");
      setDb(dbInstance);

      if (!dbFileExists) {
        // Generate a unique ID
        const uniqueId = nanoid();
        setUserId(uniqueId);

        // Create table and insert the unique ID
        await dbInstance.execute(`
          CREATE TABLE IF NOT EXISTS user_data (
            id TEXT PRIMARY KEY,
            data TEXT
          );
        `);
        await dbInstance.execute(
          "INSERT INTO user_data (id, data) VALUES ($1, '')",
          [uniqueId]
        );
      } else {
        // Retrieve existing user ID and stored encrypted data, if any
        const result = (await dbInstance.select(
          "SELECT id, data FROM user_data"
        )) as UserDataRow[];
        if (result.length) {
          setUserId(result[0].id);
        }
      }
    };

    setupDatabase();
  }, []);

  // Encrypt current date and store it in the DB
  useEffect(() => {
    const encryptAndStoreDate = async () => {
      if (!db || !userId) {
        alert("Database or User ID not initialized.");
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const encryptedDate = btoa(currentDate); // Base64 encode the date as a simple encryption method

      // Store encrypted date
      await db.execute("UPDATE user_data SET data = $1 WHERE id = $2", [
        encryptedDate,
        userId,
      ]);
    };

    if (userId) {
      encryptAndStoreDate();
    }
  }, [userId, db]);

  return <></>;
};

export default EncryptionComponent;
