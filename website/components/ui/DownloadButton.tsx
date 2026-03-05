//ui/DownloadButton.tsx
import React from "react";
import Link from "next/link";
import { Button } from "./button";

interface DownloadButtonProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

const DownloadButton = ({
  href,
  label,
  icon,
  className,
}: DownloadButtonProps) => {
  return (
    <Button
      asChild
      className={`bg-[#FE4C55] hover:bg-[#FE4C55]/90 h-14 sm:h-16 py-4 px-6 rounded-full flex items-center space-x-2 w-full ${className ?? ""}`}
    >
      <Link href={href} className="flex items-center space-x-2 w-full">
        {icon}
        <span className="text-base sm:text-lg text-black font-medium">
          {label}
        </span>
      </Link>
    </Button>
  );
};

export default DownloadButton;
