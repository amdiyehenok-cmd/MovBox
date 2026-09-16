"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ADCASH } from "@/lib/ads/adcash";
import {
  AD_SLOT,
  shouldShowAd,
  recordImpression,
  dismissSlot,
  isDismissed,
} from "@/lib/ads/frequency";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AdcashBanner — renders Adcash's 468×60 Display zone.
 *
 * Adcash docs: "Display ads will be rendered inside the parent element
 * of the script that calls the runBanner function. We recommend you
 * enclose it in a <div> element."
 *
 * So we wrap the <script> in a <div>. Adcash injects the creative
 * into that div at runtime (replaces or appends to its children).
 *
 * Behavior:
 *  - Hydration-safe: SSR returns null, client checks the frequency
 *    cap before rendering.
 *  - Dismiss: tiny × in the corner. Sticky for the rest of the session.
 *  - Mobile: hidden below `sm`. Adcash mobile users get the auto-tag
 *    pop/in-page push rotation instead — better fit than a 468-px banner.
 *  - Position controlled via className (Tailwind). Callers wrap it in
 *    whatever container fits the page.
 */
interface AdcashBannerProps {
  className?: string;
  /** Optional label override for the dismiss × aria. */
  dismissLabel?: string;
}

export function AdcashBanner({ className, dismissLabel = "Dismiss ad" }: AdcashBannerProps) {
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const ok = shouldShowAd(AD_SLOT.display);
    setVisible(ok);
    setDismissed(isDismissed(AD_SLOT.display));
    if (ok) {
      recordImpression(AD_SLOT.display);
      // best-effort server log — same pattern as before; will fail-soft.
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slot: AD_SLOT.display }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  if (!hydrated || !visible || dismissed) return null;

  const w = ADCASH.displayWidth;
  const h = ADCASH.displayHeight;

  return (
    <div
      className={cn(
        "relative mx-auto w-fit max-w-full overflow-hidden rounded-md border border-border/40 bg-surface/40 backdrop-blur",
        "hidden sm:block", // mobile users see AutoTag rotation instead
        className,
      )}
      role="region"
      aria-label="Sponsored advertisement"
    >
      {/* Adcash renders into the parent of this script — i.e. this <div>.
          Width/height match the declared 468×60 zone so the layout is
          stable before the ad fills. */}
      <div
        id={`adcash-display-${ADCASH.displayZoneId}`}
        style={{ width: w, height: h, maxWidth: "100%" }}
        className="flex items-center justify-center"
      >
        <Script
          id={`adcash-display-banner-${ADCASH.displayZoneId}`}
          strategy="afterInteractive"
        >
          {`
            (function(){
              function run() {
                if (typeof window.aclib === 'undefined') return;
                try {
                  window.aclib.runBanner({
                    zoneId: '${ADCASH.displayZoneId}',
                  });
                } catch (e) {
                  console.warn('[adcash] runBanner failed', e);
                }
              }
              if (document.readyState === 'complete') run();
              else window.addEventListener('load', run);
            })();
          `}
        </Script>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          dismissSlot(AD_SLOT.display);
        }}
        aria-label={dismissLabel}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg-deepest/70 text-cream/70 backdrop-blur transition-colors hover:bg-bg-deepest hover:text-cream"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
