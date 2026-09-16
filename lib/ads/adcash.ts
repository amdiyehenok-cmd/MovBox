/**
 * Adcash ad configuration — fresh build (2026-09-16).
 *
 * All five formats Adcash approved for movbox.xyz:
 *   1. In-stream Video      (VAST pre-roll on watch page)
 *   2. Video Slider         (floating bottom-left video)
 *   3. Interstitial         (full-screen between page loads)
 *   4. Display 468×60       (static banner, our preferred top-of-page slot)
 *   5. AutoTag              (rotates Pop / In-page Push / Slider — fill the
 *                            rest of the revenue at Adcash's UX/$ weighting)
 *
 * Zone IDs are hard-coded (not env vars) because Adcash dashboard hands
 * them out once and they don't rotate. If you ever rotate, edit this file
 * and redeploy — no other place in the app needs to change.
 *
 * All scripts are loaded via the AdcashLoader component
 * (components/ads/AdcashLoader.tsx) which injects them client-side after
 * the page is interactive. We never block first paint.
 *
 * Reputation guard: we DO NOT call `aclib.runPop()` directly. The
 * AutoTag's pop rotation already covers pop inventory; calling it again
 * would be a duplicate pop for the same user. Same goes for In-page
 * Push — let AutoTag decide what's best per user.
 */
export const ADCASH = {
  /** Library URL — required for all run*() calls. */
  libraryUrl: "//acscdn.com/script/aclib.js",

  /**
   * Auto-Tag: rotates Pop, Interstitial, In-Page Push, and Video
   * Slider based on Adcash's per-visitor UX/$ weighting. This is the
   * highest revenue format because Adcash picks the best-paying
   * format per user. Loaded on every page via the layout.
   */
  autoTagZoneId: "imvnzkhuu8",

  /**
   * In-Stream Video pre-roll. VAST tag URL — we fetch the VAST XML
   * ourselves and play the first <MediaFile> as a pre-roll before
   * the actual video content starts. See PrerollAd.tsx.
   */
  inStreamZoneId: "12171582",
  inStreamVastUrl:
    "https://youradexchange.com/video/select.php?r=12171582",

  /**
   * Video Slider: floating video that appears in the corner.
   * Loaded on browse pages (not on the watch page, to avoid
   * overlapping with the in-stream pre-roll).
   */
  videoSliderZoneId: "12171586",

  /**
   * Interstitial: full-screen between page transitions. Capped at
   * 1 per session via frequency.ts. Fires on detail page enter, not
   * on home (so the user's first visit doesn't feel like a pop).
   */
  interstitialZoneId: "12171590",

  /**
   * Display 468×60 banner. Standard IAB "Full Banner" size — works
   * on desktop, gracefully hidden on mobile (the AutoTag's mobile
   * pop/in-page push rotation handles the mobile experience).
   * Capped at 1 per session via frequency.ts.
   */
  displayZoneId: "12171626",
  displayWidth: 468,
  displayHeight: 60,
} as const;

/**
 * Per-slot and per-session caps. Tuned for "good revenue without
 * frustrating users":
 *   - One banner OR one AutoTag pop per session (never both).
 *   - One interstitial on detail-page-enter per session.
 *   - One pre-roll per 30-min window (already enforced in PrerollAd).
 *   - Hard cap of 4 total paid impressions per session before we go
 *     silent — protects user trust.
 *
 * Slots deliberately NOT implemented (reputation safety):
 *   - Direct popunder call. AutoTag handles pop rotation already.
 *   - Pre-watch interstitial. We have one on detail-page-enter, but
 *     not blocking the watch page itself.
 */
export const AD_FREQUENCY = {
  /** Display banner: 1 per session. */
  displayMaxPerSession: 1,
  /** Interstitial: 1 per session, fires on detail-page enter. */
  interstitialMaxPerSession: 1,
  /** Video slider: 1 per session. */
  videoSliderMaxPerSession: 1,
  /** Auto-tag (pops/in-page pushes): 1 pop-equivalent per session.
   *  Adcash's auto-tag rotates internally, we only cap the visible
   *  popups to avoid stacking. */
  autoTagMaxPerSession: 1,
  /** Hard cap across all slots: 4 paid impressions per session, then
   *  silent — protects UX without killing revenue. */
  hardCapPerSession: 4,
} as const;

export const AD_SLOT = {
  display: "display",
  interstitial: "interstitial",
  videoSlider: "videoSlider",
  autoTag: "autoTag",
} as const;

export type AdSlotName = (typeof AD_SLOT)[keyof typeof AD_SLOT];
