import { MetadataRoute } from "next";
import { locales } from "@/configs/site";

// Add all your routes here
const routes = ["", "/features", "/about", "/pricing", "/release"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yourdomain.com";

  return [
    // Generate entries for all routes in all languages
    ...locales.flatMap((locale) =>
      routes.map((route) => ({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
      }))
    ),
  ];
}
