import DownloadApp from "@/components/download-app";
import { FeatureGrid } from "@/components/features";
import OpenSource from "@/components/open-source";
import PricingSection from "@/components/pricing-section";
import HowBlinkEyeWillHelp from "@/components/how-blink-eye-will-help";
import FeatureShowcase from "@/components/FeaturesShowcase";
import HeroSection from "@/components/HeroSection";
import Blogs from "@/components/Blogs";
import { fetchReleaseData } from "@/utils/fetch-github-release";
import { ReleaseData } from "@/utils/github-fetch-types";
import { routing } from "@/i18n/routing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const RootPage = async () => {
  let releaseData: ReleaseData | null = null;
  try {
    releaseData = await fetchReleaseData();
  } catch (error) {
    console.error("Error fetching release data:", error);
  }

  return (
    <section className="mx-auto flex flex-col items-center gap-3 sm:gap-5 py-8 md:py-16 md:pb-8 lg:py-32 lg:pb-8 px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <DownloadApp releaseData={releaseData} />
      <FeatureGrid />
      <PricingSection />
      <FeatureShowcase />
      <HowBlinkEyeWillHelp />
      <Blogs />
      <OpenSource />
    </section>
  );
};

export default RootPage;
