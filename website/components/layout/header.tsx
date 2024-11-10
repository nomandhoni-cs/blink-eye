import { CONFIG } from "@/configs/site";
import { Github, TwitterIcon } from "lucide-react";
import Link from "next/link";
import logo from "../../public/logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "../ui/button";
import Image from "next/image";
async function getGitHubStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/nomandhoni-cs/blink-eye",
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response?.ok) {
      return null;
    }

    const json = await response.json();

    return parseInt(json["stargazers_count"]).toLocaleString();
  } catch (error) {
    return null;
  }
}
export const Header = async () => {
  const stars = await getGitHubStars();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-opacity-75 backdrop-blur-lg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 ">
        <div className="flex items-center space-x-6 font-medium ">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={logo} alt="Blink Eye Logo" height={40} />
            <span className="text-xl font-bold tracking-tight">Blink Eye</span>
          </Link>
          <div className="hidden sm:block items-center space-x-6 font-medium">
            <Link href="/features">
              <span>Features</span>
            </Link>
            <Link href="/about">
              <span>About</span>
            </Link>
            <Link href="/pricing">
              <span>Pricing</span>
            </Link>
            <Link href="/changelog">
              <span>Release Notes</span>
            </Link>
            <Link href="/contribute">
              <span>Contribute</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-0 sm:space-x-1">
            {stars && (
              <Button asChild variant="outline">
                <Link
                  href="https://github.com/nomandhoni-cs/blink-eye"
                  target="_blank"
                  rel="noreferrer"
                  className="flex space-x-2"
                >
                  {" "}
                  <span className="hidden sm:block">Open Source</span>
                  <div className="flex h-8 w-8 items-center justify-center space-x-2">
                    <Github />
                  </div>
                  {stars} <span className="ml-1 hidden sm:block"> Stars</span>
                </Link>
              </Button>
            )}
            {/* <Link
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
            </Link> */}
            {/* <Button variant="ghost" size="icon" asChild>
              <Link
                href={CONFIG.github}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Github</span>
              </Link>
            </Button> */}

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
