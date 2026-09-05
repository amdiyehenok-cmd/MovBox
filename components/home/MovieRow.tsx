"use client";

import { Fragment, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_FREQUENCY } from "@/lib/ads/adsterra";
import type { MediaCard } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  items: MediaCard[];
  seeAllHref?: string;
  className?: string;
  icon?: React.ReactNode;
  /** Class applied to the icon wrapper (for color/styling overrides). */
  iconClassName?: string;
  /**
   * Override the default ad-injection cadence. Set to 0 to disable
   * the in-feed sponsored card for this row. The home page sets
   * this lower on its first row (every 7th) so users see the ad
   * early, and other rows use the default (every 9th).
   */
  adEvery?: number;
}

/**
 * Horizontal scroll row with prev/next chevrons on hover.
 * Netflix-style: snap, hide scrollbar, smooth.
 *
 * The per-card href is built inside MovieCard based on the card's own
 * `type` and `id` fields — this row doesn't accept an href prop because
 * functions can't cross the Server→Client Component boundary.
 */
export function MovieRow({
  title,
  items,
  seeAllHref,
  className,
  icon,
  iconClassName,
  adEvery = AD_FREQUENCY.feedCardEvery,
}: MovieRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (!items.length) return null;

  return (
    <section className={cn("relative group/row", className)}>
      <header className="mb-2.5 flex items-end justify-between gap-3 px-3 sm:mb-3 sm:px-5 md:px-6 lg:px-8">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg md:text-xl">
          {icon && <span className={cn("flex items-center", iconClassName)}>{icon}</span>}
          <span>{title}</span>
        </h2>
        {seeAllHref && (
          <a
            href={seeAllHref}
            className="text-sm font-medium text-accent-bright transition-colors hover:text-cream"
          >
            View All
          </a>
        )}
      </header>

      <div className="relative">
        {/* Prev / Next chevrons — appear on hover */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy("left")}
          className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-deepest/80 text-text-primary opacity-0 backdrop-blur transition-opacity hover:border-accent hover:bg-brand md:flex group-hover/row:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy("right")}
          className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-deepest/80 text-text-primary opacity-0 backdrop-blur transition-opacity hover:border-accent hover:bg-brand md:flex group-hover/row:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth px-3 pb-2 sm:gap-2 sm:px-5 md:gap-3 md:px-6 lg:gap-3.5 lg:px-8"
        >
          {items.map((media, i) => {
            // Inject one in-feed sponsored card every N items.
            // The AdSlot handles its own frequency cap (no-op when
            // the user has hit the per-session total of 3).
            const injectAd = adEvery > 0 && (i + 1) % adEvery === 0 && i < items.length - 1;
            return (
              <Fragment key={`${media.type}-${media.id}-${i}`}>
                <MovieCard
                  media={media}
                  priority={i < 4}
                />
                {injectAd && (
                  <div className="w-[100px] shrink-0 sm:w-[128px] md:w-[148px] lg:w-[168px]">
                    <AdSlot name="feed-card" className="block h-full" />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
