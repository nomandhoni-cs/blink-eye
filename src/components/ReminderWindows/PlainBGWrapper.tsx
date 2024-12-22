import React from "react";
import DefaultBackground from "../backgrounds/DefaultBackground";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import toast from "react-hot-toast";
import { supportMessages } from "../../lib/supportMessages";
import { HeartHandshake } from "lucide-react";

const PlainBGWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { canAccessPremiumFeatures } = usePremiumFeatures();

  if (!canAccessPremiumFeatures) {
    // Pick a random message from the supportMessages array
    const randomMessage =
      supportMessages[Math.floor(Math.random() * supportMessages.length)];

    toast.success(randomMessage, {
      duration: 8000,
      position: "bottom-right",
      className:
        "bg-white dark:bg-black text-gray-800 dark:text-white p-2 w-96",
      icon: <HeartHandshake />,
    });
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <DefaultBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default PlainBGWrapper;
