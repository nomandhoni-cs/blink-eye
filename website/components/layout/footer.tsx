import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Image from "next/image";
import Link from "next/link";
const routes = [
  "/about",
  "/contribute",
  "/features",
  "/howtouse",
  "/privacy",
  "/goodbye",
];
export const Footer = () => {
  const currentYear = getCurrentYear();
  return (
    <footer className="container border-t">
      <div className="text-center grid grid-cols-2 gap-4 md:grid-cols-3 lg:flex lg:justify-center lg:mt-4">
        {routes.map((route, index) => (
          <Link href={route} key={index}>
            <span className="mx-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              {route}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose md:text-left">
          © {currentYear}{" "}
          <a
            href={CONFIG.website}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="font-medium underline underline-offset-4"
          >
            Blink Eye™
          </a>{" "}
          All Rights Reserved | Made by{" "}
          <a
            href={CONFIG.twitter}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="font-medium underline underline-offset-4"
          >
            Noman Dhoni
          </a>
        </p>
        <p className="text-right text-sm leading-loose md:text-right">
          <a href={CONFIG.buymecoffee} target="_blank">
            <Image
              className="w-auto"
              src={
                "https://raw.githubusercontent.com/nomandhoni-cs/Showwand-Website/master/assets/images/bmc.webp"
              }
              alt="Buy me coffee for Noman Dhoni"
              width={200}
              height={50}
            />
          </a>
        </p>
      </div>
    </footer>
  );
};
