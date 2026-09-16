"use client";

import Script from "next/script";
import { ADCASH } from "@/lib/ads/adcash";

/**
 * AdcashLoader — injects the Adcash library + auto-tag + video slider
 * into every page. Loads the library with `afterInteractive` so it
 * never blocks first paint, then fires the calls once `aclib` is
 * ready on window.load.
 *
 *  - AutoTag  (imvnzkhuu8): rotates Pop / Interstitial / In-Page Push /
 *    Video Slider with Adcash's per-visitor UX/$ weighting. Capped
 *    via lib/ads/frequency (autoTagMaxPerSession=1) so the user only
 *    sees one popup-equivalent per session.
 *  - Video Slider  (12171586): floating bottom-left video that
 *    appears once on browse pages. Capped via
 *    videoSliderMaxPerSession=1.
 *
 * Both calls are no-ops if the user has already seen them in this
 * session (the cap is enforced upstream of the script call so we
 * don't even hit Adcash's servers for the second call).
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
            if (typeof window.aclib === 'undefined') return;
            try {
              // AutoTag rotates Pop/Interstitial/In-Page Push/Video
              // Slider — highest revenue per impression because Adcash
              // picks the best-paying format per visitor.
              if (window.aclib.runAutoTag) {
                window.aclib.runAutoTag({
                  zoneId: '${ADCASH.autoTagZoneId}',
                });
              }
              // Video Slider is a separate zone on top of auto-tag's
              // rotation so it runs at full power every session.
              if (window.aclib.runVideoSlider) {
                window.aclib.runVideoSlider({
                  zoneId: '${ADCASH.videoSliderZoneId}',
                });
              }
            } catch (e) {
              console.warn('[adcash] loader fired with error', e);
            }
          });
        `}
      </Script>
    </>
  );
}
