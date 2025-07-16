import { useEffect, useState } from "react";
import cat_gif_paw from "../../assets/cute_cat_paw.gif";
import logo from "../../assets/newIcon.png";
import { Button } from "../ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { XIcon } from "lucide-react";

type Reminder = {
  day: number;
  remindMsg: string;
};

// Type definition for the schedule object containing the array of reminders
type RemindSchedule = {
  remindSchedule: Reminder[];
};

// The constant variable with the defined type and updated messages
const remindScheduleData: RemindSchedule = {
  remindSchedule: [
    {
      day: 1,
      remindMsg: "Hit snooze on this → See you tomorrow",
    },
    {
      day: 2,
      remindMsg: "Let's circle back in 48 hours",
    },
    {
      day: 3,
      remindMsg: "Park this for 3 days, I'll ping you then",
    },
    {
      day: 4,
      remindMsg: "Give me a week to think about it",
    },
    {
      // Assuming today is a weekday, this pushes it to next week
      day: 5,
      remindMsg: "How about we tackle this next week?",
    },
    {
      day: 6,
      remindMsg: "Let's revisit this in 6 days",
    },
    {
      day: 7,
      remindMsg: "I need some space... see you next week",
    },
  ],
};

const Support = () => {
  const [lastRemindDay, setLastRemindDay] = useState("");
  const [closeBtnText, setCloseBtnText] = useState("");
  const [nextReminderDay, setNextReminderDay] = useState("");

  useEffect(() => {
    // Select a random reminder from the schedule
    const randomIndex = Math.floor(
      Math.random() * remindScheduleData.remindSchedule.length
    );
    const randomReminder = remindScheduleData.remindSchedule[randomIndex];

    // Set the button text from the random reminder message
    setCloseBtnText(randomReminder.remindMsg);

    // Calculate the next reminder date
    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + randomReminder.day);

    // Set the next reminder date state, formatted as YYYY-MM-DD
    setNextReminderDay(nextDate.toISOString().split("T")[0]);
  }, []); // Empty dependency array ensures this runs only once on mount.

  const handleClose = async () => {
    const appConfigDatabase = Database.load("sqlite:appconfig.db");
    (await appConfigDatabase).execute(
      "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?",
      ["nextReminderDay", nextReminderDay, nextReminderDay] // Pass nextReminderDay twice for the UPDATE part
    );
    const window = await getCurrentWebviewWindow();
    window.close();
  };
  return (
    <div className="animate-in slide-in-from-top  relative w-[600px] h-[260px] rounded-sm bg-black border-4 border-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="flex items-center justify-center gap-1">
        <img src={logo} className="h-4 w-4" alt="Blink Eye Logo" />
        <span className="text-white font-heading">Blink Eye</span>
      </div>
      {/* Cat GIF */}
      <div
        onClick={handleClose}
        className="absolute -top-1 -left-1 overflow-hidden rounded-br-lg bg-white  h-8 w-8 flex items-center justify-center hover:cursor-pointer"
      >
        <XIcon className="h-4 w-4 text-gray-600 hover:text-black hover:animate-spin" />
      </div>
      <img
        src={cat_gif_paw}
        alt="Cute cat waving"
        width="300px"
        className="absolute top-8 right-8 translate-x-1/4 -translate-y-1/4" // Position and slightly offset to match the image
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-white text-2xl font-heading leading-tight opacity-80">
          Get A License Please
          <br />
          to Support the Developer
        </h1>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-white text-sm font-heading opacity-80">
            Starts
          </span>
          <span className="text-[#00E676] text-5xl font-heading">$9.99</span>
        </div>
        <Button className="bg-[#00E676] hover:bg-[#00C853] text-black font-heading py-3 px-8 rounded-xl text-lg shadow-lg transition-colors duration-200">
          <a href="https://blinkeye.app/en/pricing" target="_blank">
            Support the Developer
          </a>
        </Button>
        <p
          className="text-red-500 text-sm font-medium cursor-pointer hover:underline opacity-90 hover:opacity-100"
          onClick={handleClose}
        >
          {closeBtnText} + {nextReminderDay}
        </p>
      </div>
    </div>
  );
};
export default Support;
