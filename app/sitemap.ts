import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getBoxmoviesHome, getBoxmoviesTrending } from "@/lib/data";

/**
 * Dynamic sitemap. In addition to the static pages, we fetch the home
 * themed sections + trending and emit one entry per title. This is
 * what gets Movbox into Google for every long-tail "watch {title}
 * online" query — each detail page is a unique ranking opportunity.
 *
 * Runs on the server at request time. Next.js caches the result for
 * the static-generation window so we don't hammer h5-api on every
 * rebuild.
 */
export const revalidate = 3600; // 1h
export const dynamic = "force-static"; // pre-render at build time
export const fetchCache = "force-cache"; // don't refetch per-request

interface SitemapItem {
  detailPath: string;
  type: "movie" | "tv";
}

async function collectTitles(): Promise<SitemapItem[]> {
  const out: SitemapItem[] = [];
  const seen = new Set<string>();
  const add = (detailPath: string | null | undefined, type: "movie" | "tv") => {
    if (!detailPath) return;
    if (seen.has(detailPath)) return;
    seen.add(detailPath);
    out.push({ detailPath, type });
  };
  try {
    const [home, trending] = await Promise.all([
      getBoxmoviesHome().catch(() => null),
      getBoxmoviesTrending(50).catch(() => null),
    ]);
    if (home) {
      for (const section of home.sections) {
        for (const item of section.items) add(item.detailPath, item.type);
      }
    }
    if (trending?.results) {
      for (const item of trending.results) add(item.detailPath, item.type);
    }
  } catch {
    /* h5-api may be slow / down — return whatever we have */
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const titles = await collectTitles();
  return [
    // Static pages
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/trending`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/animations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/movbox-app`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "never", priority: 0.5 },
    // Detail pages — every movie + TV show we know about
    ...titles.map((t) => ({
      url: `${SITE_URL}/${t.type === "tv" ? "tv" : "movie"}/${encodeURIComponent(t.detailPath)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
