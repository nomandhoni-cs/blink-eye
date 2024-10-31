import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import CurrentTime from "../CurrentTime";

const appWindow = getCurrentWebviewWindow();

const Reminder = () => {
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [reminderText, setStoredReminderText] = useState<string>("");

  useEffect(() => {
    const fetchDuration = async () => {
      const store = await load("store.json", { autoSave: false });
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );

      const storedReminderText = await store.get<string>(
        "blinkEyeReminderScreenText"
      );
      if (
        typeof storedReminderText === "string" &&
        storedReminderText.length > 0
      ) {
        setStoredReminderText(storedReminderText);
      }
      if (typeof storedDuration === "number") {
        setTimeLeft(storedDuration);
      }
    };
    fetchDuration();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      appWindow.close();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="bg-black text-white h-screen w-screen flex items-center justify-center relative">
      {/* Centered at 50% height */}
      <div className="absolute top-[40%] transform -translate-y-1/2 flex flex-col items-center">
        <div className="text-[240px] font-semibold">{timeLeft}s</div>
      </div>

      {/* Positioned from 50% to 70% height */}
      <div className="absolute top-[70%] transform -translate-y-1/2 flex flex-col items-center space-y-8">
        <div className="flex justify-center items-center space-x-4">
          <CurrentTime />
          {/* <CurrentTime />  */}
        </div>
        <div className="text-5xl font-semibold text-center px-4">
          {reminderText
            ? reminderText
            : "Look 20 feet far away to protect your eyes."}
        </div>
        <Button
          onClick={() => appWindow.close()}
          className="bg-[#FE4C55] text-black rounded-full hover:bg-[#e9464e] text-base px-6 space-x-2 flex items-center"
        >
          <span>Skip this Time</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default Reminder;
