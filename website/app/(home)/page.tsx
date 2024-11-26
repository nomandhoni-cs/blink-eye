import DownloadApp from "@/components/download-app";
import { FeatureGrid } from "@/components/features";
import OpenSource from "@/components/open-source";
import PricingSection from "@/components/pricing-section";
import HowBlinkEyeWillHelp from "@/components/how-blink-eye-will-help";
import FeatureShowcase from "@/components/FeaturesShowcase";
import HeroSection from "@/components/HeroSection";
const RootPage = () => {
  return (
    <section className="mx-auto flex flex-col items-center gap-3 sm:gap-5 py-8 md:py-16 md:pb-8 lg:py-24 lg:pb-8 px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <DownloadApp />
      <FeatureGrid
        title="Features"
        subtitle="All the necessary productivity tool in one place."
      />{" "}
      <PricingSection />
      <FeatureShowcase />
      <HowBlinkEyeWillHelp />
      <OpenSource />
    </section>
  );
};

export default RootPage;
