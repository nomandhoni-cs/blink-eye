import toast from "react-hot-toast";
import type { OnboardingData, TodoItem } from "../types/onboarding";
import { load } from "@tauri-apps/plugin-store";
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

// Dummy functions for future database integration
export class OnboardingService {
  // Screen 1: Welcome - No data to save
  static async saveWelcomeData(): Promise<void> {
    console.log("💾 Saving welcome screen data...");

    try {
      // Check if database file exists
      const dbFileExists = await exists("basicapplicationdata.db", {
        baseDir: BaseDirectory.AppData,
      });

      if (!dbFileExists) {
        // Database doesn't exist, create it
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
        console.log("Database already exists, skipping initialization.");
      }

      console.log("✅ Welcome data saved");
    } catch (error) {
      console.error("Error in saveWelcomeData:", error);
      throw error;
    }
  }

  // Screen 2: Break Configuration
  static async saveBreakConfiguration(data: {
    breakInterval: number;
    breakDuration: number;
    customInterval: string;
    customDuration: string;
    reminderText: string;
  }): Promise<void> {
    console.log("💾 Saving break configuration...", data);
    // TODO: Save to database
    if (data.breakInterval <= 0) {
      toast.error("Interval must be greater than 0 minutes.");
      return;
    }
    if (data.breakDuration <= 0) {
      toast.error("Duration must be greater than 0 seconds.");
      return;
    }
    const store = await load("store.json", { autoSave: false });
    await store.set("blinkEyeReminderDuration", data.breakDuration);
    await store.set("blinkEyeReminderInterval", data.breakInterval);
    await store.set("blinkEyeReminderScreenText", data.reminderText);
    await store.save();
    console.log("✅ Break configuration saved");
  }

  // Screen 3: Todo List
  static async saveTodoList(todos: TodoItem[]): Promise<void> {
    console.log("💾 Saving todo list...", todos);
    // TODO: Save to database
    // await db.todos.createMany({ data: todos })
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("✅ Todo list saved");
  }

  // Screen 4: License Activation
  static async saveLicenseKey(licenseKey: string): Promise<void> {
    console.log("💾 Saving license key...", licenseKey);
    // TODO: Validate and save license
    // const isValid = await validateLicense(licenseKey)
    // if (isValid) await db.user.update({ licenseKey })
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("✅ License key saved");
  }

  // Final onboarding completion
  static async completeOnboarding(data: OnboardingData): Promise<void> {
    console.log("🎉 Completing onboarding...", data);
    // TODO: Mark onboarding as complete, send analytics, etc.
    // Update database to mark onboarding as completed
    const db = await Database.load("sqlite:appconfig.db");
    const existingRow = await db.select(
      "SELECT * FROM config WHERE key = 'isUserOnboarded'"
    );
    if ((existingRow as any[]).length > 0) {
      await db.execute(
        "UPDATE config SET value = 'true' WHERE key = 'isUserOnboarded'"
      );
    } else {
      await db.execute(
        "INSERT INTO config (key, value) VALUES ('isUserOnboarded', 'true')"
      );
    }
    window.location.href = "/";
    console.log("✅ Onboarding completed successfully!");
  }
}
