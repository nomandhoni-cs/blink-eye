import Link from "next/link";
import { HoverCardTrigger, HoverCardContent, HoverCard } from "./ui/hover-card";
import { useTranslations } from "next-intl";
import Image from "next/image";
const HeroSection = () => {
  const t = useTranslations("HeroBanner");
  return (
    <div className="flex max-w-[1440px] mx-auto flex-col items-center gap-4 text-center lg:mb-24">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Image
          src="https://p2myfh92qq.ufs.sh/f/93hqarYp4cDdY0euKxvcTyVLEjQxOU1ovp9SM8PzDAnJKZs2"
          alt="Blink Eye Logo"
          width={40}
          height={40}
        />
        <h2 className="text-4xl font-heading motion-preset-blur-right">
          Introducing Blink Eye
        </h2>
      </div>
      <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl motion-preset-blur-right">
        {t("tagline")}
      </h1>
      <div className="max-w-[1000px] mt-2 text-center text-base sm:text-lg md:text-xl text-muted-foreground motion-preset-blur-right">
        {t("span1")}{" "}
        <HoverCard>
          <HoverCardTrigger>
            <span className="text-[#FE4C55] cursor-help">{t("202020")} </span>
          </HoverCardTrigger>
          <HoverCardContent>
            by
            <Link
              href="https://www.aao.org/eye-health/tips-prevention/computer-usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              {t("institute")}
            </Link>
          </HoverCardContent>
        </HoverCard>
        {t("span2")}
      </div>
      <div className="flex items-center justify-center gap-2 mt-2 motion-preset-blur-right">
        <Image
          src="https://p2myfh92qq.ufs.sh/f/93hqarYp4cDdjZZQwahyxJHVZk154Yhc37X0ag2LBmlSIEqj"
          alt="User's of Blink Eye"
          width={80}
          height={40}
        />
        <span className="text-muted-foreground">
          Used and Trusted by <b>4,000+</b> Users
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
