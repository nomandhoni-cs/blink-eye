import { CONFIG } from "@/configs/site";
import { getCurrentYear } from "@/utils/year";
import Link from "next/link";
import ProductHuntWidget from "../ProductHunt";
import { useLocale } from "next-intl";

import { ArrowUpRight, Linkedin } from "lucide-react";
import GradientBackground from "../GradientBackground";

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
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Top gradient background */}
        <GradientBackground
          position="top"
          rotate={30}
          fromColor="#ff80b5"
          toColor="#FE4C55"
        />
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
                  <span className="sr-only">
                    View Blink Eye on Product Hunt
                  </span>
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
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-current"
                >
                  <title>GitHub</title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href={CONFIG.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-current"
                >
                  <title>X</title>
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href={CONFIG.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-current"
                >
                  <title>Discord</title>
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <span className="sr-only">Discord</span>
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
        <GradientBackground
          position="bottom"
          rotate={0}
          fromColor="#fe4c55"
          toColor="#9089fc"
        />
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
