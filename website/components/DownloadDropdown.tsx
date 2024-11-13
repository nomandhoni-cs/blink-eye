import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, DownloadIcon } from "lucide-react";
import Link from "next/link";
const DownloadDropdown = ({
  links,
}: {
  links: { href: string; label: string }[];
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center p-2 w-full">
        <ChevronDown className="text-white dark:text-black" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => (
          <DropdownMenuItem key={link.href}>
            <Link href={link.href} className="flex items-center space-x-2">
              <DownloadIcon className="w-5 h-5" />
              <span className="text-sm">{link.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadDropdown;
