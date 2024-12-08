"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2Icon } from "lucide-react";
import { cn } from "@/utils/cn";

type PlanType = "monthly" | "yearly" | "lifetime";

export default function PricingSection() {
  const t = useTranslations();
  const pricingHeader = useTranslations("pricingSectionHeader");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");

  const pricingData = t.raw("pricingSection");

  return (
    <div className="relative px-6 py-2 sm:py-2 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          {pricingHeader("title")}
        </h2>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
        {pricingHeader("description")}
      </p>
      <div className="flex justify-center mt-8">
        <div className="flex space-x-0 rounded-md overflow-hidden border border-gray-400 dark:border-gray-600">
          {(["monthly", "yearly", "lifetime"] as const).map((plan, index) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                selectedPlan === plan
                  ? "bg-[#FE4C55] text-black dark:bg-[#FE4C55] dark:text-black"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
                index === 0 ? "rounded-l-md" : "",
                index === 2 ? "rounded-r-md" : ""
              )}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)} {/* Capitalize */}
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
                {selectedPlan === "lifetime"
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
              {tier.features.map((feature: string) => (
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
