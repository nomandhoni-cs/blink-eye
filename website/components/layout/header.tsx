import { CONFIG } from "@/configs/site";
import { Github, Twitter } from "lucide-react";
import Link from "next/link";
import logo from "../../../blink-eye-logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "../ui/button";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-opacity-75 backdrop-blur-lg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 ">
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <Image src={logo} alt="Blink Eye Logo" height={40} />
            <span className="text-xl font-bold tracking-tight">Blink Eye</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={CONFIG.github}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Github</span>
                <Github />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link
                href={CONFIG.twitter}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Twitter</span>
                <Twitter />
              </Link>
            </Button>

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
