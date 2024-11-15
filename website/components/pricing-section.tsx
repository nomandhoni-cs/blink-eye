"use client";

import { useState } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
};

type PlanType = "Monthly" | "Yearly" | "Lifetime";

interface PricingData {
  planType: string;
  price: number;
  url: string;
  features: string[];
  valueProposition: string;
}

interface PricingProps {
  pricingData?: {
    Monthly: PricingData[];
    Yearly: PricingData[];
    Lifetime: PricingData[];
  };
}

const defaultPricingData = {
  Monthly: [
    {
      planType: "1 Device",
      price: 1.99,
      url: "https://pollux.lemonsqueezy.com/buy/93cad649-3242-41c2-8914-8717913d1af1",
      features: ["Cancel anytime", "Access for 1 device"],
      valueProposition:
        "Pay-as-you-go flexibility! Ideal for short-term use or testing without a commitment.",
    },
    {
      planType: "3 Devices",
      price: 5.49,
      url: "https://pollux.lemonsqueezy.com/buy/9ec6b2df-04fb-4202-8c7f-495318c871d5",
      features: ["Cancel anytime", "Access for 3 devices"],
      valueProposition:
        "Family-friendly plan with multi-device access—perfect for households with multiple users!",
    },
    {
      planType: "5 Devices",
      price: 9.49,
      url: "https://pollux.lemonsqueezy.com/buy/bb1179b6-f86b-495f-9c9b-06260afd8ad5",
      features: ["Cancel anytime", "Access for 5 devices"],
      valueProposition:
        "Best for small teams or multi-device setups, giving your team room to grow and test affordably!",
    },
  ],
  Yearly: [
    {
      planType: "3 Devices",
      price: 22.99,
      url: "https://pollux.lemonsqueezy.com/buy/0afb62c6-1795-414f-b46f-4e5e0093edd1",
      features: ["Includes free updates", "Access for 3 devices"],
      valueProposition:
        "A cost-effective choice for families, with up to 3 devices covered and $9.89 saved annually!",
    },
    {
      planType: "1 Device",
      price: 8.99,
      url: "https://pollux.lemonsqueezy.com/buy/72a44597-6470-435a-875c-dfd34f71b619",
      features: [
        "Includes free updates",
        "Access for 1 device",
        "Includes free updatses",
        "Access for 1 devicae",
      ],
      valueProposition:
        "Save $16.89 yearly compared to Monthly! Perfect for solo users wanting a longer commitment and savings.",
    },
    {
      planType: "5 Devices",
      price: 34.99,
      url: "https://pollux.lemonsqueezy.com/buy/a89558be-4742-4a2c-b3a5-8e8d2f336e99",
      features: ["Includes free updates", "Access for 5 devices"],
      valueProposition:
        "For teams who need multiple devices; save $17.89 per year compared to Monthly, with great flexibility for growth!",
    },
  ],
  Lifetime: [
    {
      planType: "3 Devices",
      price: 44.99,
      url: "https://pollux.lemonsqueezy.com/buy/9cdc7e22-5f06-4329-bb59-9f861bf3d16d",
      features: ["Lifetime updates", "Access for 3 devices"],
      valueProposition:
        "Ideal long-term solution for families or small groups—unlock forever access on multiple devices!",
    },
    {
      planType: "1 Device",
      price: 15.99,
      url: "https://pollux.lemonsqueezy.com/buy/ce4f84c9-a898-4df8-8ebd-075310de4ff6",

      features: ["Lifetime updates", "Access for 1 device"],
      valueProposition:
        "The ultimate value for solo users—pay once, access forever, no renewals needed!",
    },
    {
      planType: "5 Devices",
      price: 69.99,
      url: "https://pollux.lemonsqueezy.com/buy/1c583ee0-1f5b-477a-a5c2-40a5fcf02501",
      features: ["Lifetime updates", "Access for 5 devices"],
      valueProposition:
        "Top value for teams and power users: one-time investment for lifetime access across all your devices!",
    },
  ],
};

export default function PricingSection({
  pricingData = defaultPricingData,
}: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Yearly");

  return (
    <div className="relative px-6 py-8 sm:py-4 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Choose the right plan for you
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        Choose an affordable plan that's packed with the best features for
        engaging your audience, creating customer loyalty, and driving sales.
      </p>
      <div className="flex justify-center space-x-4 mt-8">
        {(["Monthly", "Yearly", "Lifetime"] as const).map((plan) => (
          <button
            key={plan}
            onClick={() => setSelectedPlan(plan)}
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              selectedPlan === plan
                ? "bg-[#FE4C55] text-white"
                : "bg-white text-[#FE4C55] hover:bg-[#FE4C55]/10"
            )}
          >
            {plan}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
        {pricingData[selectedPlan].map((tier, tierIdx) => (
          <div
            key={tier.planType}
            className={cn(
              tierIdx === 1
                ? "relative bg-[#FE4C55] shadow-2xl"
                : "bg-white/80 sm:mx-8 lg:mx-0",
              tierIdx === 1
                ? ""
                : tierIdx === 0
                ? "rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none"
                : "sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl",
              "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
            )}
          >
            <h3
              id={`tier-${tier.planType}`}
              className={cn(
                tierIdx === 1 ? "text-white" : "text-[#FE4C55]",
                "text-base/7 font-semibold"
              )}
            >
              {tier.planType}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={cn(
                  tierIdx === 1 ? "text-white" : "text-gray-900",
                  "text-5xl font-semibold tracking-tight"
                )}
              >
                ${tier.price}
              </span>
              <span
                className={cn(
                  tierIdx === 1 ? "text-gray-400" : "text-gray-500",
                  "text-base"
                )}
              >
                /
                {selectedPlan === "Lifetime"
                  ? "one-time"
                  : selectedPlan.toLowerCase()}
              </span>
            </p>
            <p
              className={cn(
                tierIdx === 1 ? "text-gray-300" : "text-gray-600",
                "mt-6 text-base/7"
              )}
            >
              {tier.valueProposition}
            </p>
            <ul
              role="list"
              className={cn(
                tierIdx === 1 ? "text-gray-300" : "text-gray-600",
                "mt-8 space-y-3 text-sm/6 sm:mt-10"
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckCircle2Icon
                    aria-hidden="true"
                    className={cn(
                      tierIdx === 1 ? "text-white" : "text-[#FE4C55]",
                      "h-6 w-5 flex-none"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.url}
              aria-describedby={`tier-${tier.planType}`}
              className={cn(
                tierIdx === 1
                  ? "bg-white text-[#FE4C55] shadow-sm hover:bg-gray-100 focus-visible:outline-white"
                  : "text-white bg-[#FE4C55] ring-1 ring-inset ring-[#FE4C55] hover:bg-[#FE4C55]/90 focus-visible:outline-[#FE4C55]",
                "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              Get started today
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
