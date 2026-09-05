"use client";

import { Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface InFeedAdProps {
  /** Adsterra Smartlink URL — opens the offer in a new tab. */
  smartlinkUrl: string;
  className?: string;
}

/**
 * In-feed sponsored card. Looks like a real movie/TV card so it
 * doesn't shout "I AM AN AD", but is clearly labeled "Sponsored"
 * to keep us on the right side of every ad policy. Click goes to
 * the Adsterra Smartlink in a new tab.
 *
 * Sized to match a regular movie card on the home / browse / search
 * rows. Aspect ratio: same 2:3 as MovieCard.
 */
export function InFeedAd({ smartlinkUrl, className }: InFeedAdProps) {
  return (
    <a
      href={smartlinkUrl}
      target="_blank"
      rel="sponsored noopener"
      className={cn(
        "group relative block overflow-hidden rounded-lg border border-border bg-surface transition-colors",
        "hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      aria-label="Sponsored advertisement (opens in new tab)"
    >
      {/* Sponsored gradient — distinct from a real poster so users
          don't confuse the two. Burgundy ↔ gold ↔ deep, with a soft
          glow that reads as "this is a different kind of card". */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(196,148,59,0.35), transparent 55%), radial-gradient(circle at 70% 80%, rgba(128,0,32,0.45), transparent 55%), linear-gradient(135deg, #1b1113 0%, #0d0909 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent-bright" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-cream">
              Sponsored
            </p>
            <p className="mt-1 text-xs text-vanilla-dim">
              Hand-picked picks for you
            </p>
          </div>
        </div>
        {/* Bottom-left sponsored pill — same height as a season tag on
            real cards, so the row doesn't visually break. */}
        <div className="absolute left-2 top-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-bg-deepest/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-bright shadow-sm backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Sponsored
          </span>
        </div>
      </div>
    </a>
  );
}
