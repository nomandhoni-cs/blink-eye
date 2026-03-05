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
  links: { href?: string; label: string }[];
}) => {
  return (
    <DropdownMenu>
      {/* Trigger takes full height and width of its wrapper chunk */}
      <DropdownMenuTrigger
        className="flex h-full w-full items-center justify-center hover:bg-black/10 transition-colors rounded-r-full focus:outline-none"
        aria-label="More download options"
      >
        <ChevronDown className="w-5 h-5 text-black" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl shadow-xl p-2"
      >
        <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Alternative Binaries
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {links.map((link) => {
          if (!link.href) return null; // Don't render empty links
          return (
            <DropdownMenuItem
              key={link.label}
              asChild
              className="rounded-lg cursor-pointer hover:bg-accent focus:bg-accent"
            >
              <Link
                href={link.href}
                className="flex items-center space-x-3 w-full p-2"
              >
                <DownloadIcon className="w-4 h-4 text-[#FE4C55]" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadDropdown;