import { useEffect, useState } from "react";
import AutoStartToggle from "../AutoStartToggle";
import StrictModeToggle from "../StrictModeToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { load } from "@tauri-apps/plugin-store";
import toast from "react-hot-toast";

// import PomodoroTimerToggle from "../PomodoroTimerToggle";

const AllSettings = () => {
  const [timeLimit, setTimeLimit] = useState<number>(12);

  // Load the store and fetch the saved limit on component mount
  useEffect(() => {
    const initializeStore = async () => {
      try {
        const store = await load("store.json", { autoSave: false });
        const savedLimit = await store.get("usageTimeLimit");
        if (savedLimit) {
          setTimeLimit(Number(savedLimit)); // Update time limit state
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings. Please try again later.", {
          duration: 2000,
          position: "bottom-right",
        });
      }
    };

    initializeStore();
  }, []);

  const handleSaveLimit = async () => {
    const store = await load("store.json", { autoSave: false });
    if (!store) {
      toast.error("Settings store is not initialized. Please try again.", {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    // Validate the input
    if (isNaN(timeLimit) || timeLimit < 1 || timeLimit > 24) {
      toast.error("Invalid limit. Please enter a number between 1 and 24.", {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    try {
      await store.set("usageTimeLimit", timeLimit); // Save the limit
      await store.save(); // Commit changes
      toast.success("Screen usage limit saved successfully!", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Failed to save limit:", error);
      toast.error("Failed to save limit. Please try again later.", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };
  return (
    <>
      <div className="space-y-4">
        <AutoStartToggle />
        {/* <PomodoroTimerToggle /> */}
        <StrictModeToggle />
        <div className="rounded-lg border border-muted p-6 space-y-4">
          {/* Input and Button Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="w-full">
              <Label
                htmlFor="screenUsageLimit"
                className="block text-base font-semibold mb-2"
              >
                Set your daily screen usage limit (hours)
              </Label>
              <p className="text-sm text-muted-foreground">
                This will reflect on the usage time graph.
              </p>
              <div className="flex w-full max-w-6xl items-center space-x-2 pt-2">
                <Input
                  id="screenUsageLimit"
                  type="number"
                  min={1}
                  max={24}
                  value={timeLimit}
                  onChange={(e) =>
                    setTimeLimit(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-4/5"
                />
                <Button className="w-1/5" onClick={handleSaveLimit}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllSettings;
