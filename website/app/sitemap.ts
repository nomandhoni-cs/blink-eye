import { SEO } from "@/configs/seo";
import { MetadataRoute } from "next";

// Define the Release type structure based on the GitHub API response
interface Release {
  tag_name: string;
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

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const routes = [
    "",
    "/goodbye",
    "/about",
    "/features",
    "/download",
    "/howtouse",
    "/contribute",
    "/privacy",
    "/pricing",
    "/changelog",
    "/howblinkeyehelps",
  ];

  // Fetch release data from GitHub API
  const releases = await fetchReleases();

  // Add the releases to the routes dynamically
  const releaseRoutes = releases.map((release) => ({
    url: `${SEO.url}/changelog/release/${release.tag_name}`,
    lastModified: new Date().toISOString(), // Ensure the lastModified is a string or Date
    changeFrequency: "weekly" as "weekly", // Explicitly set the allowed change frequency
    priority: 0.8,
  }));

  // Combine the static and dynamic routes
  const sitemapUrls: MetadataRoute.Sitemap = [
    ...routes.map((route) => ({
      url: `${SEO.url}${route}`,
      lastModified: new Date().toISOString(), // Ensure the lastModified is a string or Date
      changeFrequency: "weekly" as "weekly", // Explicitly set the allowed change frequency
      priority: 1,
    })),
    ...releaseRoutes, // Add the release routes dynamically
  ];

  return sitemapUrls;
};

export default sitemap;
