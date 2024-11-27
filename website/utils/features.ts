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
    title: "Daily Device Usage Time",
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
    title: "Pomodoro Timer",
    description: "Break tasks into intervals for maximum focus and efficiency.",
  },
  {
    icon: ToggleRight,
    title: "Run on Startup",
    description: "Launch the app automatically when your device starts.",
  },
  {
    icon: CloudDownloadIcon,
    title: "Update Support",
    description: "Receive seamless updates for the latest features and fixes.",
  },
] as const;

interface FeatureDemo {
  title: string;
  description: string;
  imageSrc: string;
  features: string[];
  moto: string;
}
export const featuresDemo: FeatureDemo[] = [
  {
    title: "Customizable Reminders",
    description:
      "Set personalized reminders to prevent eye strain, improve productivity, and maintain focus during long work sessions.",
    features: [
      "Customizable reminder durations",
      "Adjustable interval settings",
      "Editable reminder text for personalization",
    ],
    moto: "Best Eye Strain Relief App for Computer Users",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdX2WsWpu0qrePa5DMfGYLJ8imsxU7z6XtIZHu",
  },
  {
    title: "Multiple Themes",
    description:
      "Multiple Reminder Screen themes and you can Switch between light and dark themes or choose from a variety of unique color schemes to suit your mood and workspace.",
    features: [
      "Multiple Reminder Screen themes to choose from",
      "App Dark mode support",
      "App light mode support",
    ],
    moto: "Screen Time Tracker and Break Reminder App",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdATITuEkNsu2tghpYOvrPweEdIUQCoaGHlzZV",
  },
  {
    title: "Usage Statistics",
    description:
      "Monitor your daily screen time, track device usage trends, and optimize your work-life balance effectively.",
    features: [
      "Daily device usage tracking",
      "Weekly device usage tracking",
      "Monthly device usage tracking",
      "Yearly device usage tracking",
      "Alltime device usage tracking",
      "Comprehensive usage analytics",
      "Visual graphs and progress reports",
    ],
    moto: "Free Screen Break Reminder App for Healthy Eyes",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdVJo1Bcrgq56ih4PEWRb7eGL3UmpudlKaTfN1",
  },
  {
    title: "Workday Setup and Scheduling",
    description:
      "Plan your workdays efficiently by setting custom schedules and work hours for each day of the week.",
    features: [
      "Customizable workday settings",
      "Daily scheduling flexibility",
      "Automated reminders for work-hour breaks",
    ],
    moto: "Customizable Work Break Timer for Office Workers",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdeyfjt8AGUrMQKVoXBI75tih4E9gWPzmLdf16",
  },
  {
    title: "Comprehensive Customization Settings",
    description:
      "Boost your productivity and focus with customizable settings, including Pomodoro timers and notification preferences.",
    features: [
      "Pomodoro technique integration",
      "Stict Mode to force you take break",
      "Customizable notification sounds",
      "Run on Startup switch",
      "Set your daily screen usage limit",
    ],
    moto: "Pomodoro Timer with Break Reminders for Productivity",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdWlTbTT2ZbSGxFhzOli7j10ntQHMWJ539Pod2",
  },
  {
    title: "Activate License Key",
    description:
      "Activate your app with a license key for full access to premium features and seamless updates.",
    features: [
      "Easy license activation process",
      "Access to exclusive premium features",
      "Regular software updates and support",
    ],
    moto: "Top App to Prevent Computer Vision Syndrome (CVS) and (RSI)",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdWJmmWS2ZbSGxFhzOli7j10ntQHMWJ539Pod2",
  },
];
