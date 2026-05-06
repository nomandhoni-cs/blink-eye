"use client";

import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Link from "next/link";
import ProductHuntWidget from "../ProductHunt";
import { useLocale } from "next-intl";
import Image from "next/image";

import { ArrowUpRight } from "lucide-react";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import GradientBackground from "../GradientBackground";

// Restructured navigation with logical SaaS categories
const navigation = {
  product: [
    { name: "Features", link: "features" },
    { name: "Download", link: "download" },
    { name: "Pricing", link: "pricing" },
    { name: "Changelog", link: "changelog" },
  ],
  resources: [
    { name: "How To Use", link: "howtouse" },
    { name: "How BlinkEye Helps", link: "howblinkeyehelps" },
  ],
  company: [
    { name: "About", link: "about" },
    { name: "Contribute", link: "posts/contribute" },
    { name: "Privacy", link: "privacy" },
    { name: "Goodbye", link: "goodbye" },
  ],
};

export const Footer = () => {
  const locale = useLocale();
  const currentYear = getCurrentYear();

  return (
    // 'isolate' to start a new stacking context, NO overflow-hidden so gradients bleed
    <footer className="relative isolate w-full border-t border-border bg-background/50 backdrop-blur-3xl mt-16 sm:mt-24">

      {/* Background Gradients that bleed perfectly without blocking clicks */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GradientBackground
          position="top"
          rotate={30}
          fromColor="#ff80b5"
          toColor="#FE4C55"
        />
        <GradientBackground
          position="bottom"
          rotate={0}
          fromColor="#fe4c55"
          toColor="#9089fc"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">

        {/* TOP CTA SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 mb-12 border-b border-border/50">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
              Ready to improve your{" "}
              <span className="text-[#FE4C55]">productivity?</span>
            </h3>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Use our innovation to improve your health and stay focused.
            </p>
          </div>
          <Link
            href="/en/download"
            className="group flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold transition-all hover:scale-105 hover:bg-[#FE4C55] hover:text-white shadow-sm"
          >
            Start taking care
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* MAIN LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column (Spans wider on large screens) */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Image
                src="/newlogo.svg"
                alt="Blink Eye Logo"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="text-xl font-heading font-bold tracking-tight">
                blinkeye
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Eye care and break time reminder tool designed to prevent eye strain and improve your digital wellbeing.
            </p>
            <div className="pt-2">
              <Link
                href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Blink Eye on Product Hunt"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <ProductHuntWidget />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">Product</h4>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.link}>
                  <Link
                    href={`/${locale}/${item.link}`}
                    className="text-sm text-muted-foreground hover:text-[#FE4C55] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">Resources</h4>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.link}>
                  <Link
                    href={`/${locale}/${item.link}`}
                    className="text-sm text-muted-foreground hover:text-[#FE4C55] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">Company</h4>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.link}>
                  <Link
                    href={`/${locale}/${item.link}`}
                    className="text-sm text-muted-foreground hover:text-[#FE4C55] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SUB-FOOTER */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Blink Eye. All rights reserved.
          </div>

          <div className="flex items-center gap-5">
            <Link
              href={CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </Link>
            <Link
              href={CONFIG.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              aria-label="X (Twitter)"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
            </Link>
            <Link
              href={CONFIG.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#5865F2] transition-colors"
              aria-label="Discord"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
            </Link>
            <Link
              href={CONFIG.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* GIANT WATERMARK TEXT */}
        <div className="mt-12 flex justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[18vw] sm:text-[15vw] font-heading font-bold leading-none tracking-tighter text-foreground/[0.03] dark:text-foreground/[0.02]">
            blinkeye
          </span>
        </div>

      </div>
    </footer>
  );
};