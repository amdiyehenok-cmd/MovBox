import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Minimal sitemap. As the catalogue grows (popular movies, popular TV,
 * genres) we'll add dynamic entries by fetching the top N from TMDB.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/trending`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/genres`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/movbox-app`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "never", priority: 0.5 },
  ];
}
