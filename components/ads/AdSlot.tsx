"use client";

import { useEffect, useState } from "react";
import { ADSTERRA } from "@/lib/ads/adsterra";
import {
  shouldShowAd,
  recordImpression,
  dismissSlot,
  isDismissed,
} from "@/lib/ads/frequency";
import { InFeedAd } from "./InFeedAd";
import { SocialBar } from "./SocialBar";

type AdSlotName = "feed-card" | "social-bar";

interface AdSlotProps {
  /** Which slot. */
  name: AdSlotName;
  /** Extra className (e.g. for sizing/positioning). */
  className?: string;
}

/**
 * AdSlot is the only thing in the app that talks to Adsterra. Pages
 * embed one of these per slot. Internally it:
 *   1. Checks the client-side frequency cap (shouldShowAd).
 *   2. Renders nothing if capped/dismissed.
 *   3. Renders the slot's ad (or the in-feed sponsored card / social bar).
 *   4. Records the impression so subsequent slots see the cap.
 *
 * If a slot is dismissed, it's remembered for the rest of the session
 * (30 min inactivity). Server-side mirroring (Supabase ad_impressions)
 * for signed-in users is best-effort and lives in /api/ads/impression.
 */
export function AdSlot({ name, className }: AdSlotProps) {
  // Hydration-safe gate. The first render returns nothing on the
  // server; on the client we read localStorage and decide. This avoids
  // SSR/CSR mismatches that flicker the slot.
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setVisible(shouldShowAd(name));
    if (shouldShowAd(name)) {
      recordImpression(name);
      // best-effort server log
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slot: name }),
        keepalive: true,
      }).catch(() => {});
    }
  }, [name]);

  if (!hydrated || !visible || isDismissed(name)) return null;

  if (name === "feed-card") {
    return <InFeedAd smartlinkUrl={ADSTERRA.smartlinkUrl} className={className} />;
  }
  if (name === "social-bar") {
    return (
      <SocialBar
        zone={ADSTERRA.socialBarZone}
        siteId={ADSTERRA.siteId}
        scriptSrc={ADSTERRA.socialBarScript}
        onDismiss={() => dismissSlot("social-bar")}
        className={className}
      />
    );
  }
  return null;
}
