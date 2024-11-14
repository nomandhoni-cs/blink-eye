import { useEffect, useState } from "react";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

interface DecryptedData {
  decryptedDate: string | null;
}

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
          "SELECT data FROM user_data LIMIT 1"
        )) as [{ data: string | null }];

        if (result.length && result[0].data) {
          const decryptedDate = atob(result[0].data); // Decrypt the data by base64 decoding
          setDecryptedDate(decryptedDate);
        }
      }
    };

    fetchDecryptedDate();
  }, []);

  return { decryptedDate };
};

export default useDecryptedDate;
