import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Screen Components
import LanguageScreen from "./components/screens/language-screen";
import WelcomeScreen from "./components/screens/welcome-screen";
import BreakConfigScreen from "./components/screens/break-config-screen";
import ThemePickerOnboarding from "./components/screens/theme-picker-onboarding";
import TimerStyleScreen from "./components/screens/timer-style-screen";
import TodoSetupScreen from "./components/screens/todo-setup-screen";
import DoneScreen from "./components/screens/done-screen";
import { changeLanguage } from "./i18n";

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
import {
  saveTimerStyle,
  type TimerStyle,
} from "./components/reminder/timerStyle";
import {
  createTask,
  setTodoSetting,
  TASK_REMINDERS_ENABLED_KEY,
  toLocalDate,
  toLocalDateTime,
} from "./lib/todo-store";

import { screenEmail } from "./lib/email-screening";

export default function UserOnboarding() {
  const { t } = useTranslation();
  // State Management
  const [currentScreen, setCurrentScreen] = useState(1);
  // Default to English (US) until the user picks something else.
  const [language, setLanguage] = useState("en");
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
  const [timerStyle, setTimerStyle] = useState<TimerStyle>("dial");
  // To-dos are free: onboarding captures one required real first task and lets
  // the user decide whether they want task pop-ups (the opt-in is optional).
  const [firstTask, setFirstTask] = useState("");
  const [todoTaskAdded, setTodoTaskAdded] = useState(false);
  const [todoRequiredError, setTodoRequiredError] = useState(false);
  const [firstTaskTime, setFirstTaskTime] = useState("");
  // New users start with a useful default: remind 10 minutes before the task.
  const [firstTaskLeadMinutes, setFirstTaskLeadMinutes] = useState(10);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  // Soft signal: plausible but unusual (`xx@`, `admin@`, numeric local).
  // Shown as a confirm-once question, never as a block.
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [emailWarningAcknowledged, setEmailWarningAcknowledged] = useState(false);
  /**
   * Mirror of `emailWarningAcknowledged` for reads inside the same tick.
   * `goNext` is called straight after the handler sets state, so the state
   * variable would still be stale and the warning would reappear forever.
   */
  const emailWarningAcknowledgedRef = useRef(false);

  // A task is required on the todo step. Editing after saving means the user
  // is making a new decision, so the "added" confirmation is cleared.
  const updateFirstTask = (value: string) => {
    setFirstTask(value);
    setTodoTaskAdded(false);
    setTodoRequiredError(false);
  };

  const markFirstTaskAdded = () => {
    setFirstTask("");
    setTodoTaskAdded(true);
    setTodoRequiredError(false);
  };

  // Screen Configuration - Easy to add new screens!
  const screens: Screen[] = [
    {
      id: 1,
      title: t("onboarding.steps.language"),
      component: LanguageScreen,
      onNext: async () => {
        await changeLanguage(language);
      },
    },
    {
      id: 2,
      title: t("onboarding.steps.welcome"),
      component: WelcomeScreen,
      onNext: OnboardingService.saveWelcomeData,
      validate: () => validateEmail(),
    },
    {
      id: 3,
      title: t("onboarding.steps.theme"),
      component: ThemePickerOnboarding,
      onNext: async () => {
        // Theme is already saved to DB by AccentColorContext.setAccentTheme
      },
    },
    {
      id: 4,
      title: t("onboarding.steps.breakSettings"),
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
      id: 5,
      title: t("onboarding.steps.breakClock"),
      component: TimerStyleScreen,
      onNext: () => saveTimerStyle(timerStyle),
    },
    {
      id: 6,
      title: t("onboarding.steps.todo"),
      component: TodoSetupScreen,
      validate: () => {
        // One real task is required to start the feature; it is saved either
        // by "Add task" or automatically when the user presses Next.
        const hasTask = todoTaskAdded || firstTask.trim().length > 0;
        setTodoRequiredError(!hasTask);
        return hasTask;
      },
      onNext: async () => {
        // Text left in the field when the user presses Next still becomes a
        // task; the screen clears it when its own Add button was used.
        if (!todoTaskAdded && firstTask.trim()) {
          await createTask({
            title: firstTask,
            deadline: toLocalDate(new Date()),
            reminderTime: firstTaskTime || null,
            dueAt: toLocalDateTime(new Date(), firstTaskTime),
            reminderLeadMinutes: firstTaskLeadMinutes,
          });
          markFirstTaskAdded();
        }
        await setTodoSetting(
          TASK_REMINDERS_ENABLED_KEY,
          remindersEnabled ? "true" : "false",
        );
      },
    },
    {
      id: 7,
      title: t("onboarding.steps.done"),
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

  /** Clearing the nudge whenever the address changes keeps it honest. */
  const setAcknowledged = (value: boolean) => {
    emailWarningAcknowledgedRef.current = value;
    setEmailWarningAcknowledged(value);
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    setEmailError(null);
    setEmailWarning(null);
    // A new address is a new decision: never carry a past "use it anyway".
    setAcknowledged(false);
  };

  /**
   * "Yes, this is correct" — keep the address and move on in one click.
   *
   * The address itself already passed the screener (it is only ever a nudge),
   * so there is nothing left to validate; advancing directly avoids making
   * the user confirm and then click Next a second time.
   */
  const acknowledgeEmailWarning = () => {
    setAcknowledged(true);
    setEmailWarning(null);
    void goNext();
  };

  /**
   * Screen the address before letting onboarding continue.
   *
   * Three outcomes (see `src/lib/email-screening.ts`):
   *  - blocked: dummy/test/disposable domain, placeholder local part, or a
   *    score past the threshold. Onboarding cannot continue.
   *  - nudge: one soft signal (very short, `admin@`-style prefix, filler
   *    characters, numeric local). The user confirms once and moves on, so a
   *    real owner of `xx@outlook.com` is never trapped.
   *  - ok: continue silently.
   */
  const validateEmail = (): boolean => {
    const result = screenEmail(email);

    if (result.verdict === "blocked") {
      setEmailError(
        result.messageKey ? t(`email.${result.messageKey}`) : result.message,
      );
      setEmailWarning(null);
      return false;
    }

    if (result.verdict === "nudge" && !emailWarningAcknowledgedRef.current) {
      // Surface the question and pause; the same Next click continues once
      // the user has confirmed.
      setEmailError(null);
      setEmailWarning(
        result.messageKey ? t(`email.${result.messageKey}`) : result.message,
      );
      return false;
    }

    setEmailError(null);
    setEmailWarning(null);
    return true;
  };

  const goNext = async () => {
    if (currentScreenConfig?.validate && !currentScreenConfig.validate()) {
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
          : t("onboarding.setupFailed"),
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
          return {
            selected: language,
            onSelect: (code: string) => {
              setLanguage(code);
              // Live preview: the rest of onboarding follows the choice.
              void changeLanguage(code);
            },
          };
        case 2:
          return {
            email,
            setEmail: updateEmail,
            emailError,
            emailWarning,
            emailWarningAcknowledged,
            onAcknowledgeWarning: acknowledgeEmailWarning,
          };
        case 3:
          // Theme picker - no props needed
          return {};
        case 4:
          return {
            breakInterval,
            setBreakInterval,
            breakDuration,
            setBreakDuration,
            reminderText,
            setReminderText,
          };
        case 5:
          return { timerStyle, setTimerStyle };
        case 6:
          return {
            firstTask,
            setFirstTask: updateFirstTask,
            taskAdded: todoTaskAdded,
            remindersEnabled,
            setRemindersEnabled,
            firstTaskTime,
            setFirstTaskTime,
            firstTaskLeadMinutes,
            setFirstTaskLeadMinutes,
            onTaskAdded: markFirstTaskAdded,
            requiredError: todoRequiredError,
          };
        case 7:
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
              {t("onboarding.stepOf", {
                current: currentScreen,
                total: totalScreens,
                title: currentScreenConfig?.title,
              })}
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
            <span>{t("common.previous")}</span>
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
            onClick={goNext}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <span>
              {isLoading
                ? t("common.saving")
                : currentScreen === totalScreens
                  ? t("common.complete")
                  : t("common.next")}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
