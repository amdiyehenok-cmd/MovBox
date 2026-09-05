"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialBarProps {
  /** Adsterra social-bar zone ID (31080288). */
  zone: string;
  /** Adsterra site ID (6028680). */
  siteId: string;
  /** Adsterra-provided social-bar script URL. */
  scriptSrc: string;
  /** Called when the user clicks the dismiss ×. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * Adsterra Social Bar — the push-notification-style ad that lives at
 * the bottom of the screen. Highest revenue-per-impression of any
 * format Adsterra sells. We render it as a fixed bottom bar with the
 * Adsterra iframe inside, and we ALWAYS show our own dismiss × so the
 * user can close it.
 *
 * Why a dismiss × matters: Adsterra's default social bar has no
 * built-in close. Without a dismiss, users feel trapped — they
 * either click the ad or they stare at it. Trapped = resentful =
 * never come back. One-click dismiss keeps the impression without
 * the resentment.
 */
export function SocialBar({
  zone,
  siteId,
  scriptSrc,
  onDismiss,
  className,
}: SocialBarProps) {
  // The Adsterra script auto-creates a fixed-position iframe at
  // z-index ~2147483647 (a JS integer near max). We mount OUR own
  // dismiss button on top via the same z-index band. The Adsterra
  // iframe appears just to the LEFT of our ×.
  //
  // We don't try to inline the Adsterra creative — we just trust
  // their script to render it. We add a wrapper that sits above
  // everything (z-index 2147483647+1) and houses the dismiss button.
  const [visible, setVisible] = useState(true);

  // Mount the Adsterra script once on first render. The script
  // self-loads via the global `atOptions` shim if needed; in newer
  // accounts the Adsterra loader just needs the config object to be
  // present BEFORE the script runs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    interface AdsterraWindow extends Window {
      atOptions?: Record<string, unknown>;
    }
    const w = window as unknown as AdsterraWindow;
    w.atOptions = {
      format: "js",
      inScreen: false,
      bid: 0,
      params: {},
      siteId,
      adUnit: zone,
      adType: "socialbar",
      container: "adsterra-socialbar",
    };
    const s = document.createElement("script");
    s.async = true;
    s.src = scriptSrc;
    s.setAttribute("data-cfasync", "false");
    document.body.appendChild(s);
    return () => {
      try {
        document.body.removeChild(s);
      } catch {
        /* already gone */
      }
    };
  }, [siteId, zone, scriptSrc]);

  if (!visible) return null;

  return (
    <div
      // z-index 2147483648 = max safe int + 1 — sits above the
      // Adsterra iframe. We position our dismiss button at the right
      // edge of the social bar's typical footprint.
      style={{ zIndex: 2147483647 + 1 }}
      className={cn(
        "fixed bottom-0 right-0",
        "pointer-events-none", // let clicks pass through to the social bar
        className
      )}
    >
      {/* Container that Adsterra's script will populate. It places
          the bar ~24-30px from the bottom-right; we let it. */}
      <div
        id="adsterra-socialbar"
        className="pointer-events-auto"
      />
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        aria-label="Dismiss sponsored bar"
        className={cn(
          "pointer-events-auto",
          "absolute right-1 top-1",
          "flex h-7 w-7 items-center justify-center rounded-full",
          "bg-bg-deepest/80 text-cream backdrop-blur",
          "border border-cream/20",
          "hover:bg-bg-deepest hover:scale-110",
          "transition-all"
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
