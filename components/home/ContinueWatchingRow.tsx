"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X } from "lucide-react";
import {
  buildWatchUrl,
  formatResumeTime,
  type WatchHistoryItem,
} from "@/lib/history";
import {
  getUserHistory,
  removeUserHistoryItem,
  migrateLocalHistoryToSupabase,
} from "@/lib/user-data";

/**
 * Continue Watching row. Mounts client-side, reads watch history
 * from localStorage, and renders one card per unwatched item.
 *
 * Self-hides when the user has no history. The Player dispatches
 * a `movbox:history:updated` event on every progress write so
 * the row re-renders without a page refresh.
 */
export function ContinueWatchingRow() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initial load. Empty until the effect runs (avoids SSR/CSR
    // mismatch since localStorage is browser-only).
    setReady(true);
    let cancelled = false;

    async function refresh() {
      const list = await getUserHistory();
      if (cancelled) return;
      setItems(list);
      // One-time migration: if the user just signed in, push their
      // localStorage history to supabase.
      migrateLocalHistoryToSupabase().then((r) => {
        if (r.pushed > 0) {
          console.log(`[history] migrated ${r.pushed} items to supabase`);
        }
      });
    }
    refresh();
    // Re-render on local changes within the same tab (when the
    // Player writes a new progress point).
    const onLocal = () => refresh();
    window.addEventListener("movbox:history:updated", onLocal);
    // Also refresh on storage events from other tabs.
    window.addEventListener("storage", onLocal);
    return () => {
      cancelled = true;
      window.removeEventListener("movbox:history:updated", onLocal);
      window.removeEventListener("storage", onLocal);
    };
  }, []);

  if (!ready || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10 lg:px-8">
      <header className="mb-3 flex items-end justify-between gap-3 px-3 sm:mb-5 sm:px-5 md:px-6 lg:px-8">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-cream sm:text-lg md:text-xl">
          <span>Continue Watching</span>
        </h2>
      </header>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:gap-4">
        {items.map((item) => (
          <ContinueCard
            key={`${item.detailPath}-${item.season ?? ""}-${item.episode ?? ""}`}
            item={item}
            onRemove={() => {
              removeUserHistoryItem(item.detailPath, item.season, item.episode);
              getUserHistory().then(setItems);
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ContinueCard({
  item,
  onRemove,
}: {
  item: WatchHistoryItem;
  onRemove: () => void;
}) {
  const resume = formatResumeTime(item);
  const percent =
    item.duration > 0
      ? Math.min(100, Math.max(0, (item.currentTime / item.duration) * 100))
      : 0;
  const watchUrl = buildWatchUrl(item);

  return (
    <div className="group/row relative w-[260px] shrink-0 snap-start sm:w-[300px] md:w-[340px]">
      <Link
        href={watchUrl}
        className="block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50"
      >
        {/* Backdrop with gradient overlay + play icon */}
        <div className="relative aspect-video w-full overflow-hidden bg-bg-deepest">
          {item.backdropUrl || item.posterUrl ? (
            <Image
              src={item.backdropUrl || item.posterUrl}
              alt={item.title}
              fill
              sizes="340px"
              className="object-cover transition-transform group-hover/row:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/row:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg-deepest shadow-glow">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          {/* Resume time + episode */}
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white drop-shadow">
                {item.title}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/80 drop-shadow">
                {item.season != null && item.episode != null
                  ? `S${item.season} · E${item.episode}`
                  : "Movie"}
                {resume ? ` · ${resume}` : ""}
              </p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-surface-elevated">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${percent}%` }}
            aria-label={`${Math.round(percent)}% watched`}
          />
        </div>
      </Link>
      {/* Remove from history button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.title} from history`}
        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-deepest/90 text-text-muted opacity-0 backdrop-blur transition-opacity hover:text-cream group-hover/row:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
