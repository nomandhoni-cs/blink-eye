import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Screen Components
import WelcomeScreen from "./components/screens/welcome-screen";
import BreakConfigScreen from "./components/screens/break-config-screen";
import ThemePickerOnboarding from "./components/screens/theme-picker-onboarding";
import DoneScreen from "./components/screens/done-screen";

// Types and Services
import type { Screen } from "./types/onboarding";
import { OnboardingService } from "./services/onboarding-service";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import GradientBackground from "./components/GradientBackground";
import { ModeToggle } from "./components/ThemeToggle";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import welcomeAudio from "./assets/audio/welcome-onboarding.mp3";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export default function UserOnboarding() {
  // State Management
  const [currentScreen, setCurrentScreen] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play welcome audio once on mount
  useEffect(() => {
    const audio = new Audio(welcomeAudio);
    audio.volume = 0.8;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked, will play on first user interaction
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Onboarding Data
  const [breakInterval, setBreakInterval] = useState(20);
  const [breakDuration, setBreakDuration] = useState(20);
  const [reminderText, setReminderText] = useState(
    "Pause! Look into the distance, and best if you walk a bit.",
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

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
      title: "Theme",
      component: ThemePickerOnboarding,
      onNext: async () => {
        // Theme is already saved to DB by AccentColorContext.setAccentTheme
      },
    },
    {
      id: 3,
      title: "Break Settings",
      component: BreakConfigScreen,
      onNext: async () => {
        await OnboardingService.saveBreakConfiguration({
          breakInterval,
          breakDuration,
          reminderText,
        });
      },
    },
    {
      id: 4,
      title: "Done",
      component: DoneScreen,
      onNext: async () => {
        await OnboardingService.completeOnboarding({
          breakInterval,
          breakDuration,
          reminderText,
          email: email || undefined,
        });
      },
    },
  ];

  const totalScreens = screens.length;
  const progress = (currentScreen / totalScreens) * 100;
  const currentScreenConfig = screens.find((s) => s.id === currentScreen);

  // Navigation Functions

  const validateEmail = (): boolean => {
    const trimmed = email.trim();

    if (!trimmed) {
      setEmailError("Please enter your email to continue.");
      return false;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("That email doesn't look right. Double-check it?");
      return false;
    }

    setEmailError(null);
    return true;
  };

  const nextScreen = async () => {
    if (currentScreen === 1 && !validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      if (currentScreenConfig?.onNext) {
        await currentScreenConfig.onNext();
      }
      if (currentScreen < totalScreens) {
        setDirection(1);
        setCurrentScreen(currentScreen + 1);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Oops! Something went wrong. Try again?",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const prevScreen = async () => {
    if (currentScreen > 1) {
      setIsLoading(true);

      try {
        setDirection(-1);
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
          return { email, setEmail, emailError };
        case 2:
          // Theme picker - no props needed
          return {};
        case 3:
          return {
            breakInterval,
            setBreakInterval,
            breakDuration,
            setBreakDuration,
            reminderText,
            setReminderText,
          };
        case 4:
          return {
            breakInterval,
            breakDuration,
            reminderText,
          };
        default:
          return {};
      }
    };

    return <ScreenComponent {...getScreenProps()} />;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 48 : -48,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -48 : 48,
    }),
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none">
      {/* Main Content Area */}
      <GradientBackground
        position="top"
        rotate={10}
        fromColor="#ff80b5"
        toColor="#FE4C55"
      />
      <div className="h-full pb-28 p-8 overflow-auto">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Top Right corner theme toggle  */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-t-foreground/10 bg-background/60 backdrop-blur-md p-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-foreground/50">
            <span className="font-medium">
              Step {currentScreen} of {totalScreens} —{" "}
              {currentScreenConfig?.title}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentScreen === screen.id
                    ? "w-6 bg-primary"
                    : currentScreen > screen.id
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-foreground/15"
                }`}
              />
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
      <Toaster position="top-right" />
    </div>
  );
}
