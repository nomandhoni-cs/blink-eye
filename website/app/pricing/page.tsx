import PricingSection from "@/components/pricing-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};
const Pricing = () => {
  return (
    <div className="">
      <PricingSection />
    </div>
  );
};

export default Pricing;
