import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Link from "next/link";
import ProductHuntWidget from "../ProductHunt";
import { useLocale } from "next-intl";
const routes = [
  "/about",
  "/posts/contribute",
  "/features",
  "/download",
  "/howtouse",
  "/privacy",
  "/goodbye",
  "/pricing",
  "/changelog",
  "/howblinkeyehelps",
];
export const Footer = () => {
  const locale = useLocale();
  const currentYear = getCurrentYear();
  return (
    <footer className="container border-t z-10">
      <div className="text-center grid grid-cols-2 gap-4 md:grid-cols-3 lg:flex lg:justify-center lg:mt-4">
        {routes.map((route, index) => (
          <Link href={`/${locale}${route}`} key={index}>
            <span className="mx-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              {route}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose md:text-left">
          © {currentYear}{" "}
          <Link
            href={CONFIG.website}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="font-medium underline underline-offset-4"
          >
            Blink Eye™
          </Link>{" "}
          All Rights Reserved | Made by{" "}
          <Link
            href={CONFIG.twitter}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="font-medium underline underline-offset-4"
          >
            Noman Dhoni
          </Link>
        </p>
        <p className="text-right text-sm leading-loose md:text-right">
          {/* <Link href={CONFIG.buymecoffee} target="_blank">
            <Image
              className="w-auto"
              src={
                "https://raw.githubusercontent.com/nomandhoni-cs/Showwand-Website/master/assets/images/bmc.webp"
              }
              alt="Buy me coffee for Noman Dhoni"
              width={200}
              height={50}
            />
          </Link> */}
          <Link
            href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Blink Eye on Product Hunt"
            className="flex items-center space-x-2"
          >
            <ProductHuntWidget />
            <span className="sr-only">View Blink Eye on Product Hunt</span>
          </Link>
        </p>
      </div>
    </footer>
  );
};
