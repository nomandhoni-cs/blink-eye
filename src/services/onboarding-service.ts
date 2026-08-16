import toast from "react-hot-toast";
import type { OnboardingData } from "../types/onboarding";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { getVersion } from "@tauri-apps/api/app";
import { fetch } from "@tauri-apps/plugin-http";
import { platform } from "@tauri-apps/plugin-os";
import { saveTokens } from "../lib/authUtils";

const handshakePassword = import.meta.env.VITE_HANDSHAKE_PASSWORD;

export class OnboardingService {
  // Screen 1: Welcome — install data is already ensured by Rust at startup;
  // this call is a safety net for the trial/license flow.
  static async saveWelcomeData(): Promise<void> {
    await invoke("ensure_install_data");
  }

  // Screen 3: Break configuration
  static async saveBreakConfiguration(data: {
    breakInterval: number;
    breakDuration: number;
    reminderText: string;
  }): Promise<void> {
    if (data.breakInterval <= 0) {
      throw new Error("Interval must be greater than 0 minutes.");
    }
    if (data.breakDuration <= 0) {
      throw new Error("Duration must be greater than 0 seconds.");
    }
    await invoke("update_reminder_setting", {
      key: "blinkEyeReminderInterval",
      value: String(data.breakInterval),
    });
    await invoke("update_reminder_setting", {
      key: "blinkEyeReminderDuration",
      value: String(data.breakDuration),
    });
    await invoke("update_reminder_setting", {
      key: "blinkEyeReminderScreenText",
      value: data.reminderText,
    });
    // Required: reload settings in the running Rust scheduler.
    await invoke("refresh_reminder_scheduler_settings");
  }

  // Final onboarding completion.
  // User-info registration is best-effort: onboarding always completes and
  // redirects, even if the network call fails.
  static async completeOnboarding(data: OnboardingData): Promise<void> {
    try {
      const getAppVersion = await getVersion();
      const operatingSystem = platform();

      // The install identity DB is not exposed through Rust commands,
      // so it is read directly here.
      const dbInstance = await Database.load("sqlite:basicapplicationdata.db");

      interface UserData {
        unique_nano_id: string;
      }

      const userResult = await dbInstance.select<UserData[]>(
        "SELECT unique_nano_id FROM user_data WHERE id = 1"
      );

      const userUniqueNanoId = userResult[0]?.unique_nano_id;

      const response = await fetch("https://api.blinkeye.app/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handshakePassword: handshakePassword,
          userID: userUniqueNanoId,
          userDevice: operatingSystem,
          userLocale: Intl.DateTimeFormat().resolvedOptions().timeZone,
          installedTime: new Date().toISOString(),
          appVersion: getAppVersion,
          ...(data.email && { email: data.email }),
        }),
      });

      if (response.ok) {
        const resultData = await response.json();
        if (
          resultData.success &&
          resultData.accessToken &&
          resultData.refreshToken
        ) {
          await saveTokens(resultData.accessToken, resultData.refreshToken);
        }
      }
    } catch (error) {
      console.error("Failed to register user info:", error);
      toast.error("Couldn't reach the server. Setup finished anyway.", {
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      await invoke("update_reminder_setting", {
        key: "isUserOnboarded",
        value: "true",
      });
      window.location.href = "/";
    }
  }
}
