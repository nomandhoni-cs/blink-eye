import { CONFIG } from "@/configs/site";
import Link from "next/link";
import logo from "../../public/logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "../ui/button";
import Image from "next/image";
import GitHubStarCount from "../GitHubStarCount";
export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-opacity-75 backdrop-blur-lg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 ">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3 mr-4">
          <Image src={logo} alt="Blink Eye Logo" height={40} width={40} />
          <span className="text-2xl font-bold tracking-wide">
            Blink Eye
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center space-x-6 text-base font-medium">
          {[
            { href: "/features", label: "Features" },
            { href: "/about", label: "About" },
            { href: "/pricing", label: "Pricing" },
            { href: "/changelog", label: "Release" },
            { href: "/contribute", label: "Contribute" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className=" transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-0 sm:space-x-1">
            <GitHubStarCount />
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={CONFIG.twitter}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Twitter</span>
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6  w-6 fill-current"
                >
                  <title>X</title>
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
