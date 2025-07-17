import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Screen Components
import WelcomeScreen from "./components/screens/welcome-screen";
import BreakConfigScreen from "./components/screens/break-config-screen";
// import TodoListScreen from "./components/screens/todo-list-screen";
import LicenseScreen from "./components/screens/license-screen";

// Types and Services
import type { Screen, OnboardingData, TodoItem } from "./types/onboarding";
import { OnboardingService } from "./services/onboarding-service";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import GradientBackground from "./components/GradientBackground";
// import TodoPage from "./components/window/TodoPage";
// import ActivateLicense from "./components/window/ActivateLicense";
// import Database from "@tauri-apps/plugin-sql";
import { ModeToggle } from "./components/ThemeToggle";
import { Toaster } from "react-hot-toast";
import ToDoOnboarding from "./components/screens/todo-screen-copied";

export default function UserOnboarding() {
  // State Management
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding Data
  const [breakInterval, setBreakInterval] = useState(20);
  const [breakDuration, setBreakDuration] = useState(20);
  const [reminderText, setReminderText] = useState(
    "Pause! Look into the distance, and best if you walk a bit."
  );
  const [licenseKey, setLicenseKey] = useState("");
  const [userName, setUserName] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Screen Configuration - Easy to add new screens!
  const screens: Screen[] = [
    {
      id: 1,
      title: "Welcome",
      component: WelcomeScreen,
      onNext: OnboardingService.saveWelcomeData,
    },
    {
      id: 2,
      title: "Break Settings",
      component: BreakConfigScreen,
      onNext: async () => {
        await OnboardingService.saveBreakConfiguration({
          breakInterval,
          breakDuration,
          customInterval: breakInterval.toString(),
          customDuration: breakDuration.toString(),
          reminderText,
        });
      },
    },
    {
      id: 3,
      title: "Todo List",
      component: ToDoOnboarding,
      onNext: async () => {
        await OnboardingService.saveTodoList(todos);
      },
    },
    {
      id: 4,
      title: "License",
      component: LicenseScreen,
      onNext: async () => {
        await OnboardingService.saveLicenseKey(licenseKey);

        // Complete onboarding on final screen
        const onboardingData: OnboardingData = {
          breakInterval,
          breakDuration,
          customInterval: breakInterval.toString(),
          customDuration: breakDuration.toString(),
          reminderText,
          licenseKey,
          todos,
        };
        await OnboardingService.completeOnboarding(onboardingData);
      },
    },
  ];

  const totalScreens = screens.length;
  const progress = (currentScreen / totalScreens) * 100;
  const currentScreenConfig = screens.find((s) => s.id === currentScreen);

  // Navigation Functions
  const nextScreen = async () => {
    if (currentScreen < totalScreens) {
      setIsLoading(true);

      try {
        // Execute the onNext function for current screen
        if (currentScreenConfig?.onNext) {
          await currentScreenConfig.onNext();
        }

        setCurrentScreen(currentScreen + 1);
      } catch (error) {
        console.error("Error saving data:", error);
        // TODO: Show error toast/notification
      } finally {
        setIsLoading(false);
      }
    } else if (currentScreen === totalScreens) {
      // Handle the final "Complete" button click
      setIsLoading(true);
      try {
        // Execute the onNext function for the final screen
        if (currentScreenConfig?.onNext) {
          await currentScreenConfig.onNext();
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const prevScreen = async () => {
    if (currentScreen > 1) {
      setIsLoading(true);

      try {
        // Execute the onPrevious function if exists
        if (currentScreenConfig?.onPrevious) {
          await currentScreenConfig.onPrevious();
        }

        setCurrentScreen(currentScreen - 1);
      } catch (error) {
        console.error("Error on previous:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render Current Screen
  const renderScreen = () => {
    const ScreenComponent = currentScreenConfig?.component;
    if (!ScreenComponent) return null;

    // Pass props based on screen
    const getScreenProps = () => {
      switch (currentScreen) {
        case 1:
          return {};
        case 2:
          return {
            breakInterval,
            setBreakInterval,
            breakDuration,
            setBreakDuration,
            reminderText,
            setReminderText,
          };
        case 3:
          return {
            todos,
            setTodos,
          };
        case 4:
          return {
            licenseKey,
            setLicenseKey,
            userName,
            setUserName,
          };
        default:
          return {};
      }
    };

    return <ScreenComponent {...getScreenProps()} />;
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Main Content Area */}
      <GradientBackground
        position="top"
        rotate={10}
        fromColor="#ff80b5"
        toColor="#FE4C55"
      />
      <div className="h-full pb-32 p-8 overflow-auto">{renderScreen()}</div>
      {/* Top Right corner theme toggle  */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-t-foreground/10 p-4 space-y-4 shadow-lg">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-foreground/50">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Screen Indicators and Navigation */}
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={prevScreen}
            disabled={currentScreen === 1 || isLoading}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {/* Screen Indicators */}
          <div className="flex items-center space-x-2">
            {screens.map((screen, index) => (
              <div
                key={screen.id || index}
                className="flex flex-col items-center space-y-1"
              >
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentScreen === screen.id
                      ? "bg-[#FE4C55]"
                      : currentScreen > screen.id
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Next Button */}
          <Button
            onClick={nextScreen}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <span>
              {isLoading
                ? "Saving..."
                : currentScreen === totalScreens
                ? "Complete"
                : "Next"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
