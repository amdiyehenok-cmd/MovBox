/**
 * Adcash ad configuration.
 *
 * Adcash is the second ad network we use, primarily for
 * high-CPM video formats (pre-roll + video slider + auto-rotated
 * pop/in-page push). Adsterra still handles banners, social bar,
 * and in-feed.
 *
 * All scripts are loaded via the AdcashLoader component
 * (components/ads/AdcashLoader.tsx) which injects them client-side
 * after the page is interactive. We never block first paint.
 *
 * Zone IDs are hard-coded (not env vars) because Adcash dashboard
 * hands them out once and they don't rotate.
 */
export const ADCASH = {
  /** Library URL — required for runAutoTag, runInPagePush, runVideoSlider. */
  libraryUrl: "//acscdn.com/script/aclib.js",

  /**
   * Auto-Tag: rotates Pop, Interstitial, In-Page Push, and Video
   * Slider based on a UX/$ balance. This is the highest revenue
   * format because Adcash picks the best-paying format per user.
   * Loaded on every page via the layout.
   */
  autoTagZoneId: "1647124",

  /**
   * In-Stream Video pre-roll. VAST tag URL — we fetch the VAST XML
   * ourselves and play the first <MediaFile> as a pre-roll before
   * the actual video content starts. See PrerollAd.tsx.
   */
  inStreamZoneId: "12111358",
  inStreamVastUrl:
    "https://youradexchange.com/video/select.php?r=12111358",

  /**
   * Video Slider: floating video that appears in the corner.
   * Loaded on browse pages (not on the player, to avoid
   * overlapping with the in-stream pre-roll).
   */
  videoSliderZoneId: "12111390",
} as const;
