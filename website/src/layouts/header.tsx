
import { Github, TwitterIcon } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/configs/site";
import { useEffect, useState } from "react";

// Function to fetch GitHub stars
async function getGitHubStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/nomandhoni-cs/blink-eye"
    );

    if (!response.ok) {
      console.error("Failed to fetch GitHub stars");
      return null;
    }

    const json = await response.json();

    return parseInt(json["stargazers_count"], 10).toLocaleString(); // Ensure base 10
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return null;
  }
}
const Header = () => {
  const [stars, setStars] = useState<string | null>(null);

  useEffect(() => {
    // Fetch GitHub stars when the component mounts
    const fetchData = async () => {
      const starCount = await getGitHubStars();
      setStars(starCount);
    };

    fetchData();
  }, []);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-opacity-75 backdrop-blur-lg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 ">
        <div className="flex items-center space-x-6 font-medium ">
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Ba Eye Logo" height="40px" width="40px" />
            <span className="text-xl font-bold tracking-tight">Blink Eye</span>
          </a>
          <div className="hidden sm:block items-center space-x-6 font-medium">
            <a href="/features">
              <span>Features</span>
            </a>
            <a href="/about">
              <span>About</span>
            </a>
            <a href="/pricing">
              <span>Pricing</span>
            </a>
            <a href="/changelog">
              <span>Release Notes</span>
            </a>
            <a href="/contribute">
              <span>Contribute</span>
            </a>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-0 sm:space-x-1">
            {stars && (
              <Button asChild variant="outline">
                <a
                  href="https://github.com/nomandhoni-cs/ba-eye"
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
                </a>
              </Button>
            )}
            {/* <a
              href="https://www.producthunt.com/posts/ba-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ba&#0045;eye"
              target="_blank"
              className="invisible sm:visible"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=light"
                alt="Ba&#0032;Eye - A&#0032;minimalist&#0032;eye&#0032;care&#0032;reminder&#0032;app&#0032;based&#0032;on&#0032;20&#0045;20&#0045;20&#0032;rule&#0046; | Product Hunt"
                style={{ width: "250px", height: "54px" }}
                width="250"
                height="54"
              />
            </a> */}
            {/* <Button variant="ghost" size="icon" asChild>
              <a
                href={CONFIG.github}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Github</span>
              </a>
            </Button> */}

            <Button variant="ghost" size="icon" asChild>
              <a
                href={CONFIG.twitter}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                <span className="sr-only">Visit Twitter</span>
                <TwitterIcon />
              </a>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
export default Header