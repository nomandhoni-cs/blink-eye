
import Link from "next/link";
import { HoverCardTrigger, HoverCardContent, HoverCard } from "./ui/hover-card";


const HeroSection = () => {
  return (
    <>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1] max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        <span className="font-bold text-[#FE4C55]">Blink Eye</span> <br />A
        minimalist eye care reminder app for Windows, macOS, and Linux.
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
    </>
  );
}

export default HeroSection