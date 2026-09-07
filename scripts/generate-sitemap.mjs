// Generate sitemap.xml at build time as a static file in public/.
// Runs via `prebuild` in package.json. The h5-api call has a 5s
// timeout and a try/catch so a slow/down upstream doesn't break
// the build — we'll just ship the static URLs only.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "sitemap.xml");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://movbox.xyz";
const H5_API_BASE =
  process.env.H5_API_BASE || "https://h5-api.aoneroom.com/wefeed-h5api-bff";

const STATIC_PAGES = [
  { url: "/", changeFrequency: "daily", priority: 1.0 },
  { url: "/movies", changeFrequency: "daily", priority: 0.9 },
  { url: "/tv", changeFrequency: "daily", priority: 0.9 },
  { url: "/trending", changeFrequency: "hourly", priority: 0.8 },
  { url: "/animations", changeFrequency: "weekly", priority: 0.7 },
  { url: "/most-watched", changeFrequency: "daily", priority: 0.7 },
  { url: "/genres", changeFrequency: "weekly", priority: 0.6 },
  { url: "/movbox-app", changeFrequency: "daily", priority: 0.7 },
  { url: "/search", changeFrequency: "never", priority: 0.5 },
];

async function fetchWithTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

async function collectTitles() {
  const seen = new Set();
  const out = [];
  const add = (detailPath, type) => {
    if (!detailPath) return;
    if (seen.has(detailPath)) return;
    seen.add(detailPath);
    out.push({ detailPath, type });
  };
  try {
    // The h5-api requires a Bearer token minted from boxmovies.org
    // (see lib/data.ts → h5Fetch). For a build-time script we skip
    // that auth dance and just ship the static URLs — Google will
    // discover detail pages via internal links from the home page.
    // If we ever need to enumerate detail pages here, we'd need to
    // import the h5Fetch helper or duplicate its token-mint logic.
    //
    // Leaving the fetch hooks in place (commented) so future me knows
    // what to wire up.
    //
    // const [home, trending] = await Promise.all([
    //   fetchWithTimeout(`${H5_API_BASE}/home?host=boxmovies.org`).catch(() => null),
    //   fetchWithTimeout(`${H5_API_BASE}/subject/trending?tabId=TRENDING_MOVIES`).catch(() => null),
    // ]);
    // if (home?.data?.operatingList) {
    //   for (const o of home.data.operatingList) {
    //     for (const i of o.subjects || []) {
    //       add(i.detailPath, i.type);
    //     }
    //   }
    // }
    // if (trending?.data?.results) {
    //   for (const i of trending.data.results) add(i.detailPath, i.type);
    // }
  } catch (e) {
    console.warn("[sitemap] upstream fetch failed:", e.message);
  }
  return out;
}

function xmlEscape(s) {
  return s.replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[c]);
}

function urlEntry(path, lastmod, changeFrequency, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(SITE_URL + path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

async function main() {
  const now = new Date().toISOString();
  const titles = await collectTitles();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PAGES.map((p) => urlEntry(p.url, now, p.changeFrequency, p.priority)),
    ...titles.map((t) =>
      urlEntry(
        `/${t.type === "tv" ? "tv" : "movie"}/${encodeURIComponent(t.detailPath)}`,
        now,
        "weekly",
        0.7,
      ),
    ),
    "</urlset>",
    "",
  ];
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, lines.join("\n"), "utf8");
  const staticCount = STATIC_PAGES.length;
  const dynamicCount = titles.length;
  console.log(`[sitemap] wrote ${OUT} (${staticCount} static + ${dynamicCount} detail = ${staticCount + dynamicCount} urls)`);
}

main().catch((e) => {
  console.error("[sitemap] failed:", e);
  process.exit(1);
});
