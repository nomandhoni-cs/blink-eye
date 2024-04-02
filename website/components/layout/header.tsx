import { CONFIG } from "@/configs/site";
import { Github, TwitterIcon } from "lucide-react";
import Link from "next/link";
import logo from "../../../application/Assets/blink-eye-logo.png";
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
          <nav className="flex items-center space-x-0 sm:space-x-1">
            <Link
              href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
              target="_blank"
              className="invisible sm:visible"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=light"
                alt="Blink&#0032;Eye - A&#0032;minimalist&#0032;eye&#0032;care&#0032;reminder&#0032;app&#0032;based&#0032;on&#0032;20&#0045;20&#0045;20&#0032;rule&#0046; | Product Hunt"
                style={{ width: "250px", height: "54px" }}
                width="250"
                height="54"
              />
            </Link>
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
                <TwitterIcon />
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
