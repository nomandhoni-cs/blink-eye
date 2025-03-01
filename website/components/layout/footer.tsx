import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Link from "next/link";
import ProductHuntWidget from "../ProductHunt";
import { useLocale } from "next-intl";

import {
  ArrowUpRight,
  Github,
  Linkedin,
  PiggyBank,
  Twitter,
} from "lucide-react";

// Restructured navigation with name and link pairs
const navigation = {
  column1: [
    { name: "About", link: "/about" },
    { name: "Contribute", link: "/posts/contribute" },
    { name: "Features", link: "/features" },
  ],
  column2: [
    { name: "Download", link: "/download" },
    { name: "How To Use", link: "/howtouse" },
    { name: "Privacy", link: "/privacy" },
  ],
  column3: [
    { name: "Goodbye", link: "/goodbye" },
    { name: "Pricing", link: "/pricing" },
    { name: "Changelog", link: "/changelog" },
    { name: "How BlinkEye Helps", link: "/howblinkeyehelps" },
  ],
};

export const Footer = () => {
  const locale = useLocale();
  const currentYear = getCurrentYear();

  return (
    <footer className="w-full border-t border-border bg-background z-10">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Blink Eye™</h3>
            {/* <p className="text-sm text-muted-foreground">
              123 Innovation Street
              <br />
              Suite 456
              <br />
              San Francisco, CA 94103
            </p>
            <p className="text-sm text-muted-foreground">
              VAT ID: BL8522656985
            </p> */}
            <p className="text-right text-sm leading-loose md:text-right">
              <Link
                href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Blink Eye on Product Hunt"
                className="flex items-center space-x-2"
              >
                <ProductHuntWidget />
                <span className="sr-only">View Blink Eye on Product Hunt</span>
              </Link>
            </p>
          </div>

          {/* First Column of Links */}
          <div className="space-y-4">
            {navigation.column1.map((item) => (
              <div key={item.link}>
                <Link
                  href={`${locale}/${item.link}`}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Second Column of Links */}
          <div className="space-y-4">
            {navigation.column2.map((item) => (
              <div key={item.link}>
                <Link
                  href={`${locale}/${item.link}`}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Third Column of Links */}
          <div className="space-y-4">
            {navigation.column3.map((item) => (
              <div key={item.link}>
                <Link
                  href={`${locale}/${item.link}`}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 border-t border-border pt-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="max-w-md">
              <h3 className="text-2xl font-heading">
                Use our{" "}
                <span className="bg-[#FE4C55] px-1 rounded-full">
                  innovation to improve
                </span>{" "}
                your health and productivity.
              </h3>
            </div>
            <Link
              href="/download"
              className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start taking care
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        {/* Logo */}
        <div className="mt-16 border-t border-border py-4 sm:py-8">
          <h2 className="text-6xl font-heading text-center tracking-tighter md:text-8xl">
            blinkeye
          </h2>
        </div>
        {/* Bottom Section */}
        <div className=" flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
          <div className="text-sm text-muted-foreground">
            © Blink Eye {currentYear}. All rights reserved •{" "}
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>{" "}
            {/* •{" "}
            <Link href="/terms" className="hover:text-primary">
              Terms Policy
            </Link> */}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href={CONFIG.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href={CONFIG.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <PiggyBank className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href={CONFIG.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
// export const Footer = () => {
//   const locale = useLocale();
//   const currentYear = getCurrentYear();
//   return (
//     <footer className="container border-t z-10">
//       <div className="text-center grid grid-cols-2 gap-4 md:grid-cols-3 lg:flex lg:justify-center lg:mt-4">
//         {routes.map((route, index) => (
//           <Link href={`/${locale}${route}`} key={index}>
//             <span className="mx-2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
//               {route}
//             </span>
//           </Link>
//         ))}
//       </div>

//       <div className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
//         <p className="text-center text-sm leading-loose md:text-left">
//           © {currentYear}{" "}
//           <Link
//             href={CONFIG.website}
//             target="_blank"
//             rel="noreferrer noopener nofollow"
//             className="font-medium underline underline-offset-4"
//           >
//             Blink Eye™
//           </Link>{" "}
//           All Rights Reserved | Made by{" "}
//           <Link
//             href={CONFIG.twitter}
//             target="_blank"
//             rel="noreferrer noopener nofollow"
//             className="font-medium underline underline-offset-4"
//           >
//             Noman Dhoni
//           </Link>
//         </p>
//         <p className="text-right text-sm leading-loose md:text-right">

//           <Link
//             href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
//             target="_blank"
//             rel="noopener noreferrer"
//             aria-label="View Blink Eye on Product Hunt"
//             className="flex items-center space-x-2"
//           >
//             <ProductHuntWidget />
//             <span className="sr-only">View Blink Eye on Product Hunt</span>
//           </Link>
//         </p>
//       </div>
//     </footer>
//   );
// };
