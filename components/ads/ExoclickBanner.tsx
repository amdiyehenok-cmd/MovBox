"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EXOCLICK } from "@/lib/ads/exoclick";
import { cn } from "@/lib/utils";

/**
 * ExoclickBanner — renders ExoClick's display zone via the generic
 * ad-provider loader.
 *
 * Unlike the in-stream pre-roll (which we parse ourselves from VAST),
 * the display format has no XML to read: we drop the official snippet
 * into the DOM and ExoClick's loader finds our `<ins>` and fills it.
 *
 * Placement rules kept from the previous provider:
 *  - One banner per session. Extra `<ExoclickBanner />` mounts on the
 *    same page are no-ops, so the home page can safely render it at
 *    several scroll depths.
 *  - Dismissable. Sticky for the rest of the session.
 *  - Hidden below `sm` — a banner that doesn't fit the viewport is
 *    worse than no banner on mobile.
 *
 * Hydration-safe: SSR renders null, the session cap is checked after
 * mount.
 */

const SESSION_TTL_MS = 30 * 60 * 1000;

function wasShownRecently(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(EXOCLICK.displayShownKey);
    if (!raw) return false;
    const t = Number(raw);
    return Number.isFinite(t) && Date.now() - t < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

function markShown(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXOCLICK.displayShownKey, String(Date.now()));
  } catch {
    /* noop */
  }
}

interface ExoclickBannerProps {
  className?: string;
  /** Optional label override for the dismiss × aria. */
  dismissLabel?: string;
}

export function ExoclickBanner({
  className,
  dismissLabel = "Dismiss ad",
}: ExoclickBannerProps) {
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const ok = !wasShownRecently();
    setVisible(ok);
    setDismissed(!ok);
    if (!ok) return;

    markShown();
    // Best-effort server-side log; the route no-ops when Supabase is
    // not configured. Never allowed to affect rendering.
    try {
      void fetch("/api/ads/impression", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slot: "display" }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* noop */
    }
  }, []);

  if (!hydrated || !visible || dismissed) return null;

  return (
    <div
      className={cn(
        "relative mx-auto w-fit max-w-full overflow-hidden rounded-md border border-border/40 bg-surface/40 backdrop-blur",
        "hidden sm:block",
        className,
      )}
      role="region"
      aria-label="Sponsored advertisement"
    >
      {/* Official ExoClick display snippet, in its documented order.
          The loader is mounted once per document (next/script dedupes
          by id) and drains the AdProvider queue when it arrives. */}
      <Script
        id="exoclick-ad-provider"
        src={EXOCLICK.adProviderScriptUrl}
        type="application/javascript"
        strategy="afterInteractive"
      />
      <ins
        className={EXOCLICK.displayZoneClass}
        data-zoneid={EXOCLICK.displayZoneId}
      />
      <Script
        id={`exoclick-display-${EXOCLICK.displayZoneId}`}
        strategy="afterInteractive"
      >
        {`(AdProvider = window.AdProvider || []).push({"serve": {}});`}
      </Script>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={dismissLabel}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg-deepest/70 text-cream/70 backdrop-blur transition-colors hover:bg-bg-deepest hover:text-cream"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}