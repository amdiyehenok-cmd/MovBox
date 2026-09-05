/**
 * Adcash global type. The aclib library injects `window.aclib` with
 * a few `run*` methods. We only use runAutoTag from the app code, but
 * declaring the whole surface keeps TS happy when we add more
 * integrations later.
 */
export {};

declare global {
  interface Window {
    aclib?: {
      runAutoTag?: (opts: { zoneId: string }) => void;
      runPop?: (opts: { zoneId: string }) => void;
      runInPagePush?: (opts: { zoneId: string }) => void;
      runInterstitial?: (opts: { zoneId: string }) => void;
      runVideoSlider?: (opts: { zoneId: string }) => void;
      runBanner?: (opts: { zoneId: string }) => void;
      runStickyBanner?: (opts: { zoneId: string }) => void;
      runVideo?: (opts: { zoneId: string }) => void;
      destroyAll?: () => void;
      destroyBanner?: (zoneId: string) => void;
    };
  }
}
