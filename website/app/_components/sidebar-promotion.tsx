import { ArrowUpRight, Sparkles } from "lucide-react";

const chromeStoreUrl =
  "https://chromewebstore.google.com/detail/gajpnnmldjcfofkicdjpffdbcplpimck";
const reviewsUrl = `${chromeStoreUrl}/reviews`;

export function SidebarPromotion() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#11101d] p-5 text-white shadow-xl shadow-violet-950/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-violet-500/25 blur-3xl"
      />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            <Sparkles className="h-3 w-3" /> Featured tool
          </span>
          <span className="text-[10px] text-white/50">Free Chrome extension</span>
        </div>

        <p className="text-xs font-semibold text-violet-300">
          For ChatGPT, Claude &amp; Gemini
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          <a
            href="https://perfect-prompt.app/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-violet-200"
          >
            Perfect Prompt <ArrowUpRight className="h-4 w-4" />
          </a>
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Turn any prompt into a perfect prompt. Add the role, goal, and context
          in one click, right inside your favorite AI tools.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Role", "Goal", "Context", "15+ AI tools"].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/75"
            >
              {feature}
            </span>
          ))}
        </div>

        <a
          href={chromeStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#171522] transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          Add to Chrome <ArrowUpRight className="h-4 w-4" />
        </a>

        <a
          href="https://perfect-prompt.app/en#demo"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs font-medium text-violet-200 transition hover:text-white"
        >
          Watch the demo <ArrowUpRight className="h-3 w-3" />
        </a>

        <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-white/55">
          <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            ★ 4.9 on Chrome Web Store · 7 ratings
          </a>
          <span className="shrink-0">15 prompts / month free</span>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/40">
          No card needed
        </p>
      </div>
    </section>
  );
}
