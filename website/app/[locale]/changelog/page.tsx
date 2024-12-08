import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import Link from "next/link";
import { Metadata } from "next";
import { useLocale } from "next-intl";

// Metadata for the page
export const metadata: Metadata = {
  title: "Changelog of Versions",
};

// Create a DOMPurify instance for SSR
const createDOMPurify = () => {
  if (typeof window === "undefined") {
    const { window } = new JSDOM("");
    return DOMPurify(window as unknown as Window); // Cast as Window for DOMPurify
  }
  return DOMPurify; // Use client-side DOMPurify
};

// Define types for release data
interface Release {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
}

// Function to fetch releases
async function fetchReleases(): Promise<Release[]> {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch releases");
  }

  const data = await res.json();
  return data;
}

// Functional component for displaying the releases
const ReleasesPage = async ({ params }: { params: { locale: string } }) => {
  // Destructure locale directly from params (as it's already resolved)
  const { locale } = params;

  // Fetch releases data asynchronously
  const releases = await fetchReleases();
  const purify = createDOMPurify();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blink Eye Releases</h1>
      <div className="grid gap-10">
        {releases.map((release) => (
          <div key={release.id} className="p-4 shadow-md rounded-lg">
            <Link
              href={`/${locale}/changelog/release/${release.name}`}
              className="text-3xl font-semibold"
            >
              {release.name}
            </Link>
            <p>Tag: {release.tag_name}</p>
            <p>
              Published: {new Date(release.published_at).toLocaleDateString()}
            </p>

            {/* Format and display the release body as HTML */}
            <div
              className="mt-10 prose max-w-none space-y-8"
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(marked(release.body || "")),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleasesPage;
