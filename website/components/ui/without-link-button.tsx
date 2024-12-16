import Link from "next/link";
import { Button } from "./button";

export const EmptyButtonWithoutLink = ({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full cursor-pointer">
      <Button
        asChild
        className="bg-[#FE4C55] hover:bg-[#FE4C55] h-16 py-4 px-6 rounded-full flex items-center space-x-1 w-full"
      >
        <span className="flex items-center space-x-2 w-full">
          {icon}
          <span className="text-lg text-black">{label}</span>
        </span>
      </Button>
    </div>
  );
};

export const EmptyButtonWitLink = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      asChild
      className="bg-[#FE4C55] hover:bg-[#E2444C] h-10 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
    >
      <Link href={href} className="flex items-center space-x-2 w-36">
        {icon && <div className="text-black text-sm">{icon}</div>}
        <span className="text-sm font-medium ">{label}</span>
      </Link>
    </Button>
  );
};
