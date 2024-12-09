import { exists } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

// Function to retrieve the password (unique_nano_id) from the database
const getPasswordFromDatabase = async () => {
  const dbFileExists = await exists("basicapplicationdata.db", {
    baseDir: BaseDirectory.AppData,
  });

  if (dbFileExists) {
    const dbInstance = await Database.load("sqlite:basicapplicationdata.db");

    const result = (await dbInstance.select(
      "SELECT unique_nano_id FROM user_data WHERE id = 1"
    )) as [{ unique_nano_id: string }];

    if (result.length && result[0].unique_nano_id) {
      return result[0].unique_nano_id;
    } else {
      throw new Error("No unique nano ID found in the database");
    }
  } else {
    throw new Error("Database file does not exist");
  }
};

// Encrypt function that automatically fetches the password (unique_nano_id)
export const encryptData = async (plainText: string) => {
  const password = await getPasswordFromDatabase();
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

// Decrypt function that automatically fetches the password (unique_nano_id)
export const decryptData = async (encryptedText: string) => {
  const password = await getPasswordFromDatabase();
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
