"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EXOCLICK } from "@/lib/ads/exoclick";
import "./exoclick-native.css";

/**
 * ExoclickNative — the native / recommendation widget (zone 6053376).
 *
 * IMPORTANT: the id on the wrapper is load-bearing, not cosmetic.
 * ExoClick re-skins this widget with `!important` rules scoped to a
 * random per-load id of its own (#msg-native-widget-6053376-fNqra and it
 * changes every request), which lands at specificity (1,2,0). Anything
 * pasted into their dashboard can never exceed (0,N,0) and always loses.
 * exoclick-native.css anchors on `#movbox-native-ads` and reaches
 * (1,3,0), so the theme wins outright. Do not rename or remove the id —
 * and do not move this CSS into their dashboard, it will stop working.
 *
 * ExoClick also emits a wrapper div with its own hashed class and an
 * inline height/width. The CSS flattens that so the widget flows at the
 * width we give it instead of pinning 300x250.
 *
 * Placement: below the fold, after real content. This widget is four
 * cards; putting it above content reads as "this is what the site is".
 */

const SESSION_TTL_MS = 30 * 60 * 1000;

function wasShownRecently(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(EXOCLICK.nativeShownKey);
    if (!raw) return false;
    const t = Number(raw);
    return Number.isFinite(t) && Date.now() - t < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

interface ExoclickNativeProps {
  className?: string;
}

export function ExoclickNative({ className }: ExoclickNativeProps) {
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Keep it off the watch page — that screen already runs the in-stream
    // pre-roll, and a recommendation grid under a full-bleed player is
    // clutter at best.
    if (pathname?.startsWith("/watch")) {
      setAllowed(false);
      return;
    }
    if (wasShownRecently()) return;
    try {
      window.localStorage.setItem(EXOCLICK.nativeShownKey, String(Date.now()));
    } catch {
      /* noop */
    }
    try {
      void fetch("/api/ads/impression", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slot: "native" }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* noop */
    }
    setAllowed(true);
  }, [pathname]);

  if (!allowed) return null;

  return (
    <aside
      id="movbox-native-ads"
      className={className}
      aria-label="Sponsored recommendations"
    >
      <Script
        id="exoclick-ad-provider"
        src={EXOCLICK.adProviderScriptUrl}
        type="application/javascript"
        strategy="afterInteractive"
      />
      <ins
        className={EXOCLICK.nativeZoneClass}
        data-zoneid={EXOCLICK.nativeZoneId}
      />
      <Script
        id={`exoclick-native-${EXOCLICK.nativeZoneId}`}
        strategy="afterInteractive"
      >
        {(window.AdProvider = window.AdProvider || []).push({ serve: {} })}
      </Script>
    </aside>
  );
}