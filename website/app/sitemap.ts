import { SEO } from "@/configs/seo";
import { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => {
  const routes = [
    "",
    "/goodbye",
    "/about",
    "/features",
    "/howtouse",
    "/contribute",
    "/privacy",
    "/pricing",
  ];

  const sitemapUrls: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SEO.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  }));

  return sitemapUrls;
};

export default sitemap;
