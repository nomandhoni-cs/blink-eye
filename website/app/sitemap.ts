import { routing } from "@/i18n/routing";
import { MetadataRoute } from "next";
import { SEO } from "@/configs/seo";
import { getAllPosts } from "@/lib/api";

interface Release {
  tag_name: string;
}

// Fetch releases from GitHub API
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

// Predefined routes
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
  "/blogs",
];

// Sitemap generation function
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SEO.url;
  const releases = await fetchReleases();
  const posts = getAllPosts();
  const postRoutes = posts.flatMap((post) =>
    routing.locales.map((locale) => ({
      url: `${SEO.url}/${locale}/posts/${post.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  // Generate release-specific routes
  const releaseRoutes = releases.flatMap((release) =>
    routing.locales.map((locale) => ({
      url: `${SEO.url}/${locale}/changelog/release/${release.tag_name}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  // Generate routes for all locales
  const localeRoutes = routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.9,
    }))
  );

  return [
    ...localeRoutes, // Include all routes for all locales
    ...releaseRoutes,
    ...postRoutes,
  ];
}
