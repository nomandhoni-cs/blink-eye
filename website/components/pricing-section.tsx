"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const metadata: Metadata = {
  title: "Pricing",
};

// Configuration interface - only define these fields
interface PricingPlanConfig {
  devices: number;
  originalPrice: string; // e.g., "9.99" (without $)
  savingsPercentage: string; // e.g., "40%" - ONLY CHANGE THIS for discount
  isRecommended: boolean;
  checkoutLink: {
    yearly: string;
    lifetime: string;
  };
}

// Full plan interface with calculated fields
interface PricingPlan extends PricingPlanConfig {
  price: string;
  savings: string;
}

// Helper function to automatically calculate pricing based on savingsPercentage
const calculatePricing = (config: PricingPlanConfig): PricingPlan => {
  const original = parseFloat(config.originalPrice.replace(/[$,]/g, ''));
  const percentage = parseFloat(config.savingsPercentage.replace('%', '')) / 100;

  const savingsAmount = original * percentage;
  const finalPrice = original - savingsAmount;

  return {
    ...config,
    price: `$${finalPrice.toFixed(2)}`,
    savings: `$${savingsAmount.toFixed(2)}`,
    originalPrice: `$${original.toFixed(2)}`
  };
};

export default function PricingSection() {
  const pricingHeader = useTranslations("pricingSectionHeader");
  const [billingCycle, setBillingCycle] = useState<"yearly" | "lifetime">(
    "yearly"
  );

  // Define ONLY base configuration - prices are calculated automatically
  const yearlyPlansConfig: PricingPlanConfig[] = [
    {
      devices: 1,
      originalPrice: "9.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/704b74da-300e-49ee-a7e0-2cf334c3a6e5",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/ee6eb115-6292-4985-a0f0-39e82e97fcf5",
      },
    },
    {
      devices: 2,
      originalPrice: "16.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: true,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/6811a31d-421d-4e96-bdde-32a1eb4627e4",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/96664a60-99d5-4958-a943-1430e7ec926f",
      },
    },
    {
      devices: 5,
      originalPrice: "39.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/4e31ecd7-b0b8-4c3c-9ff4-d250c6fb9d87",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/088e8a66-d9e1-4606-b3ff-ffb807394ab7",
      },
    },
  ];

  const lifetimePlansConfig: PricingPlanConfig[] = [
    {
      devices: 1,
      originalPrice: "28.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/704b74da-300e-49ee-a7e0-2cf334c3a6e5",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/ee6eb115-6292-4985-a0f0-39e82e97fcf5",
      },
    },
    {
      devices: 2,
      originalPrice: "49.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: true,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/6811a31d-421d-4e96-bdde-32a1eb4627e4",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/96664a60-99d5-4958-a943-1430e7ec926f",
      },
    },
    {
      devices: 5,
      originalPrice: "109.99",
      savingsPercentage: "40%", // 👈 ONLY CHANGE THIS for discount
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/4e31ecd7-b0b8-4c3c-9ff4-d250c6fb9d87",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/088e8a66-d9e1-4606-b3ff-ffb807394ab7",
      },
    },
  ];

  // Calculate pricing automatically using useMemo for performance
  const yearlyPlans = useMemo(
    () => yearlyPlansConfig.map(calculatePricing),
    [yearlyPlansConfig]
  );

  const lifetimePlans = useMemo(
    () => lifetimePlansConfig.map(calculatePricing),
    [lifetimePlansConfig]
  );

  const renderPricingCard = (
    plan: PricingPlan,
    cycle: "yearly" | "lifetime"
  ) => {
    const features = [
      `Use on ${plan.devices} ${plan.devices === 1 ? "device" : "devices"}`,
      "Free updates",
      ...(cycle === "yearly"
        ? ["No automatic renewal", "No recurring billing", "One-time purchase for full year"]
        : ["Lifetime access"]),
    ];

    const premiumFeatures = [
      "Reminder theme customization",
      "Sound customization",
      "Screen on time tracking",
      "To-do list manager",
      "Pending task reminder",
      "Workday setup",
      "Screen savers",
      "All features from future updates",
    ];

    return (
      <div className={`relative ${plan.isRecommended ? 'scale-105 z-10' : ''}`}>
        {plan.isRecommended && (
          <div className="absolute -top-5 left-0 right-0 bg-gradient-to-r from-[#FE4C55] to-[#FF6B73] text-white text-center py-2 px-4 rounded-t-xl text-sm font-heading font-semibold">
            RECOMMENDED
          </div>
        )}
        <Card
          className={`flex flex-col h-full overflow-hidden ${plan.isRecommended
            ? "border-2 border-[#FE4C55] shadow-xl bg-gradient-to-b from-[#FE4C55]/5 to-transparent"
            : "border-gray-200 dark:border-gray-800"
            }`}
        >
          <CardHeader className={`text-center pb-4 ${plan.isRecommended ? 'pt-8' : 'pt-6'}`}>
            <CardTitle className="text-2xl font-heading">
              {plan.devices} {plan.devices === 1 ? "Device" : "Devices"}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {cycle === "yearly" ? "One-time payment" : "One-time payment"}
            </CardDescription>
          </CardHeader>

          <div className="sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
            <CardContent className="pt-0 pb-4">
              <div className="text-center mb-3">
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-heading font-bold ${plan.isRecommended
                    ? "text-[#FE4C55]"
                    : "text-gray-900 dark:text-gray-100"
                    }`}>
                    {plan.price}
                  </span>
                  {plan.savings && (
                    <span className="text-4xl font-heading text-gray-400 dark:text-gray-500 line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">
                    {cycle === "yearly" ? "/year" : ""}
                  </span>
                </div>
                {/* Display savings percentage */}
                {plan.savingsPercentage && (
                  <div className="mt-2">
                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-heading font-semibold">
                      Save {plan.savingsPercentage} ({plan.savings})
                    </span>
                  </div>
                )}
              </div>

              <Button
                asChild
                className={`w-full h-11 font-heading font-semibold ${plan.isRecommended
                  ? "bg-[#FE4C55] hover:bg-[#FE4C55]/90 text-white shadow-lg"
                  : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                  }`}
              >
                <a
                  href={
                    cycle === "yearly"
                      ? plan.checkoutLink.yearly
                      : plan.checkoutLink.lifetime
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Started
                </a>
              </Button>
            </CardContent>
          </div>

          <CardContent className="flex-grow pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  What's included
                </p>
                <ul className="space-y-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`rounded-full p-0.5 mt-0.5 ${plan.isRecommended
                        ? "bg-[#FE4C55]"
                        : "bg-gray-400 dark:bg-gray-600"
                        }`}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Premium Features
                </p>
                <ul className="space-y-3">
                  {premiumFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`rounded-full p-0.5 mt-0.5 ${plan.isRecommended
                        ? "bg-[#FE4C55]"
                        : "bg-gray-400 dark:bg-gray-600"
                        }`}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="mx-auto container">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-heading font-bold tracking-tight sm:text-6xl">
          {pricingHeader("title")}
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-6xl mx-auto">
          {pricingHeader("description")}
        </p>
      </div>

      <Tabs
        defaultValue="yearly"
        className="w-full"
        onValueChange={(value) =>
          setBillingCycle(value as "yearly" | "lifetime")
        }
      >
        <div className="flex justify-center mb-12">
          <TabsList className="h-11 p-1 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800">
            <TabsTrigger
              value="yearly"
              className="px-6 rounded-full data-[state=active]:bg-[#FE4C55] data-[state=active]:text-black data-[state=active]:shadow-md transition-all duration-200 font-heading font-medium text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              Yearly
            </TabsTrigger>
            <TabsTrigger
              value="lifetime"
              className="px-6 rounded-full data-[state=active]:bg-[#FE4C55] data-[state=active]:text-black data-[state=active]:shadow-md transition-all duration-200 font-heading font-medium text-black dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
            >
              Lifetime
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="yearly" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {yearlyPlans.map((plan, index) => (
              <div key={index}>{renderPricingCard(plan, "yearly")}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lifetime" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {lifetimePlans.map((plan, index) => (
              <div key={index}>{renderPricingCard(plan, "lifetime")}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400 text-center">
        For discounts, enterprise, or student pricing:{" "}
        <a
          href="mailto:alnoman.dhoni@gmail.com"
          className="text-[#FE4C55] hover:underline font-medium"
        >
          alnoman.dhoni@gmail.com
        </a>
      </p>
    </div>
  );
}
