import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import GradientBackground from "./GradientBackground";
const HeroSection = () => {
  const t = useTranslations("HeroBanner");
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      {/* Top gradient background */}
      <GradientBackground
        position="top"
        rotate={30}
        fromColor="#ff80b5"
        toColor="#FE4C55"
      />
      <div className="flex max-w-[1440px] mx-auto flex-col items-center gap-4 text-center mt-8 mb-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image
            src="https://utfs.io/f/93hqarYp4cDdY0euKxvcTyVLEjQxOU1ovp9SM8PzDAnJKZs2"
            alt="Blink Eye Logo"
            width={40}
            height={40}
          />
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading motion-preset-blur-right motion-duration-500">
            Introducing Blink Eye - The Open Source
          </h2>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl motion-preset-blur-right motion-duration-700 motion-preset-flomoji-👀">
          {t("tagline")}
        </h1>
        <div className="max-w-[1200px] mt-2 text-center text-base sm:text-lg md:text-xl text-muted-foreground motion-preset-blur-right motion-duration-1000">
          {t("span1")}{" "}
          <Popover>
            <PopoverTrigger>
              <span className="text-[#FE4C55] cursor-pointer">
                {t("202020")}
                {"  "}
              </span>
            </PopoverTrigger>
            <PopoverContent>
              by
              <Link
                href="https://www.aao.org/eye-health/tips-prevention/computer-usage"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                {t("institute")}
              </Link>
            </PopoverContent>
          </Popover>{" "}
          {t("span2")}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 motion-preset-blur-right motion-duration-1000">
          <Image
            src="https://utfs.io/f/93hqarYp4cDdRor7EOWs3IvZkCG1g7rYl8WhFVBbNozK265e"
            alt="User's of Blink Eye"
            width={100}
            height={40}
            // className="h-10 w-auto"
          />
          <span className="text-muted-foreground">
            Used and Trusted by <b>5,000+</b> Users
          </span>
        </div>
      </div>
      {/* Bottom gradient background
      <GradientBackground
        position="bottom"
        rotate={0}
        fromColor="#ff80b5"
        toColor="#9089fc"
      /> */}
    </div>
  );
};

export default HeroSection;
