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
  icon: React.ElementType;
  title: string;
  description: string;
}

export function FeatureGridItem(props: Feature) {
  const Icon = props.icon;
  return (
    <div
      className="relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 
                 bg-white dark:bg-black/40 p-6 
                 shadow-sm hover:shadow-xl hover:border-[#FE4C55]/30 dark:hover:border-[#FE4C55]/30 
                 transition-all duration-300 flex flex-col justify-between"
    >
      {/* 3D Icon Container */}
      <div className="mb-6 relative">
        <div className="relative w-16 h-16 transform-gpu transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
          {/* Shadow layer */}
          <div className="absolute inset-0 rounded-xl bg-gray-400/20 dark:bg-black/30 blur-md transform translate-y-2" />

          {/* Main icon container with 3D effect */}
          <div className="relative h-full w-full rounded-xl 
                          bg-gray-100 dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]
                          group-hover:bg-gradient-to-br group-hover:from-[#FE4C55] group-hover:to-[#FE4C55]/80
                          group-hover:border-[#FE4C55]/50
                          group-hover:shadow-[0_8px_16px_rgba(254,76,85,0.25)]
                          transition-all duration-300">
            {/* Glass reflection effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10" />

            {/* Icon */}
            <div className="relative h-full w-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300 
                             group-hover:text-white 
                             drop-shadow-sm
                             transition-all duration-300" />
            </div>

            {/* Highlight spot */}
            <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/20 dark:bg-white/10 blur-sm" />
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="space-y-2">
        <h3 className="text-xl font-heading font-semibold leading-snug 
                       text-gray-900 dark:text-gray-100 
                       group-hover:text-[#FE4C55] transition">
          {props.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {props.description}
        </p>
      </div>

      {/* Subtle gradient hover overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 
                      transition-opacity duration-500 
                      bg-gradient-to-br from-[#FE4C55]/5 via-transparent to-transparent" />
    </div>
  );
}

// Alternative 3D Icon Style (More Glass-morphism)
export function FeatureGridItemAlt(props: Feature) {
  const Icon = props.icon;
  return (
    <div
      className="relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 
                 bg-white dark:bg-gray-900 p-6 
                 shadow-sm hover:shadow-xl hover:border-[#FE4C55]/30 dark:hover:border-[#FE4C55]/30 
                 transition-all duration-300 flex flex-col justify-between"
    >
      {/* 3D Glass Icon */}
      <div className="mb-6 relative">
        <div className="relative w-16 h-16 transform-gpu transition-all duration-500 group-hover:rotate-y-180"
          style={{ transformStyle: 'preserve-3d' }}>
          {/* Back face */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FE4C55] to-[#FE4C55]/70 
                          shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="h-full w-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Front face */}
          <div className="absolute inset-0 rounded-2xl
                          bg-white/90 dark:bg-gray-800/90
                          backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50
                          shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            style={{ backfaceVisibility: 'hidden' }}>
            {/* Glass shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />

            {/* Icon */}
            <div className="h-full w-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300 relative z-10" />
            </div>

            {/* Reflection */}
            <div className="absolute -top-1 -left-1 w-full h-full rounded-2xl 
                            bg-gradient-to-br from-white/20 dark:from-white/10 to-transparent opacity-50" />
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="space-y-2">
        <h3 className="text-xl font-heading font-semibold leading-snug 
                       text-gray-900 dark:text-gray-100 
                       group-hover:text-[#FE4C55] transition">
          {props.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {props.description}
        </p>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  const t = useTranslations("featureGrid");

  const features: Feature[] = [
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
    <section id="features" className="container space-y-12 py-16 md:py-20 lg:pb-28">
      {/* Section Header */}
      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center">
        <h2 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight 
                       text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Feature grid */}
      <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
        {features.map((item, index) => (
          <FeatureGridItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}