"use client";

import Script from "next/script";
import { ADCASH } from "@/lib/ads/adcash";

/**
 * AdcashLoader — injects the Adcash library + auto-tag into every
 * page. Loads the library with `afterInteractive` so it never blocks
 * first paint, and fires the auto-tag once `aclib` is ready.
 *
 * The Adcash auto-tag rotates between Pop, Interstitial, In-Page
 * Push, and Video Slider based on a UX/$ balance configured in
 * the Adcash dashboard. We don't control which format shows —
 * Adcash picks the best one for each visitor.
 *
 * Reputation guard: we DO NOT load the popunder directly via
 * `aclib.runPop({ zoneId: ... })` — the auto-tag's pop rotation
 * already covers pop inventory. Keeping the same controls as our
 * Adsterra setup (one network for banners, one for video).
 */
export function AdcashLoader() {
  return (
    <>
      <Script
        id="aclib"
        src={ADCASH.libraryUrl}
        strategy="afterInteractive"
      />
      <Script id="adcash-autotag" strategy="afterInteractive">
        {`
          window.addEventListener('load', function() {
            if (typeof window.aclib !== 'undefined') {
              // Auto-tag rotates Pop / Interstitial / In-Page Push /
              // Video Slider with a balanced UX/$ weight.
              if (window.aclib.runAutoTag) {
                window.aclib.runAutoTag({
                  zoneId: '${ADCASH.autoTagZoneId}',
                });
              }
              // Video slider: floating video in the corner. Always on
              // top of the auto-tag rotation, so users see a video ad
              // even when Adcash picks a non-video format.
              if (window.aclib.runVideoSlider) {
                window.aclib.runVideoSlider({
                  zoneId: '${ADCASH.videoSliderZoneId}',
                });
              }
            }
          });
        `}
      </Script>
    </>
  );
}
