import Image from "next/image";
import type { Post } from "@/interfaces/post";
import {
  PlatformDownloadButton,
  type PlatformDownloads,
} from "@/app/_components/platform-download-button";

const defaultPromotion = {
  title: "Give your eyes a healthier screen-time routine",
  description:
    "Blink Eye gently reminds you to take regular breaks, helping you build better screen habits on Windows, macOS, and Linux.",
  buttonText: "Download Blink Eye for free",
  buttonHref: "/en/download",
};

export function PostPromotion({
  promotion,
  downloads,
}: {
  promotion: Post["promotion"];
  downloads: PlatformDownloads;
}) {
  if (promotion === false) return null;

  const content = { ...defaultPromotion, ...promotion };

  return (
    <aside className="relative mt-14 overflow-hidden rounded-3xl border border-[#FE4C55]/20 bg-gradient-to-br from-rose-50 via-white to-violet-50 p-6 shadow-sm dark:from-[#2a171a] dark:via-card dark:to-[#1c1a30] sm:mt-16 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-[#FE4C55]/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex items-start gap-4 sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 shadow-sm">
            <Image
              src="/newlogo.svg"
              alt="Blink Eye logo"
              width={42}
              height={44}
              className="h-10 w-10"
            />
          </div>
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FE4C55]">
              A little help for your screen time
            </p>
            <h2 className="text-2xl font-heading font-bold leading-tight tracking-tight sm:text-3xl">
              {content.title}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {content.description}
            </p>
          </div>
        </div>

        <PlatformDownloadButton
          downloads={downloads}
          fallbackHref={content.buttonHref}
          buttonText={content.buttonText}
        />
      </div>
    </aside>
  );
}
