import { FeatureGrid } from "@/components/features";
import FeatureShowcase from "@/components/FeaturesShowcase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
};
const Features = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <FeatureGrid />
      <FeatureShowcase />
    </div>
  );
};

export default Features;
