import Link from "next/link";
import { HoverCardTrigger, HoverCardContent, HoverCard } from "./ui/hover-card";

const HeroSection = () => {
  return (
    <div className="container flex max-w-[80rem] flex-col items-center gap-4 text-center">
      <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
        <span className=" text-[#FE4C55]">Blink Eye</span> <br />
        <span>
          A minimalist eye care reminder app for Windows, macOS, and Linux.
        </span>
      </h1>
      <p className="max-w-[900px] mt-2 text-center text-base sm:text-lg md:text-xl text-muted-foreground">
        To reduce eye strain, featuring reminder with timers, full-screen
        popups. Based on{" "}
        <HoverCard>
          <HoverCardTrigger>
            <span className="text-[#FE4C55] cursor-help">20-20-20 </span>
          </HoverCardTrigger>
          <HoverCardContent>
            by
            <Link
              href="https://www.aao.org/eye-health/tips-prevention/computer-usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              American Academy of Ophthalmology
            </Link>
          </HoverCardContent>
        </HoverCard>
        rule.
      </p>
    </div>
  );
};

export default HeroSection;
