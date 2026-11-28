import Link from "next/link";
import type { Post } from "@/interfaces/post";

type Promotion = Exclude<Post["promotion"], false | undefined>;

const defaultPromotion = {
  title: "Give your eyes a healthier screen-time routine",
  description:
    "Blink Eye gently reminds you to take regular breaks, helping you build better screen habits on Windows, macOS, and Linux.",
  buttonText: "Download Blink Eye for free",
  buttonHref: "/en/download",
};

export function PostPromotion({ promotion }: { promotion: Post["promotion"] }) {
  if (promotion === false) return null;

  const content = { ...defaultPromotion, ...promotion };

  return (
    <aside className="relative mt-14 overflow-hidden rounded-2xl border border-[#FE4C55]/20 bg-gradient-to-br from-[#FE4C55]/10 via-background to-[#9089fc]/10 p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#FE4C55]/10 blur-3xl"
      />
      <div className="relative max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FE4C55]">
          A little help for your screen time
        </p>
        <h2 className="text-2xl font-heading font-bold tracking-tight sm:text-3xl">
          {content.title}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {content.description}
        </p>
        <Link
          href={content.buttonHref}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#FE4C55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e83b45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4C55] focus-visible:ring-offset-2"
        >
          {content.buttonText}
        </Link>
      </div>
    </aside>
  );
}
