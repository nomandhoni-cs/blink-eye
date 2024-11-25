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
      <DropdownMenuTrigger
        className="flex items-center justify-center p-2 w-full"
        aria-label="Download options" // Accessible name for screen readers
        aria-haspopup="menu" // Indicates it has a popup menu
      >
        <ChevronDown className="text-black" />
      </DropdownMenuTrigger>

      <DropdownMenuContent role="menu" aria-label="Download options">
        {" "}
        {/* Menu label for screen readers */}
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => (
          <DropdownMenuItem
            key={link.href}
            role="menuitem" // Helps screen readers identify it as a menu item
          >
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
