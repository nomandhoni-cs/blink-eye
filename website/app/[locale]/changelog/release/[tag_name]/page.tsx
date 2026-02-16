import React from "react";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

// Define types for release data
interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

interface ReleaseData {
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assets: ReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
}

// Fetch a single release by tag name
async function getData(tag_name: string): Promise<ReleaseData> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.BLINK_EYE_WEBSITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/tags/${tag_name}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch release data: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// Fetch all releases to generate static params for each tag
async function fetchAllReleases(): Promise<{ tag_name: string }[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.BLINK_EYE_WEBSITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`;
  }

  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
    {
      headers,
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    return [];
  }

  const releases: { tag_name: string }[] = await res.json();
  return releases;
}

// Generate static params for all locale + tag_name combinations (SSG)
export async function generateStaticParams() {
  const releases = await fetchAllReleases();

  const params: { locale: string; tag_name: string }[] = [];
  for (const locale of routing.locales) {
    for (const release of releases) {
      params.push({ locale, tag_name: release.tag_name });
    }
  }

  return params;
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag_name: string; locale: string }>;
}): Promise<Metadata> {
  const { tag_name, locale } = await params;
  setRequestLocale(locale);
  const releaseInfo = await getData(tag_name);
  const t = await getTranslations("ReleaseInfo");
  return {
    title: t("metaTitle", { tag: releaseInfo.tag_name }),
    description: releaseInfo.body?.slice(0, 160),
  };
}

// Convert markdown to HTML using marked (lightweight, no jsdom needed)
function renderMarkdown(markdownText: string): string {
  return marked.parse(markdownText, { async: false }) as string;
}

const ReleaseInfoPage = async ({
  params,
}: {
  params: Promise<{ tag_name: string; locale: string }>;
}) => {
  const { tag_name, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ReleaseInfo");
  const releaseData = await getData(tag_name);

  // Render the markdown-converted body
  const releaseBody = renderMarkdown(releaseData.body || "");

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        {t("title", { tag: tag_name })}
      </h1>
      <Button asChild variant="secondary">
        <Link
          href={`/${locale}/changelog`}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t("goBack")}</span>
        </Link>
      </Button>
      <div className="shadow-2xl rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold">{releaseData.name}</h2>
        <p className="text-sm">
          {t("tag")}: {releaseData.tag_name}
        </p>
        <p className="text-sm">
          {t("published")}:{" "}
          {new Date(releaseData.published_at).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="flex items-center space-x-4">
          <img
            src={releaseData.author.avatar_url}
            alt={releaseData.author.login}
            className="w-12 h-12 rounded-full"
          />
          <a
            href={releaseData.author.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {releaseData.author.login} ({t("author")})
          </a>
        </div>
        <div
          className="mt-4 space-y-4 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: releaseBody }}
        />
        {releaseData.assets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">{t("assets")}</h3>
            <ul className="list-disc pl-5 mt-2">
              {releaseData.assets.map((asset) => (
                <li key={asset.id}>
                  <a
                    href={asset.browser_download_url}
                    className="text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {asset.name} ({(asset.size / 1024).toFixed(2)} KB)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <a
            href={`https://github.com/nomandhoni-cs/blink-eye/compare/v1.6.0...${releaseData.tag_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {t("fullChangelog")}
          </a>
        </div>
        <div className="mt-4 space-y-2">
          <p className="font-medium">{t("downloadOptions")}:</p>
          <div className="space-x-4">
            <a
              href={releaseData.tarball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {t("downloadTarball")}
            </a>
            <a
              href={releaseData.zipball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {t("downloadZipball")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseInfoPage;
