import DownloadApp from "@/components/DownloadApp";
import { FeatureGrid } from "@/components/features";
import OpenSource from "@/components/open-source";
import PricingSection from "@/components/pricing-section";
import HowBlinkEyeWillHelp from "@/components/how-blink-eye-will-help";
import FeatureShowcase from "@/components/FeaturesShowcase";
import HeroSection from "@/components/HeroSection";
import Blogs from "@/components/Blogs";
import { fetchGithubStats } from "@/utils/fetch-github-release";
import { routing } from "@/i18n/routing";
import TimerDemo from "@/components/TimerDemo";
import Command from "@/components/Command";
import SupportedPlatforms from "@/components/SupportedPlatforms";
import ReleaseInfo from "@/components/ReleaseInfo";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const RootPage = async () => {
  const { latestRelease, tagName, totalDownloads } = await fetchGithubStats();

  return (
    <div className="w-full">
      {/* Hero Section - Full width, handles its own container */}
      <HeroSection />
      <div className="flex flex-col space-y-12">
        {/* Download & Install Group */}
        <div className="flex flex-col space-y-8 pt-16">
          <DownloadApp latestRelease={latestRelease} />
          <Command />
          <div className="flex flex-col space-y-4">
            <SupportedPlatforms />
            <ReleaseInfo tagName={tagName} totalDownloads={totalDownloads} />
          </div>
        </div>

        {/* Timer Demo */}
        <TimerDemo />

        {/* Features */}
        <FeatureGrid />

        {/* Pricing */}
        <PricingSection />

        {/* Feature Showcase */}
        <FeatureShowcase />

        {/* How It Helps */}
        <HowBlinkEyeWillHelp />

        {/* Blogs */}
        <Blogs />

        {/* Open Source */}
        <OpenSource />
      </div>
    </div>
  );
};

export default RootPage;