import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ExternalLink, Star } from "lucide-react";
import GradientBackground from "./GradientBackground";

const HeroSection = () => {
  const t = useTranslations("HeroBanner");

  return (
    <section className="relative isolate w-full">
      {/* 
        Top gradient — pointer-events-none ensures it never blocks clicks
        -z-10 pushes it behind all content
      */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible" aria-hidden="true">
        <GradientBackground
          position="top"
          rotate={30}
          fromColor="#ff80b5"
          toColor="#FE4C55"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-16">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/80">
            <Image
              src="/newlogo.svg"
              alt="Blink Eye Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-medium text-muted-foreground">
              Introducing blinkeye - The Open Source
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight">
              {t("tagline")}
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-5xl leading-relaxed text-balance">
            {t("span1")}{" "}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[#FE4C55] font-semibold hover:underline underline-offset-4 decoration-[#FE4C55]/40 transition-all cursor-pointer"
                >
                  {t("202020")}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={8}
                className="w-80 p-4 rounded-xl shadow-lg"
              >
                <div className="space-y-2">
                  <Link
                    href="https://www.aao.org/eye-health/tips-prevention/computer-usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#FE4C55] hover:underline underline-offset-2 mt-1 font-medium"
                  >
                    {t("institute")}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </PopoverContent>
            </Popover>{" "}
            {t("span2")}
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4">
            <div className="flex items-center gap-3">
              <Image
                src="/startpage/avatars.webp"
                alt="User's of Blink Eye"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-border" />

            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Used and Trusted by <b>13,000+</b> Users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Bottom gradient — pointer-events-none + -z-10
        This is the KEY fix: clicks pass straight through to buttons below
      */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible" aria-hidden="true">
        <GradientBackground
          position="bottom"
          rotate={0}
          fromColor="#ff80b5"
          toColor="#9089fc"
        />
      </div>
    </section>
  );
};

export default HeroSection;