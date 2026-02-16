import { marked } from "marked";
import Link from "next/link";
import { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Changelog of Version",
  };
}

// Generate static params for all locales (SSG)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

// Define types for release data
interface Release {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
}

async function fetchReleases(): Promise<Release[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  // Use GitHub token if available (avoids rate limits)
  if (process.env.BLINK_EYE_WEBSITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`;
  }

  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
    {
      headers,
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch releases: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Convert markdown to HTML using marked (lightweight, no jsdom needed)
function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

const ReleasesPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await fetchReleases();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <div className="grid gap-10">
        {data.map((release) => {
          const processedBody = renderMarkdown(release.body || "");

          return (
            <div key={release.id} className="p-4 shadow-md rounded-lg">
              <Link
                href={`/${locale}/changelog/release/${release.tag_name}`}
                className="text-3xl font-semibold "
              >
                {release.name}
              </Link>
              <p className="">Tag: {release.tag_name}</p>
              <p className="">
                Published {": "}
                {new Date(release.published_at).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {/* Display the processed release body as HTML */}
              <div
                className="mt-10 prose max-w-none space-y-8"
                dangerouslySetInnerHTML={{
                  __html: processedBody,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReleasesPage;
