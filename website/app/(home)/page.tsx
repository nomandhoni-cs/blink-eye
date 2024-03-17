import DownloadApp from "@/components/download-app";
import OpenSource from "@/components/open-source";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";

const RootPage = () => {
  return (
    <section className="mx-auto flex flex-col items-center gap-3 sm:gap-5 py-8 md:py-16 md:pb-8 lg:py-24 lg:pb-8">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#FE4C55] to-[#FEF4E2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-sm md:max-w-3xl">
          <span className="font-bold text-[#FE4C55]"> Blink Eye </span> A
          minimalist eye care reminder app.
        </h1>
        <p className="max-w-[900px] mt-2 text-center text-lg text-muted-foreground sm:text-xl">
          To reduce eye strain, featuring reminder with timers, full-screen
          popups. Based on{" "}
          <HoverCard>
            <HoverCardTrigger>
              {" "}
              <span className="text-[#FE4C55] cursor-help">20-20-20 </span>
            </HoverCardTrigger>
            <HoverCardContent>
              by
              <Link
                href="https://www.aao.org/eye-health/tips-prevention/computer-usage#:~:text=Take%20regular%20breaks%20using%20the,for%20at%20least%2020%20seconds."
                target="_blank"
              >
                {" "}
                American Academy of Ophthalmology
              </Link>
            </HoverCardContent>
          </HoverCard>
          rule.
        </p>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#FE4C55] to-[#FEF4E2] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-8 sm:gap-16 md:gap-24">
        <DownloadApp />
        <OpenSource />
      </div>
    </section>
  );
};

export default RootPage;
