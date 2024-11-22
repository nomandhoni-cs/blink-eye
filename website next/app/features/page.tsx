import { FeatureGrid } from "@/components/features";
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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
};
const Features = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureGrid
        title="Features"
        subtitle="All the necessary productivity tool in one place."
        items={[
          {
            icon: <Clock3 className="h-12 w-12" />,
            title: "Customizable Reminder Timers",
            description:
              "Set personalized reminder timers to stay focused and on track.",
          },
          {
            icon: <Paintbrush className="h-12 w-12" />,
            title: "Diverse Themes for Personalization",
            description:
              "Pick from various themes to customize your interface and workflow.",
          },
          {
            icon: <TextCursorInput className="h-12 w-12" />,
            title: "Customizable Reminder Text",
            description:
              "Create custom reminder messages to keep you motivated.",
          },
          {
            icon: <AudioLinesIcon className="h-12 w-12" />,
            title: "Customizable Sounds",
            description: "Choose your own sounds for notifications and alerts.",
          },
          {
            icon: <ChartAreaIcon className="h-12 w-12" />,
            title: "Daily Device Usage Tracking",
            description:
              "Track your screen time to optimize productivity and balance.",
          },
          {
            icon: <Calendar className="h-12 w-12" />,
            title: "Workday Setup",
            description:
              "Quickly set up your workday schedule for better productivity.",
          },
          {
            icon: <Timer className="h-12 w-12" />,
            title: "Pomodoro Timer Functionality",
            description:
              "Break tasks into intervals for maximum focus and efficiency.",
          },
          {
            icon: <ToggleRight className="h-12 w-12" />,
            title: "Automatic Startup on Device Boot",
            description:
              "Launch the app automatically when your device starts.",
          },
          {
            icon: <CloudDownloadIcon className="h-12 w-12" />,
            title: "Update Support",
            description:
              "Receive seamless updates for the latest features and fixes.",
          },
        ]}
      />
    </div>
  );
};

export default Features;
