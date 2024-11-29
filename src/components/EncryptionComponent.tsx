import React, { useEffect } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { nanoid } from "nanoid";
import Database from "@tauri-apps/plugin-sql";

// Define a type for the result row
interface UserDataRow {
  id: number;
  unique_nano_id: string;
  data: string | null;
}

interface EncryptionComponentProps {
  onSetupComplete: () => void; // Callback to notify parent component
}

// Encryption function
const encryptData = async (plainText: string, password: string) => {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encodedPassword,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("unique_salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedText
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedBuffer)),
  };
};

const EncryptionComponent: React.FC<EncryptionComponentProps> = ({
  onSetupComplete,
}) => {
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
      }

      // Notify the parent that the setup is complete
      onSetupComplete();
    };

    setupDatabase();
  }, [onSetupComplete]);

  return null; // No UI needed for this component
};

export default EncryptionComponent;
