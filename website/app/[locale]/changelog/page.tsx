import { remark } from "remark";
import html from "remark-html";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import Link from "next/link";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Changelog of Version",
  };
}

// Create a DOMPurify instance for SSR
const createDOMPurify = () => {
  if (typeof window === "undefined") {
    const { window } = new JSDOM("");
    return DOMPurify(window as unknown as Window);
  }
  return DOMPurify;
};

// Define types for release data
interface Release {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
}

async function fetchReleases(): Promise<Release[]> {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
    {
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch releases");
  }

  const data = await res.json();
  return data;
}

// Function to process markdown with remark
async function processMarkdown(content: string): Promise<string> {
  const result = await remark().use(html).process(content);
  return result.toString();
}

const ReleasesPage = async () => {
  const locale = await getLocale();
  const data = await fetchReleases();
  const purify = createDOMPurify();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <div className="grid gap-10">
        {data.map(async (release) => {
          const processedBody = await processMarkdown(release.body || "");
          const sanitizedHtml = purify.sanitize(processedBody);

          return (
            <div key={release.id} className="p-4 shadow-md rounded-lg">
              <Link
                href={`/${locale}/changelog/release/${release.name}`}
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

              {/* Display the processed and sanitized release body as HTML */}
              <div
                className="mt-10 prose max-w-none space-y-8"
                dangerouslySetInnerHTML={{
                  __html: sanitizedHtml,
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
