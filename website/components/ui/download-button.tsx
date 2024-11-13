import Link from "next/link";
import { Button } from "./button";

const DownloadButton = ({
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
      className="bg-[#FE4C55] hover:bg-[#FE4C55] h-16 py-4 px-6 rounded-full flex items-center space-x-1 w-full"
    >
      <Link href={href} className="flex items-center space-x-2 w-full">
        {icon}
        <span className="text-lg">{label}</span>
      </Link>
    </Button>
  );
};

export default DownloadButton;