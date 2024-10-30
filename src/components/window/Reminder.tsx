import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";

const appWindow = getCurrentWebviewWindow();

const store = await load("store.json", { autoSave: false });
const Reminder = () => {
  const [timeLeft, setTimeLeft] = useState<number>(20);

  useEffect(() => {
    const fetchDuration = async () => {
      const storedDuration = await store.get<number>(
        "blinkEyeReminderDuration"
      );
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
    <div className="bg-black text-white flex flex-col items-center justify-center h-screen w-screen">
      <div className="text-6xl font-bold mb-8">Reminder: Take a break!</div>
      <div className="text-4xl mb-8">Time left: {timeLeft} seconds</div>
      <Button
        onClick={() => appWindow.close()}
        className="bg-white text-black hover:bg-gray-200 text-xl py-2 px-4"
      >
        Skip This Time
      </Button>
    </div>
  );
};

export default Reminder;
