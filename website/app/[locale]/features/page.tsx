import { FeatureGrid } from "@/components/features";
import FeatureShowcase from "@/components/FeaturesShowcase";
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
      />
      <FeatureShowcase />
    </div>
  );
};

export default Features;
