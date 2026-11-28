import { ArrowRight, CalendarDays, History, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getReleases } from "@/lib/releases";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Metadata" });
  return { title: `Changelog - ${t("appName")}` };
}

// Release notes are published in English; generate only the canonical English route.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const dynamic = "force-static";
export const dynamicParams = false;

function getSummary(markdown: string) {
  const plainText = markdown
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/[>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= 220) return plainText;
  return `${plainText.slice(0, 217).trimEnd()}…`;
}

export default async function ReleasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  setRequestLocale("en");
  const releases = await getReleases();

  return (
    <main className="min-h-screen pb-24">
      <section className="relative isolate overflow-hidden border-b border-border bg-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(254,76,85,0.13),transparent_48%),radial-gradient(ellipse_at_bottom_right,rgba(144,137,252,0.14),transparent_42%)]"
        />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#FE4C55]" /> Product updates
            </span>
            <h1 className="mt-5 text-4xl font-heading font-bold tracking-tight sm:text-6xl">
              Changelog
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              New features, improvements, and fixes—release by release. Browse
              the full history of Blink Eye updates below.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border bg-background/75 px-4 py-2.5 text-sm text-muted-foreground shadow-sm">
              <History className="h-4 w-4 text-[#FE4C55]" />
              <span>
                <strong className="font-semibold text-foreground">{releases.length}</strong>{" "}
                releases
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Release archive
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight">{releases.length}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              versions of Blink Eye, with notes and downloads for each release.
            </p>
            {releases[0] && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Latest version</p>
                <p className="mt-1 font-semibold">{releases[0].tag_name}</p>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {releases.map((release, index) => (
            <article
              key={release.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#FE4C55]/35 hover:shadow-lg sm:p-7"
            >
              {index === 0 && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FE4C55] via-[#ff9b83] to-[#9089fc]" />
              )}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {index === 0 && (
                      <span className="rounded-full bg-[#FE4C55]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FE4C55]">
                        Latest release
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9089fc]" />
                      {release.tag_name}
                    </span>
                  </div>
                  <h2 className="text-2xl font-heading font-bold tracking-tight sm:text-3xl">
                    <Link
                      href={`/en/changelog/release/${release.tag_name}`}
                      className="outline-none transition-colors group-hover:text-[#FE4C55] focus-visible:text-[#FE4C55]"
                    >
                      {release.name || release.tag_name}
                    </Link>
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <time dateTime={release.published_at}>
                      {new Date(release.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {getSummary(release.body || "") || "Explore what changed in this release."}
                  </p>
                </div>
                <Link
                  href={`/en/changelog/release/${release.tag_name}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-[#FE4C55]/40 hover:bg-[#FE4C55]/5 hover:text-[#FE4C55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE4C55]"
                >
                  Release details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
