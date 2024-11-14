import React, { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { Button } from "./ui/button";
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
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [decryptedDate, setDecryptedDate] = useState<string | null>(null);

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
          if (result[0].data) {
            setEncryptedData(result[0].data);
          }
        }
      }
    };

    setupDatabase();
  }, []);

  // AES Encryption function
  const encryptData = async (plainText: string, password: string) => {
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);

    // Generate key from password using PBKDF2
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

  // AES Decryption function
  const decryptData = async (encryptedText: string, password: string) => {
    const { iv, data } = JSON.parse(encryptedText);
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
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data).buffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  };

  // Encrypt current date and store it in the DB
  const handleEncryptAndStoreDate = async () => {
    if (!db || !userId) {
      alert("Database or User ID not initialized.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const encryptedResult = await encryptData(currentDate, userId);

    const encryptedString = JSON.stringify(encryptedResult);
    setEncryptedData(encryptedString);

    await db.execute("UPDATE user_data SET data = $1 WHERE id = $2", [
      encryptedString,
      userId,
    ]);
  };

  // Decrypt and display the stored encrypted data
  const handleDecryptData = async () => {
    if (!encryptedData) {
      alert("No encrypted data found.");
      return;
    }

    const decrypted = await decryptData(encryptedData, userId);
    setDecryptedDate(decrypted);
  };

  return (
    <div className="p-6 space-y-4 rounded-lg">
      <h2 className="text-xl font-semibold">Encrypt and Store User Data</h2>
      <p>User Unique ID: {userId}</p>

      <Button onClick={handleEncryptAndStoreDate}>
        Encrypt and Store Current Date
      </Button>

      {encryptedData && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Encrypted Data</h3>
          <p className="text-sm text-gray-600">{encryptedData}</p>
        </div>
      )}

      <Button onClick={handleDecryptData} disabled={!encryptedData}>
        Decrypt Stored Data
      </Button>

      {decryptedDate && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Decrypted Date</h3>
          <p className="text-gray-800">{decryptedDate}</p>
        </div>
      )}
    </div>
  );
};

export default EncryptionComponent;
