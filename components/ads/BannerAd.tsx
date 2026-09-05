"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  /** URL the banner links to (Adsterra smartlink for now). */
  href: string;
  /** Headline shown on the left. */
  title?: string;
  /** Smaller text under the headline. */
  subtitle?: string;
  /** CTA label on the right. */
  cta?: string;
  /** Show only on the given breakpoints via Tailwind classes. */
  className?: string;
  /** Whether the user can dismiss the banner (sticky to session). */
  dismissible?: boolean;
}

/**
 * Pure-HTML banner ad — NO external script, NO provider dependency.
 * Renders a clean, premium-styled sponsored card that links to the
 * configured target URL. Visibility is capped via
 * lib/ads/frequency (bannerMaxPerSession).
 *
 * This is the "always show" fallback. It lives in the DOM as a
 * static <a> so ad-blockers can't hide it and it works on every
 * browser. Always labeled "Sponsored" so we stay on the right side
 * of every ad policy.
 */
export function BannerAd({
  href,
  title = "Sponsored",
  subtitle = "Today's pick — hand-picked for Movbox viewers",
  cta = "See offer",
  className,
  dismissible = true,
}: BannerAdProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      aria-label="Sponsored advertisement (opens in new tab)"
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-border bg-surface/60",
        "transition-colors hover:border-accent/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 8% 50%, rgba(128,0,32,0.18), transparent 55%), radial-gradient(circle at 92% 50%, rgba(196,148,59,0.18), transparent 55%), linear-gradient(180deg, #140d0e 0%, #0d0909 100%)",
        }}
      />
      <div className="relative flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 sm:h-12 sm:w-12">
          <Sparkles className="h-5 w-5 text-accent-bright sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-bg-deepest/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent-bright sm:text-[10px]">
              <Sparkles className="h-2.5 w-2.5" />
              Sponsored
            </span>
          </div>
          <p className="mt-1 truncate font-display text-sm font-semibold text-cream sm:text-base">
            {title}
          </p>
          <p className="truncate text-xs text-vanilla-dim sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-accent/90 px-3 py-1.5 text-xs font-bold text-bg-deepest shadow-card sm:inline-block">
            {cta} →
          </span>
          {dismissible && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDismissed(true);
              }}
              aria-label="Dismiss ad"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-bg-deepest/60 text-text-muted transition-colors hover:border-border hover:text-cream"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </a>
  );
}
