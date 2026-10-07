/**
 * ExoClick ad configuration for movbox.xyz.
 *
 * ExoClick is a VAST-first network. Unlike the previous provider we do
 * NOT load a JavaScript tag library and call `run*()` helpers — we fetch
 * the VAST XML ourselves and drive the ad from our own player component.
 * That means:
 *   - No third-party <script> on every page (nothing to block first paint).
 *   - No global `window.*` shim to declare or clean up.
 *   - Full control over when the ad plays and how it is skipped.
 *
 * Two formats are wired up:
 *   - In-stream pre-roll (VAST) — parsed and played by our own player
 *     component. No third-party script involved at all.
 *   - Display banner — uses ExoClick's generic ad-provider loader,
 *     mounted once per document via components/ads/ExoclickBanner.tsx.
 *
 * If a push/popunder zone is ever approved, add it here — but do NOT
 * reintroduce a site-wide auto-tag loader. One banner plus one pre-roll
 * is the whole ad load, and that is deliberate: it keeps the watch page
 * free of anything that could interfere with the video element.
 */

/** Zone identifiers handed out by the ExoClick dashboard. */
export const EXOCLICK = {
  /**
   * In-stream video pre-roll zone. We fetch the VAST tag below, parse
   * the <MediaFile> we can play, run it full-bleed over the player, then
   * hand control back. See components/ads/PrerollAd.tsx.
   */
  inStreamZoneId: "6049850",

  /**
   * VAST tag endpoint. Returns VAST 3.0 <InLine> (no wrapper redirect),
   * a single progressive MP4, ~12s duration with a 5s skip offset.
   *
   * The response is *dynamic* — every fetch returns fresh tracker URLs
   * and a fresh creative. Do not cache it.
   */
  inStreamVastUrl: "https://s.magsrv.com/v1/vast.php?idz=6049850",

  /**
   * Display (banner) zone, rendered via the generic ad-provider loader
   * rather than VAST. ExoClick's loader scans the DOM for
   * `<ins class={displayZoneClass} data-zoneid={displayZoneId}>` and
   * fills the first one it finds.
   */
  displayZoneId: "6049852",
  displayZoneClass: "eas6a97888e31",

  /** Generic loader used by the display zone. Async, never blocks paint. */
  adProviderScriptUrl: "https://a.magsrv.com/ad-provider.js",

  /** localStorage key holding the timestamp of the banner we last showed. */
  displayShownKey: "movbox:ad:display:done",

  /**
   * Domain-verification token. Served as a bare file from
   * public/031ad9ce8395a62fcb614b9fd7410dcd.html so the ExoClick
   * dashboard can fetch it from the site root and confirm ownership.
   */
  verificationToken: "031ad9ce8395a62fcb614b9fd7410dcd",
} as const;

/**
 * Fire a VAST tracker URL.
 *
 * Trackers are cross-origin pixel/beacon URLs and return nothing useful,
 * so we never care about the result. `sendBeacon` is preferred because
 * it survives the page going away mid-request (common on a pre-roll when
 * the user skips); we fall back to a keepalive fetch and finally to a
 * plain pixel so the beacon is never silently dropped.
 */
export function track(url: string): void {
  if (typeof window === "undefined" || !url) return;

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      // The empty Blob gives the request a body without setting a
      // content-type, so this stays a simple CORS request instead of
      // triggering a preflight we don't need to answer.
      if (navigator.sendBeacon(url, new Blob([]))) return;
    } catch {
      /* fall through to fetch */
    }
  }

  try {
    void fetch(url, { credentials: "omit", keepalive: true, mode: "no-cors" }).catch(
      () => {},
    );
    return;
  } catch {
    /* fall through to pixel */
  }

  // Last resort. Intentionally swallowing the failure — this must never
  // interrupt playback.
  const img = new Image(1);
  img.src = url;
}