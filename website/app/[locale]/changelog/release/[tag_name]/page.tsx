import { marked } from "marked";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Download,
  ExternalLink,
  FileArchive,
  GitBranch,
  PackageOpen,
  Tag,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRelease, getReleases } from "@/lib/releases";
import { SEO } from "@/configs/seo";

// Release notes are English-only; generate one static page per release.
export async function generateStaticParams() {
  const releases = await getReleases();
  return releases.map((release) => ({ locale: "en", tag_name: release.tag_name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag_name: string; locale: string }>;
}): Promise<Metadata> {
  const { tag_name } = await params;
  setRequestLocale("en");
  const release = await getRelease(tag_name);
  const t = await getTranslations({ locale: "en", namespace: "ReleaseInfo" });
  const canonicalUrl = `${SEO.url}/en/changelog/release/${release.tag_name}`;
  const title = t("metaTitle", { tag: release.tag_name });
  const description = release.body?.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
    },
  };
}

function renderMarkdown(markdown: string) {
  return marked.parse(markdown, { async: false }) as string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ReleaseInfoPage({
  params,
}: {
  params: Promise<{ tag_name: string; locale: string }>;
}) {
  const { tag_name } = await params;
  setRequestLocale("en");

  const t = await getTranslations("ReleaseInfo");
  const release = await getRelease(tag_name);
  const releaseBody = renderMarkdown(release.body || "");

  return (
    <main className="min-h-screen pb-24">
      <section className="relative isolate overflow-hidden border-b border-border bg-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(254,76,85,0.14),transparent_48%),radial-gradient(ellipse_at_bottom_right,rgba(144,137,252,0.16),transparent_42%)]"
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/en/changelog"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-[#FE4C55]/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("goBack")}
          </Link>

          <div className="mt-9 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FE4C55]/20 bg-[#FE4C55]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FE4C55]">
              <PackageOpen className="h-3.5 w-3.5" /> Release notes
            </span>
            <h1 className="mt-5 text-4xl font-heading font-bold tracking-tight sm:text-6xl">
              {release.name || t("title", { tag: release.tag_name })}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{release.tag_name}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-[#FE4C55]" />
                {formatDate(release.published_at)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-[#9089fc]" /> {release.tag_name}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-14">
        <article className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:text-[#FE4C55] prose-a:decoration-[#FE4C55]/40 prose-a:underline-offset-4 hover:prose-a:decoration-[#FE4C55] prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-img:rounded-2xl prose-table:text-sm"
            dangerouslySetInnerHTML={{ __html: releaseBody }}
          />
          {!releaseBody.trim() && (
            <p className="text-muted-foreground">No release notes were provided for this version.</p>
          )}
        </article>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("author")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <img
                src={release.author.avatar_url}
                alt={release.author.login}
                className="h-12 w-12 rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <a
                  href={release.author.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold transition hover:text-[#FE4C55]"
                >
                  {release.author.login} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <p className="text-xs text-muted-foreground">Blink Eye on GitHub</p>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Download className="h-4 w-4 text-[#FE4C55]" /> {t("assets")}
              </h2>
              {release.assets.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {release.assets.map((asset) => (
                    <li key={asset.id}>
                      <a
                        href={asset.browser_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-[#FE4C55]/35 hover:bg-[#FE4C55]/5"
                      >
                        <FileArchive className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#FE4C55]" />
                        <span className="min-w-0">
                          <span className="block break-all text-xs font-medium leading-5">{asset.name}</span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {(asset.size / 1024).toFixed(0)} KB
                          </span>
                        </span>
                        <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No attached downloads for this release.</p>
              )}
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-5">
              <a
                href={`https://github.com/nomandhoni-cs/blink-eye/compare/v1.6.0...${release.tag_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:bg-[#FE4C55] hover:text-white"
              >
                <GitBranch className="h-4 w-4" /> {t("fullChangelog")}
              </a>
              <a
                href={release.tarball_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-[#FE4C55]/40 hover:text-foreground"
              >
                {t("downloadTarball")} <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href={release.zipball_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-[#FE4C55]/40 hover:text-foreground"
              >
                {t("downloadZipball")} <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
