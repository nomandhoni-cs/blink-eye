import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Image from "next/image";

export const Footer = () => {
  const currentYear = getCurrentYear();
  return (
    <footer className="container">
      <div className="flex  flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
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
