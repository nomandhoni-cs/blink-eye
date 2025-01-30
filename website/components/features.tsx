import React from "react";
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
import { useTranslations } from "next-intl";
interface Feature {
  icon: React.ElementType; // The icon component
  title: string;
  description: string;
}
export function FeatureGridItem(props: {
  icon: React.ElementType; // Expecting a component type
  title: string;
  description: string;
}) {
  const Icon = props.icon; // Use the passed component type as JSX
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-2 motion-scale-in-[0.5] motion-translate-x-in-[-25%] motion-translate-y-in-[25%] motion-opacity-in-[0%] motion-rotate-in-[-10deg] motion-blur-in-[5px] motion-duration-[0.35s] motion-duration-[0.53s]/scale motion-duration-[0.53s]/translate motion-duration-[0.63s]/rotate">
      <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
        <span className="h-24 w-24">
          <Icon className="h-12 w-12 text-primary" /> {/* Render the icon */}
        </span>
        <div className="space-y-2">
          <h3 className="text-pretty text-xl font-semibold">{props.title}</h3>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  const t = useTranslations("featureGrid");
  const features = [
    {
      icon: Clock3,
      title: t("features.customizableReminderTimers.title"),
      description: t("features.customizableReminderTimers.description"),
    },
    {
      icon: Paintbrush,
      title: t("features.diverseThemes.title"),
      description: t("features.diverseThemes.description"),
    },
    {
      icon: TextCursorInput,
      title: t("features.customizableReminderText.title"),
      description: t("features.customizableReminderText.description"),
    },
    {
      icon: AudioLinesIcon,
      title: t("features.customizableSounds.title"),
      description: t("features.customizableSounds.description"),
    },
    {
      icon: ChartAreaIcon,
      title: t("features.dailyDeviceUsage.title"),
      description: t("features.dailyDeviceUsage.description"),
    },
    {
      icon: Calendar,
      title: t("features.workdaySetup.title"),
      description: t("features.workdaySetup.description"),
    },
    {
      icon: Timer,
      title: t("features.pomodoroTimer.title"),
      description: t("features.pomodoroTimer.description"),
    },
    {
      icon: ToggleRight,
      title: t("features.runOnStartup.title"),
      description: t("features.runOnStartup.description"),
    },
    {
      icon: CloudDownloadIcon,
      title: t("features.updateSupport.title"),
      description: t("features.updateSupport.description"),
    },
  ];
  return (
    <section
      id="features"
      className="container space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center space-y-4 text-center">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
          {t("subtitle")}
        </p>
      </div>

      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {features.map((item, index) => (
          <FeatureGridItem
            key={index}
            icon={item.icon} // Pass the component type
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}
