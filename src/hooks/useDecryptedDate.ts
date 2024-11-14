import { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

interface DecryptedData {
  decryptedDate: string | null;
}

// Decrypt function
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

const useDecryptedDate = (): DecryptedData => {
  const [decryptedDate, setDecryptedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecryptedDate = async () => {
      const dbFileExists = await exists("basicapplicationdata.db", {
        baseDir: BaseDirectory.AppData,
      });
      if (dbFileExists) {
        const dbInstance = await Database.load(
          "sqlite:basicapplicationdata.db"
        );

        const result = (await dbInstance.select(
          "SELECT unique_nano_id, data FROM user_data WHERE id = 1"
        )) as [{ unique_nano_id: string; data: string | null }];

        if (result.length && result[0].data && result[0].unique_nano_id) {
          try {
            // Decrypt data with unique_nano_id as the password
            const decryptedDate = await decryptData(
              result[0].data,
              result[0].unique_nano_id
            );
            setDecryptedDate(decryptedDate);
          } catch (error) {
            console.error("Decryption failed:", error);
          }
        }
      }
    };

    fetchDecryptedDate();
  }, []);
  return { decryptedDate };
};

export default useDecryptedDate;
