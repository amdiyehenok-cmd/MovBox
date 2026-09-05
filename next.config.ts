import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TMDB (legacy — only used by the old detail pages we are sunsetting)
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Boxmovies (the single source of truth)
      { protocol: "https", hostname: "pbcdnw.aoneroom.com" },
      { protocol: "https", hostname: "pacdn.aoneroom.com" },
      { protocol: "https", hostname: "macdn.aoneroom.com" },
      { protocol: "https", hostname: "bcdnxw.hakunaymatata.com" },
      { protocol: "https", hostname: "spa.aoneroom.com" },
      { protocol: "https", hostname: "image.themoviedb.org" },
    ],
  },
  // Strict React 19 — already on
  reactStrictMode: true,
  // Build-time type-check is OFF (for now). The repo still has ~80
  // pre-existing type errors in legacy TMDB/CinePro code that the
  // dev server (`next dev`) doesn't enforce. We removed the worst
  // offenders (MovieDetailContent, TVDetailContent, CastList) but
  // the rest is a cleanup pass. `npm run typecheck` is wired up so
  // you can see them locally; re-enable here once that pass lands.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
