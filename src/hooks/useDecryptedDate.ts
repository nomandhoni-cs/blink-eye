import { useEffect, useState } from "react";
// import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { decryptData } from "../lib/cryptoUtils";

interface DecryptedData {
  decryptedDate: string | null;
}

const useDecryptedDate = (): DecryptedData => {
  const [decryptedDate, setDecryptedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecryptedDate = async () => {
      // const dbFileExists = await exists("basicapplicationdata.db", {
      //   baseDir: BaseDirectory.AppData,
      // });
      // if (dbFileExists) {
      const dbInstance = await Database.load("sqlite:basicapplicationdata.db");

      const result = (await dbInstance.select(
        "SELECT unique_nano_id, data FROM user_data WHERE id = 1"
      )) as [{ unique_nano_id: string; data: string | null }];

      if (result.length && result[0].data && result[0].unique_nano_id) {
        try {
          // Decrypt data with unique_nano_id as the password
          const decryptedDate = await decryptData(result[0].data);
          setDecryptedDate(decryptedDate);
        } catch (error) {
          console.error("Decryption failed:", error);
        }
      }
      // }
    };

    fetchDecryptedDate();
  }, []);
  return { decryptedDate };
};

export default useDecryptedDate;
