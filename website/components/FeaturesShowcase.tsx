"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import enMessages from "@/messages/en.json";

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);
const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

// Image file names live in code (not translated) and exist in both
// /public/features/light and /public/features/dark. Text lives in
// messages/*.json under "featuresShowcase" so every locale can translate it.
const SHOWCASE_IMAGES: Record<string, string> = {
  dashboard: "dashboard-1.webp",
  "reminder-settings": "reminder-settings-2.webp",
  "usage-time": "usage-time-3.webp",
  "reminder-themes": "reminder-themes-4.webp",
  "multi-monitor": "multi-monitor-5.webp",
  "todo-list": "todo-list-6.webp",
  "workday-setup": "workday-setup-7.webp",
  "screen-savers": "screen-savers-8.webp",
  settings: "settings-9.webp",
  "theme-picker": "theme-picker-10.webp",
  "activate-license": "activate-license-11.webp",
  about: "about-12.webp",
};

type ShowcaseItem = {
  id: string;
  category: string;
  title: string;
  motto: string;
  longMotto: string;
  description: string;
  bullets: string[];
  keywords: string;
};

const FALLBACK_ITEMS = enMessages.featuresShowcase as ShowcaseItem[];

export default function FeatureShowcase() {
  const t = useTranslations();
  const header = t.raw("featuresShowcaseHeader") as {
    title: string;
    description: string;
  };
  let items: ShowcaseItem[] = FALLBACK_ITEMS;
  try {
    const raw = t.raw("featuresShowcase") as ShowcaseItem[] | undefined;
    if (Array.isArray(raw) && raw.length > 0 && raw[0]?.motto) {
      items = raw;
    }
  } catch {
    items = FALLBACK_ITEMS;
  }

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible")
        ),
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    containerRef.current
      ?.querySelectorAll(".fade-in-scroll")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .fade-in-scroll {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.6s ease,
            transform 0.6s ease;
        }
        .fade-in-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        * {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      <section
        className="w-full py-16 lg:py-24 bg-white dark:bg-zinc-950"
        ref={containerRef}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-10 fade-in-scroll">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight bg-gradient-to-r from-[#ff80b5] via-[#FE4C55] to-[#9089fc] bg-clip-text text-transparent">
              {header.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              {header.description}
            </p>
          </div>

          {/* App showcase: wide pure screenshot first, supporting text panel after */}
          <div className="mx-auto max-w-6xl space-y-20 lg:space-y-24">
            {items.map((item, index) => {
              const image = SHOWCASE_IMAGES[item.id] ?? SHOWCASE_IMAGES.dashboard;
              return (
                <article
                  key={item.id}
                  id={`feature-${item.id}`}
                  aria-labelledby={`feature-${item.id}-motto`}
                  className="fade-in-scroll scroll-mt-24"
                >
                  {/* Pure screenshot, no frame, no card, edge to edge.
                      Light shot by default, dark shot from /features/dark
                      when the site is in dark mode (pure CSS swap, no flash). */}
                  <div>
                    <Image
                      src={`/features/light/${image}`}
                      alt={`${item.title}: ${item.motto}. ${item.longMotto}`}
                      width={1600}
                      height={1028}
                      className="w-full h-auto dark:hidden"
                      placeholder="blur"
                      blurDataURL={rgbDataURL(245, 245, 245)}
                      loading={index < 2 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="(max-width: 1152px) 100vw, 1152px"
                    />
                    <Image
                      src={`/features/dark/${image}`}
                      alt={`${item.title}: ${item.motto}. ${item.longMotto}`}
                      width={1600}
                      height={1028}
                      className="hidden w-full h-auto dark:block"
                      placeholder="blur"
                      blurDataURL={rgbDataURL(10, 10, 10)}
                      loading={index < 2 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="(max-width: 1152px) 100vw, 1152px"
                    />
                  </div>

                  {/* Supporting copy on a warm tinted panel, readable width */}
                  <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[2rem] border border-red-100/80 dark:border-white/10 bg-gradient-to-b from-red-50/70 via-zinc-50 to-zinc-100/90 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-950 px-6 py-9 sm:p-11 shadow-[0_24px_60px_-32px_rgba(254,76,85,0.35)]">
                    <p className="font-heading text-xs font-bold uppercase tracking-[0.22em] text-red-500 dark:text-red-400">
                      {item.title} · {item.category}
                    </p>

                    {/* SEO headline: the motto people actually search for */}
                    <h3
                      id={`feature-${item.id}-motto`}
                      className="font-heading mt-3 text-2xl sm:text-[2rem] sm:leading-[2.5rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                    >
                      {item.motto}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-7 text-zinc-500 dark:text-zinc-400">
                      {item.longMotto}
                    </p>
                    <p className="mt-4 max-w-3xl text-[17px] leading-8 text-zinc-700 dark:text-zinc-200">
                      {item.description}
                    </p>

                    <div className="my-7 h-px bg-gradient-to-r from-transparent via-red-200 dark:via-red-900/60 to-transparent" />

                    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {item.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 shadow-sm">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </span>
                          <span className="text-[15px] font-medium leading-7 text-zinc-800 dark:text-zinc-100">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="sr-only">{item.keywords}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
