"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ADCASH } from "@/lib/ads/adcash";
import {
  AD_SLOT,
  shouldShowAd,
  recordImpression,
} from "@/lib/ads/frequency";

/**
 * AdcashInterstitial — fires Adcash's interstitial format at most
 * once per session. Mounts inside a detail page (movie/TV) so the
 * user sees one full-screen interstitial between pages.
 *
 * NOT mounted on the home page (would punish the user's first visit)
 * and NOT mounted on the watch page (would clash with the pre-roll
 * + kill watch time).
 *
 * The Adcash `aclib.runInterstitial({ zoneId })` call returns a
 * promise that resolves when the user dismisses the interstitial.
 * We ignore the resolution — the cap is the contract.
 *
 * Hydration-safe: SSR returns null. Client checks the frequency cap
 * (1 per session, or hard-capped at 4 total) and only mounts the
 * script when allowed.
 */
export function AdcashInterstitial() {
  const [hydrated, setHydrated] = useState(false);
  const [mountScript, setMountScript] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const ok = shouldShowAd(AD_SLOT.interstitial);
    if (ok) {
      recordImpression(AD_SLOT.interstitial);
      setMountScript(true);
      // best-effort server log
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slot: AD_SLOT.interstitial }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  if (!hydrated || !mountScript) return null;

  return (
    <Script
      id={`adcash-interstitial-${ADCASH.interstitialZoneId}`}
      strategy="afterInteractive"
    >
      {`
        (function(){
          function run() {
            if (typeof window.aclib === 'undefined') return;
            try {
              window.aclib.runInterstitial({
                zoneId: '${ADCASH.interstitialZoneId}',
              });
            } catch (e) {
              console.warn('[adcash] runInterstitial failed', e);
            }
          }
          if (document.readyState === 'complete') run();
          else window.addEventListener('load', run);
        })();
      `}
    </Script>
  );
}
