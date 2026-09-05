/**
 * Adsterra configuration.
 *
 * Ad unit IDs are hard-coded (not env vars) because the Adsterra
 * dashboard hands them out once and they don't rotate. If you ever
 * rotate the unit IDs, edit this file and redeploy — no other place
 * in the app needs to change.
 *
 * Slot plan (see components/ads/AdSlot.tsx):
 *   1. "feed-card"   — in-feed sponsored card every 9th item.
 *                       Adsterra format: Smartlink (direct URL).
 *   2. "social-bar"  — bottom-sticky push-notification bar.
 *                       Adsterra format: Social Bar.
 *   3. "install"     — "Download the app to remove ads" CTA on /movbox-app.
 *                       No ad unit — pure UI.
 *
 * Slots deliberately NOT implemented (reputation safety):
 *   - Popunder. Even though we have a popunder unit configured in
 *     Adsterra, we never load its script. Popunders hurt SEO,
 *     retention, and brand. We can add an env flag later if a
 *     desperate revenue month requires it.
 *   - Pre-watch interstitial. Need an Adsterra "Interstitial" zone.
 *   - Sidebar 300×250. Need an Adsterra "Native Banner" zone.
 *
 * Frequency cap is enforced both client-side (fast, prevents
 * unnecessary network) and server-side (via Supabase `ad_impressions`,
 * for signed-in users across devices). See lib/ads/frequency.ts.
 */

export const ADSTERRA = {
  siteId: "6028680",
  smartlinkUrl:
    "https://www.profitableratecpmnetwork.com/yze0wqd6?key=f4fe1371dae7e93cde4f80cf5953c03f",
  smartlinkZone: "31080287",
  socialBarZone: "31080288",
  // The full <script src> URLs Adsterra gave us. Pre-bundled here so
  // the AdSlot component just <Script src=...> without re-typing.
  socialBarScript:
    "https://pl31180787.profitableratecpmnetwork.com/4d/8e/8e/4d8e8e8c319c3fa4ed4d9338662515f.js",
  // Popunder script — loaded nowhere by default. The /api/ads/popunder
  // route only injects it if the env flag MOVBOX_ENABLE_POPUNDER=1.
  popunderScript:
    "https://pl31180785.profitableratecpmnetwork.com/c8/63/1f/c8631f19a926b1ce86bd661e287e1538.js",
  popunderZone: "31080286",
} as const;

/**
 * How often each slot shows up. Tuned for the 3-ads-per-session
 * soft cap combined with the rest of the page.
 */
export const AD_FREQUENCY = {
  // In-feed card: every 5 cards on browse / search / home rows.
  // Lowered from 9 -> 5 so users actually see sponsored cards.
  feedCardEvery: 5,
  // Static HTML banner: appears once per session (above the cap
  // window so the banner is shown even if the user has hit the
  // hard cap on the other slots).
  bannerMaxPerSession: 1,
  // Social bar: once per session, dismissible for the rest of the
  // session.
  socialBarMaxPerSession: 1,
  // Hard cap (any combination of slots): 5 impressions per session
  // before going silent. After this we keep the slot for the user's
  // eyes but never fill it again.
  hardCapPerSession: 5,
} as const;

export const AD_SLOT = {
  feedCard: "feed-card",
  socialBar: "social-bar",
  banner: "banner",
} as const;
export type AdSlotName = (typeof AD_SLOT)[keyof typeof AD_SLOT];
