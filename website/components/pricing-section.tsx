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
      features: [
        "Cancel anytime",
        "Access for 1 device",
        "Inclueds all features of Monthly, but with 1 device",
      ],
      valueProposition: "Flexible plan for solo users—cancel anytime.",
    },
    {
      planType: "3 Devices",
      price: 5.49,
      url: "https://pollux.lemonsqueezy.com/buy/9ec6b2df-04fb-4202-8c7f-495318c871d5",
      features: [
        "Cancel anytime",
        "Access for 3 devices",
        "Rich library of customizable reminder screens",
        "Detailed device usage (weekly, monthly, lifetime)",
        "Workday and worktime setup for smarter reminders",
      ],
      valueProposition:
        "Best for families—access premium features on 3 devices.",
    },
    {
      planType: "5 Devices",
      price: 9.49,
      url: "https://pollux.lemonsqueezy.com/buy/bb1179b6-f86b-495f-9c9b-06260afd8ad5",
      features: [
        "Cancel anytime",
        "Access for 5 devices",
        "Inclueds all features of Monthly, but with 5 devices",
      ],
      valueProposition: "Ideal for teams—manage 5 devices effortlessly.",
    },
  ],
  Yearly: [
    {
      planType: "3 Devices",
      price: 22.99,
      url: "https://pollux.lemonsqueezy.com/buy/0afb62c6-1795-414f-b46f-4e5e0093edd1",
      features: [
        "Access for 1 device",
        "Inclues all features of Yearly, but with 3 devices",
        "Workday and worktime reminder customization",
      ],
      valueProposition:
        "Affordable for families—cover up to 3 devices and $9.89 saved annually!",
    },
    {
      planType: "1 Device",
      price: 8.99,
      url: "https://pollux.lemonsqueezy.com/buy/72a44597-6470-435a-875c-dfd34f71b619",
      features: [
        "Includes free updates",
        "Access for 1 devices",
        "Rich library of customizable reminder screens",
        "Advanced usage tracking: weekly, monthly, lifetime",
        "Custom workday schedules for smarter reminders",
      ],
      valueProposition:
        "Save $16.89 yearly compared to Monthly! Best for solo users looking for savings.",
    },
    {
      planType: "5 Devices",
      price: 34.99,
      url: "https://pollux.lemonsqueezy.com/buy/a89558be-4742-4a2c-b3a5-8e8d2f336e99",
      features: [
        "Access for 5 devices",
        "Inclues all features of Yearly, but with 5 devices",
        "Workday and worktime customization",
      ],
      valueProposition:
        "Great for teams—save more with yearly access, save $17.89 per year compared to Monthly",
    },
  ],
  Lifetime: [
    {
      planType: "1 Device",
      price: 15.99,
      url: "https://pollux.lemonsqueezy.com/buy/ce4f84c9-a898-4df8-8ebd-075310de4ff6",
      features: [
        "Access for 1 device",
        "Inclues all features of Lifetime.",
        "One-time payment, no renewals",
      ],
      valueProposition: "Pay once for lifetime access—perfect for solo users.",
    },
    {
      planType: "3 Devices",
      price: 44.99,
      url: "https://pollux.lemonsqueezy.com/buy/9cdc7e22-5f06-4329-bb59-9f861bf3d16d",
      features: [
        "Lifetime updates",
        "Access for 3 devices",
        "Rich library of customizable reminder screens",
        "Usage time: weekly, monthly, lifetime",
        "Workday setup: custom schedules for reminders",
      ],
      valueProposition:
        "Best value—lifetime access for families or small teams.",
    },
    {
      planType: "5 Devices",
      price: 69.99,
      url: "https://pollux.lemonsqueezy.com/buy/1c583ee0-1f5b-477a-a5c2-40a5fcf02501",
      features: [
        "Access for 5 devices",
        "Inclues all features of Lifetime, but with 5 devices.",
        "One-time payment, no renewals",
      ],
      valueProposition: "One-time investment for teams and power users.",
    },
  ],
};

export default function PricingSection({
  pricingData = defaultPricingData,
}: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Yearly");

  return (
    <div className="relative px-6 py-2 sm:py-2 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Choose the right plan for you
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
        Choose an affordable plan that's packed with the best features for
        engaging your audience, creating customer loyalty, and driving sales.
      </p>
      <div className="flex justify-center mt-8">
        <div className="flex space-x-0 rounded-md overflow-hidden border border-[#FE4C55]">
          {(["Monthly", "Yearly", "Lifetime"] as const).map((plan, index) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={cn(
                "px-4 py-2 transition-colors focus:outline-none",
                selectedPlan === plan
                  ? "bg-[#FE4C55] text-white"
                  : "bg-white text-[#FE4C55] hover:bg-[#FE4C55]/60",
                index === 0 ? "rounded-l-md" : "",
                index === 2 ? "rounded-r-md" : ""
              )}
            >
              {plan}
            </button>
          ))}
        </div>
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
                  tierIdx === 1 ? "text-gray-100" : "text-gray-800",
                  "text-base"
                )}
              >
                /
                {selectedPlan === "Lifetime"
                  ? "once"
                  : selectedPlan.toLowerCase()}
              </span>
            </p>
            <p
              className={cn(
                tierIdx === 1 ? "text-gray-100" : "text-gray-800",
                "mt-6 text-base/7"
              )}
            >
              {tier.valueProposition}
            </p>
            <ul
              role="list"
              className={cn(
                tierIdx === 1 ? "text-gray-100" : "text-gray-800",
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
                  <span
                    className={cn(
                      tierIdx === 1 ? "text-gray-100" : "text-gray-800"
                    )}
                  >
                    {feature}
                  </span>
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
              Get a License
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
