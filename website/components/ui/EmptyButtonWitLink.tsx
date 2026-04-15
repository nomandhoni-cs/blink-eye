import React from "react";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils"; // Make sure you have this utility, or use template literals

// ============================================
// EmptyButtonWithoutLink (for Popover triggers, etc.)
// ============================================
interface EmptyButtonWithoutLinkProps {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const EmptyButtonWithoutLink = React.forwardRef<
  HTMLButtonElement,
  EmptyButtonWithoutLinkProps
>(({ label, icon, className, onClick, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      onClick={onClick}
      className={cn(
        "bg-[#FE4C55] hover:bg-[#FE4C55]/90 h-14 sm:h-16 px-6 sm:px-8 rounded-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all",
        className
      )}
      {...props}
    >
      {icon && <span className="text-black">{icon}</span>}
      <span className="text-base sm:text-lg font-medium text-black whitespace-nowrap">
        {label}
      </span>
    </Button>
  );
});

EmptyButtonWithoutLink.displayName = "EmptyButtonWithoutLink";

// ============================================
// EmptyButtonWitLink (for download links inside popovers, etc.)
// ============================================
interface EmptyButtonWitLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyButtonWitLink = ({
  href,
  label,
  icon,
  className,
}: EmptyButtonWitLinkProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "bg-[#FE4C55] hover:bg-[#E2444C] border-none h-11 sm:h-12 px-5 sm:px-6 rounded-full flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg",
        className
      )}
    >
      <Link href={href} className="flex items-center justify-center space-x-2">
        {icon && <span className="text-black">{icon}</span>}
        <span className="text-sm sm:text-base font-medium text-black whitespace-nowrap">
          {label}
        </span>
      </Link>
    </Button>
  );
};