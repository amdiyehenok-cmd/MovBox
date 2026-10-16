/**
 * Adsterra ad configuration for movbox.xyz.
 *
 * DIFFERENT MODEL FROM EXOCLICK — read this before changing anything.
 *
 * ExoClick gives us <ins> zones that WE render and WE control (a VAST
 * pre-roll we parse ourselves, a slider we position, a banner we slot into
 * a component). Adsterra gives us two *direct-link script tags*: we hand
 * them a page, and their loader attaches its own listeners for the
 * monetised format (popunder / exit-intent / push-notification opt-in).
 * We never render anything for them and we never see a fill.
 *
 * Consequences of that, all deliberate:
 *   - There is no component to style and no zone class to place. The only
 *     integration surface is "is the script on the page or not".
 *   - Frequency capping is THEIR job, per zone, on their dashboard. Our
 *     /api/ads/impression counter (HARD_CAP 3 / 30 min) is a contract for
 *     units WE render — routing Adsterra through it would inflate that
 *     counter and suppress our own ExoClick units. So Adsterra is
 *     deliberately NOT wired into the impression endpoint.
 *   - Once the script is in the DOM it stays. Removing the <script> tag on
 *     a later route change does NOT detach listeners it already attached,
 *     so "load on browse, unload on /watch" is not something we can
 *     honestly promise. What we CAN control is the entry decision, made
 *     once per document load (see components/ads/AdsterraScripts.tsx).
 *
 * Placement policy
 * ----------------
 * Default is to NOT load when the session starts on /watch. Rationale is
 * the same one that already excludes the ExoClick video slider there: a
 * popunder fired during a full-bleed playback session is the most hostile
 * thing we could do to the one action that actually earns money (a
 * completed view), and aggressive formats on video content depress the
 * session metrics networks use to price our traffic.
 *
 * If you want max fill over max retention, set NEXT_PUBLIC_ADSTERRA_ON_WATCH=1
 * in the Vercel project env and redeploy. One line, no code change.
 */

/** Adsterra direct-link script tags, exactly as issued by the dashboard. */
export const ADSTERRA = {
  /**
   * The two monetised direct-link units issued to this publisher account.
   * Each is a standalone loader — there is no shared library to import and
   * no global API to call, so both are simply appended as <script async>.
   *
   * `id` exists purely for idempotence: the injector checks
   * document.getElementById(id) before appending, so a full page reload
   * can never double-load a unit and trigger a double impression.
   *
   * UNCONFIRMED: which dashboard zone each of these two scripts belongs to.
   * The dashboard lists three active zones (see `dashboardZones` below) but
   * the loader hostnames do not carry the zone ids, so we cannot derive the
   * mapping from the URLs. If impressions land in the wrong zone, swap the
   * `zone` labels here — the loader behaviour is identical either way.
   */
  scripts: [
    {
      id: "adsterra-pl-31180787",
      src: "https://pl31180787.profitableratecpmnetwork.com/4d/8e/8e/4d8e8e8c319c3cfa4ed4d9338662515f.js",
      zone: "pl31180787",
    },
    {
      id: "adsterra-pl-31180785",
      src: "https://pl31180785.profitableratecpmnetwork.com/c8/63/1f/c8631f19a926b1ce86bd661e287e1538.js",
      zone: "pl31180785",
    },
  ] as const,

  /**
   * Zones reported active in the publisher dashboard at integration time.
   *
   *  - Popunder_1   (31080286) — site-wide on-load popunder. SITE-WIDE OK.
   *  - SocialBar_1  (31080288) — bottom bar unit. SITE-WIDE OK, needs its own
   *    loader snippet from the dashboard before it can be added.
   *  - Smartlink_1  (31080287) — monetised link shortener. NOT a site format:
   *    it is for off-site traffic (social posts, Telegram, YouTube
   *    descriptions). Do NOT add a loader for it to this app — putting a
   *    smartlink tag on the website is not what it is for.
   *
   * Recorded here so the account state is documented next to the code that
   * depends on it, not so this file can drive the dashboard.
   */
  dashboardZones: {
    popunder: { name: "Popunder_1", id: "31080286", active: true },
    socialBar: { name: "SocialBar_1", id: "31080288", active: true },
    smartlink: { name: "Smartlink_1", id: "31080287", active: true },
  } as const,

  /**
   * Publisher dashboard. Kept here so the account behind these two zone ids
   * is documented next to the ids themselves — if we ever need to change
   * zones, this is the link to verify against.
   */
  managerUrl:
    "https://www.profitableratecpmnetwork.com/yze0wqd6?key=f4fe1371dae7e93cde4f80cf5953c03f",

  /**
   * Routes that must NOT boot the Adsterra loaders when they are the entry
   * point of a document load. See the placement policy above.
   */
  excludedPrefixes: ["/watch"] as const,

  /**
   * Kill switch. Set NEXT_PUBLIC_ADSTERRA_ENABLED=0 to remove the tags
   * entirely without a code change — useful if revenue drops far enough to
   * outweigh retention, or if Adsterra ever has a delivery problem.
   */
  enabledEnv: "NEXT_PUBLIC_ADSTERRA_ENABLED",

  /**
   * Set NEXT_PUBLIC_ADSTERRA_ON_WATCH=1 to load the tags even when the
   * session starts on /watch.
   */
  onWatchEnv: "NEXT_PUBLIC_ADSTERRA_ON_WATCH",
} as const;

/** True unless explicitly disabled with NEXT_PUBLIC_ADSTERRA_ENABLED=0. */
export function adsterraEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADSTERRA_ENABLED !== "0";
}

/** True only when NEXT_PUBLIC_ADSTERRA_ON_WATCH=1. Default is off. */
export function adsterraOnWatch(): boolean {
  return process.env.NEXT_PUBLIC_ADSTERRA_ON_WATCH === "1";
}

/**
 * Whether the loaders should run for a session that entered at `pathname`.
 * Pure so the policy is unit-testable and obvious at a glance.
 */
export function adsterraAllowedForPath(pathname: string | null): boolean {
  if (!adsterraEnabled()) return false;
  if (!pathname) return true; // unknown path -> don't silently suppress revenue
  if (adsterraOnWatch()) return true;
  return !ADSTERRA.excludedPrefixes.some((p) => pathname.startsWith(p));
}