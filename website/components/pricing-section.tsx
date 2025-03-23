"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const metadata: Metadata = {
  title: "Pricing",
};
interface PricingPlan {
  devices: number;
  price: string;
  originalPrice: string;
  savings: string | null;
  savingsPercentage: string | null;
  isRecommended: boolean;
  checkoutLink: {
    yearly: string;
    lifetime: string;
  };
}

export default function PricingSection() {
  const pricingHeader = useTranslations("pricingSectionHeader");
  const [billingCycle, setBillingCycle] = useState<"yearly" | "lifetime">(
    "yearly"
  );

  const yearlyPlans: PricingPlan[] = [
    {
      devices: 1,
      price: "$9.99",
      originalPrice: "$9.99",
      savings: null,
      savingsPercentage: null,
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
      price: "$16.99",
      originalPrice: "$19.98",
      savings: "$3.00",
      savingsPercentage: "15%",
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
      price: "$39.99",
      originalPrice: "$49.95",
      savings: "$9.96",
      savingsPercentage: "20%",
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/4e31ecd7-b0b8-4c3c-9ff4-d250c6fb9d87",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/088e8a66-d9e1-4606-b3ff-ffb807394ab7",
      },
    },
  ];

  const lifetimePlans: PricingPlan[] = [
    {
      devices: 1,
      price: "$28.99",
      originalPrice: "$28.99",
      savings: null,
      savingsPercentage: null,
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
      price: "$49.99",
      originalPrice: "$57.98",
      savings: "$8.00",
      savingsPercentage: "14%",
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
      price: "$109.99",
      originalPrice: "$144.95",
      savings: "$34.96",
      savingsPercentage: "24%",
      isRecommended: false,
      checkoutLink: {
        yearly:
          "https://blinkeye.lemonsqueezy.com/buy/4e31ecd7-b0b8-4c3c-9ff4-d250c6fb9d87",
        lifetime:
          "https://blinkeye.lemonsqueezy.com/buy/088e8a66-d9e1-4606-b3ff-ffb807394ab7",
      },
    },
  ];

  const renderPricingCard = (
    plan: PricingPlan,
    cycle: "yearly" | "lifetime"
  ) => {
    return (
      <Card
        className={`flex flex-col h-full ${
          plan.isRecommended
            ? "border-[#FE4C55] dark:border-[#FE4C55] shadow-md"
            : ""
        }`}
      >
        <CardHeader className="flex flex-col items-center text-center">
          {plan.isRecommended && (
            <div className="mb-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#FE4C55] dark:bg-[#FE4C55] text-white">
              Recommended
            </div>
          )}
          <CardTitle className="text-xl">
            {plan.devices} {plan.devices === 1 ? "Device" : "Devices"}
          </CardTitle>
          <CardDescription>
            {cycle === "yearly"
              ? "One-time payment for a full year"
              : "One-time payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center text-center">
          <div className="mb-4">
            <span className="text-4xl font-bold text-[#FE4C55] dark:text-[#FE4C55]">
              {plan.price}
            </span>
            <span className="text-muted-foreground ml-1">
              {cycle === "yearly" ? "/year" : ""}
            </span>
          </div>

          {plan.savings && (
            <div className="mb-4 space-y-1">
              <p className="text-sm text-muted-foreground line-through">
                Original: {plan.originalPrice}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-[#FE4C55] dark:text-[#FE4C55]">
                  Save {plan.savings}
                </p>
                <div className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#FE4C55]/10 dark:bg-[#FE4C55]/10 border border-[#FE4C55] dark:border-[#FE4C55] text-[#FE4C55] dark:text-[#FE4C55]">
                  {plan.savingsPercentage} OFF
                </div>
              </div>
            </div>
          )}

          <ul className="space-y-2 text-left w-full mt-4">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>
                Use on {plan.devices}{" "}
                {plan.devices === 1 ? "device" : "devices"}
              </span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Free updates</span>
            </li>
            {cycle === "yearly" && (
              <>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
                  <span>No automatic renewal</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
                  <span>No recurring billing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
                  <span>One-time purchase for full year</span>
                </li>
              </>
            )}
            {cycle === "lifetime" && (
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
                <span>Lifetime access</span>
              </li>
            )}

            <Separator className="my-3" />
            <p className="text-sm font-medium mb-1">Premium Features:</p>

            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Reminder theme customization</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Sound customization</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Screen on time tracking</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>To-do list manager</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Pending task reminder</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Workday setup</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>Screen savers</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 fill-[#FE4C55] dark:fill-[#FE4C55] text-white dark:text-black" />
              <span>All features from future updates</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            asChild
            className="w-full bg-[#FE4C55] hover:bg-[#FE4C55]/90 dark:bg-[#FE4C55] dark:hover:bg-[#FE4C55]/90 text-white border-none"
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
              Get a License
            </a>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="relative px-6 py-2 sm:py-2 lg:px-8 space-y-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          {pricingHeader("title")}
        </h2>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
        {pricingHeader("description")}
      </p>

      <Tabs
        defaultValue="yearly"
        className="w-full"
        onValueChange={(value) =>
          setBillingCycle(value as "yearly" | "lifetime")
        }
      >
        <div className="flex justify-center mb-8">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="yearly"
              className="data-[state=active]:bg-[#FE4C55] data-[state=active]:text-white"
            >
              Yearly Plans
            </TabsTrigger>
            <TabsTrigger
              value="lifetime"
              className="data-[state=active]:bg-[#FE4C55] data-[state=active]:text-white"
            >
              Lifetime Plans
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="yearly">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yearlyPlans.map((plan, index) => (
              <div key={index}>{renderPricingCard(plan, "yearly")}</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lifetime">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lifetimePlans.map((plan, index) => (
              <div key={index}>{renderPricingCard(plan, "lifetime")}</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <p className="mt-8 text-gray-600 dark:text-gray-300 text-center">
        For discount and enterprise purchase, student discount please contact
        us:{" "}
        <a
          href="mailto:alnoman.dhoni@gmail.com"
          className="text-[#FE4C55] hover:underline"
        >
          alnoman.dhoni@gmail.com
        </a>
      </p>
    </div>
  );
}
