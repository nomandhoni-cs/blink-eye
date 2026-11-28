import { ArrowUpRight } from "lucide-react";

const chromeStoreUrl =
  "https://chromewebstore.google.com/detail/gajpnnmldjcfofkicdjpffdbcplpimck";

export function SidebarPromotion() {
  return (
    <aside className="relative mt-10 overflow-hidden rounded-2xl bg-[#28745b] p-5 text-white shadow-lg shadow-[#174d3d]/15">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <img
            src="https://perfect-prompt.app/perfect-prompt-logo.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className="h-8 w-8 brightness-0 invert"
          />
          <h2 className="text-lg font-bold tracking-tight">Perfect Prompt</h2>
        </div>

        <p className="mt-3 text-sm leading-5 text-white/90">
          Turn rough ideas into clear prompts, right inside your AI tools.
        </p>

        <a
          href={chromeStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#205d49] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#28745b]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-5 w-5 shrink-0"
          >
            <circle cx="24" cy="24" r="22" fill="#FBBC05" />
            <path
              fill="#EA4335"
              d="M24 24 4.95 13A22 22 0 0 1 43.05 13H24a11 11 0 0 0-9.53 5.5L24 24Z"
            />
            <path
              fill="#34A853"
              d="M24 24 13 43A22 22 0 0 1 4.95 13l9.52 16.5A11 11 0 0 0 24 35V24Z"
            />
            <circle cx="24" cy="24" r="11" fill="white" />
            <circle cx="24" cy="24" r="8.5" fill="#4285F4" />
          </svg>
          Add to Chrome <ArrowUpRight className="h-4 w-4" />
        </a>
        <p className="mt-2 text-center text-xs text-white/75">
          Free · 15 prompts a month
        </p>
      </div>
    </aside>
  );
}
