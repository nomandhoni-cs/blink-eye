import { routing } from "@/i18n/routing";
import { MetadataRoute } from "next";
import { SEO } from "@/configs/seo";
import { getAllPosts } from "@/lib/api";
import { getReleases } from "@/lib/releases";

export const dynamic = "force-static";

// Routes with locale-specific copy. Blog and release notes are intentionally
// excluded here because their source content is English-only.
const localizedRoutes = [
  "",
  "/goodbye",
  "/about",
  "/features",
  "/download",
  "/howtouse",
  "/contribute",
  "/privacy",
  "/pricing",
  "/howblinkeyehelps",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releases = await getReleases();
  const posts = getAllPosts();

  const localizedPages = routing.locales.flatMap((locale) =>
    localizedRoutes.map((route) => ({
      url: `${SEO.url}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.9,
    })),
  );

  const englishContentPages: MetadataRoute.Sitemap = [
    {
      url: `${SEO.url}/en/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SEO.url}/en/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SEO.url}/en/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const releaseRoutes: MetadataRoute.Sitemap = releases.map((release) => ({
    url: `${SEO.url}/en/changelog/release/${release.tag_name}`,
    lastModified: new Date(release.published_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...localizedPages, ...englishContentPages, ...postRoutes, ...releaseRoutes];
}
