import { SEO } from "@/configs/seo";
import { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    {
      url: SEO.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: SEO.url + "/goodbye",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: SEO.url + "/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: SEO.url + "/features",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: SEO.url + "/howtouse",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: SEO.url + "/contribute",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
};

export default sitemap;
