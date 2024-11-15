import DownloadApp from '@/components/download-app';
import { FeatureGrid } from '@/components/features';
import OpenSource from '@/components/open-source';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Link from 'next/link';
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
import PricingSection from '@/components/pricing-section';
const RootPage = () => {
	return (
    <section className="mx-auto flex flex-col items-center gap-3 sm:gap-5 py-8 md:py-16 md:pb-8 lg:py-24 lg:pb-8">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-sm md:max-w-6xl">
        <span className="font-bold text-[#FE4C55]"> Blink Eye </span> <br /> A
        minimalist eye care reminder app for Windows, macOS, and Linux.
      </h1>
      <p className="max-w-[900px] mt-2 text-center text-lg text-muted-foreground sm:text-xl">
        To reduce eye strain, featuring reminder with timers, full-screen
        popups. Based on{" "}
        <HoverCard>
          <HoverCardTrigger>
            {" "}
            <span className="text-[#FE4C55] cursor-pointer">20-20-20 </span>
          </HoverCardTrigger>
          <HoverCardContent>
            by
            <Link
              href="https://www.aao.org/eye-health/tips-prevention/computer-usage#:~:text=Take%20regular%20breaks%20using%20the,for%20at%20least%2020%20seconds."
              target="_blank"
            >
              {" "}
              American Academy of Ophthalmology
            </Link>
          </HoverCardContent>
        </HoverCard>
        rule.
      </p>
      <DownloadApp />
      <div className="flex flex-col gap-8 sm:gap-16 md:gap-24">
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
              description:
                "Choose your own sounds for notifications and alerts.",
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
        <PricingSection />
        <OpenSource />
      </div>
    </section>
  );
};

export default RootPage;
