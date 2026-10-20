import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext (Cloudflare) configuration.
 *
 * We are NOT on Vercel any more. The site runs on Cloudflare Workers via
 * OpenNext, which compiles the Next.js App Router into a Worker + static
 * assets. That removes the Vercel egress ceiling entirely.
 *
 * ── WHY THE INCREMENTAL CACHE MATTERS ────────────────────────────────────
 * `cache.incremental.r2` turns on ISR backed by the R2 bucket bound as
 * NEXT_INC_CACHE_R2_BUCKET. Without it OpenNext uses a "dummy" cache
 * handler and every page re-renders on every request — which is exactly
 * the behaviour that burned 21.58 GB of Vercel Compute egress.
 *
 * With it, a page with `export const revalidate = 1800` is rendered once,
 * stored in R2, and served from the Cloudflare edge for 30 minutes. The
 * upstream h5-api calls are additionally cached by Next's Data Cache
 * (see lib/data.ts), so a revalidation is a cheap upstream read, not a
 * full refetch.
 *
 * ── THE QUEUE IS DELIBERATELY ABSENT ─────────────────────────────────────
 * OpenNext can use a Cloudflare Queue to revalidate stale pages in the
 * background instead of on the next request. We do not configure one
 * because the queue has to exist in the account first, and a missing
 * queue fails the whole deploy. Stale-while-revalidate on request is a
 * perfectly good fallback; the queue can be added later without any
 * code change.
 */
export default defineCloudflareConfig({
  cache: {
    incremental: {
      r2: {
        binding: "NEXT_INC_CACHE_R2_BUCKET",
      },
    },
  },
});
