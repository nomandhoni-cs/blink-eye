import { routing } from "@/i18n/routing";
import type { MetadataRoute } from "next";
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
  const [releases, posts] = await Promise.all([getReleases(), getAllPosts()]);

  const localizedPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    localizedRoutes.map((route) => ({
      url: `${SEO.url}/${locale}${route}`,
    })),
  );

  const latestPostDate = posts.reduce<Date | undefined>((latest, post) => {
    const modified = new Date(post.dateModified || post.date);
    return !latest || modified > latest ? modified : latest;
  }, undefined);
  const latestReleaseDate = releases.reduce<Date | undefined>((latest, release) => {
    const published = new Date(release.published_at);
    return !latest || published > latest ? published : latest;
  }, undefined);

  const englishContentPages: MetadataRoute.Sitemap = [
    {
      url: `${SEO.url}/en/blogs`,
      ...(latestPostDate ? { lastModified: latestPostDate } : {}),
    },
    {
      url: `${SEO.url}/en/changelog`,
      ...(latestReleaseDate ? { lastModified: latestReleaseDate } : {}),
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SEO.url}/en/posts/${post.slug}`,
    lastModified: new Date(post.dateModified || post.date),
  }));

  const releaseRoutes: MetadataRoute.Sitemap = releases.map((release) => ({
    url: `${SEO.url}/en/changelog/release/${release.tag_name}`,
    lastModified: new Date(release.published_at),
  }));

  return [...localizedPages, ...englishContentPages, ...postRoutes, ...releaseRoutes];
}
