import {
  AudioLinesIcon,
  Calendar,
  ChartAreaIcon,
  Clock3,
  CloudDownloadIcon,
  Paintbrush,
  TextCursorInput,
  Timer,
  ToggleRight,
} from "lucide-react";

interface Feature {
  icon: React.ElementType; // The icon component
  title: string;
  description: string;
}

// Feature data array
export const features: Feature[] = [
  {
    icon: Clock3,
    title: "Customizable Reminder Timers",
    description:
      "Set personalized reminder timers to stay focused and on track.",
  },
  {
    icon: Paintbrush,
    title: "Diverse Themes for Personalization",
    description:
      "Pick from various themes to customize your interface and workflow.",
  },
  {
    icon: TextCursorInput,
    title: "Customizable Reminder Text",
    description: "Create custom reminder messages to keep you motivated.",
  },
  {
    icon: AudioLinesIcon,
    title: "Customizable Sounds",
    description: "Choose your own sounds for notifications and alerts.",
  },
  {
    icon: ChartAreaIcon,
    title: "Daily Device Usage Tracking",
    description: "Track your screen time to optimize productivity and balance.",
  },
  {
    icon: Calendar,
    title: "Workday Setup",
    description:
      "Quickly set up your workday schedule for better productivity.",
  },
  {
    icon: Timer,
    title: "Pomodoro Timer Functionality",
    description: "Break tasks into intervals for maximum focus and efficiency.",
  },
  {
    icon: ToggleRight,
    title: "Automatic Startup on Device Boot",
    description: "Launch the app automatically when your device starts.",
  },
  {
    icon: CloudDownloadIcon,
    title: "Update Support",
    description: "Receive seamless updates for the latest features and fixes.",
  },
] as const;
