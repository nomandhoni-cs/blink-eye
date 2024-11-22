
import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/lib/year";
// import { getCurrentYear } from "@/utils/year";
import { Image } from "astro:assets";


const routes = [
  "/about",
  "/contribute",
  "/features",
  "/download",
  "/howtouse",
  "/privacy",
  "/goodbye",
  "/pricing",
  "/changelog",
];
 const Footer = () => {
  const currentYear = getCurrentYear();
  return (
    <footer className="container border-t z-10">
      <div className="text-center grid grid-cols-2 gap-4 md:grid-cols-3 lg:flex lg:justify-center lg:mt-4">
        {routes.map((route, index) => (
          <a href={route} key={index}>
            <span className="mx-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              {route}
            </span>
          </a>
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
            Ba Eye™
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
            <img
              className="w-[200px]"
              src="https://raw.githubusercontent.com/nomandhoni-cs/Showwand-Website/master/assets/images/bmc.webp"
              alt="Buy me coffee for Noman Dhoni"
              width="200px"
              height="50px"
            />
          </a>
          <a
            href="https://www.producthunt.com/posts/ba-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ba&#0045;eye"
            target="_blank"
            className="sm:invisible"
          >
            <img
            className="w-[200px]"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=light"
              alt="Ba&#0032;Eye - A&#0032;minimalist&#0032;eye&#0032;care&#0032;reminder&#0032;app&#0032;based&#0032;on&#0032;20&#0045;20&#0045;20&#0032;rule&#0046; | Product Hunt"
              width="250px"
              height="54px"
            />
          </a>
        </p>
      </div>
    </footer>
  );
};
export default Footer;