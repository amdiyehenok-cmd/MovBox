"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CastList } from "./CastList";
import { ReviewList } from "./ReviewList";
import { Star, ChevronRight, ChevronDown, ChevronUp, Play } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import { formatRating, formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TMDBCastMember, TMDBVideo, TMDBEpisode, MediaCard } from "@/lib/types";

interface Review {
  id: string;
  author: string;
  author_details: { name: string; username: string; avatar_path: string | null; rating: number | null };
  content: string;
  created_at: string;
}

interface TVDetailContentProps {
  showId: number;
  title: string;
  posterPath: string | null;
  overview: string | null;
  status?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  firstAirDate?: string;
  lastAirDate?: string;
  networks?: { id: number; name: string; logo_path: string | null }[];
  cast: TMDBCastMember[];
  trailers: TMDBVideo[];
  reviews: Review[];
  voteAverage: number;
  voteCount: number;
  similar?: MediaCard[];
  currentSeasonEpisodes?: TMDBEpisode[];
  currentSeason?: number;
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    poster_path: string | null;
    episode_count: number;
    air_date: string | null;
  }>;
  createdBy?: { id: number; name: string; profile_path: string | null }[];
}

export function TVDetailContent({
  showId,
  overview,
  status,
  numberOfSeasons,
  numberOfEpisodes,
  firstAirDate,
  lastAirDate,
  networks,
  cast,
  trailers,
  reviews,
  voteAverage,
  voteCount,
  similar,
  currentSeasonEpisodes = [],
  currentSeason = 1,
  seasons = [],
  createdBy = [],
}: TVDetailContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "cast" | "reviews" | "trailers" | "similar">(
    "overview"
  );
  // Collapsible reviews: show only first by default
  const [showAllReviews, setShowAllReviews] = useState(false);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  const tabs: Array<{ id: typeof activeTab; label: string; count?: string }> = [
    { id: "overview", label: "Overview" },
    { id: "episodes", label: "Episodes" },
    { id: "cast", label: "Cast & Crew" },
    { id: "reviews", label: "Reviews", count: "12.4K" },
    { id: "trailers", label: "Trailers & Clips" },
    { id: "similar", label: "More Like This" },
  ];

  // Details card (left, Overview)
  const DetailsCard = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-5 font-display text-xl font-semibold text-cream">Details</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {createdBy.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Creator</h3>
            <p className="text-sm font-medium text-cream">{createdBy.map((c) => c.name).join(", ")}</p>
          </div>
        )}
        {networks && networks.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Network</h3>
            <p className="text-sm font-medium text-cream">{networks[0].name}</p>
          </div>
        )}
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Release</h3>
          <p className="text-sm font-medium text-cream">
            {firstAirDate ? new Date(firstAirDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
            {lastAirDate && lastAirDate !== firstAirDate && (
              <> – {new Date(lastAirDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
            )}
          </p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Language</h3>
          <p className="text-sm font-medium text-cream">English</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Country</h3>
          <p className="text-sm font-medium text-cream">United States</p>
        </div>
        {status && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</h3>
            <p className="text-sm font-medium text-cream">{status}</p>
          </div>
        )}
        {numberOfSeasons != null && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Seasons</h3>
            <p className="text-sm font-medium text-cream">{numberOfSeasons}</p>
          </div>
        )}
        {numberOfEpisodes != null && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Episodes</h3>
            <p className="text-sm font-medium text-cream">{numberOfEpisodes}</p>
          </div>
        )}
        {currentSeasonEpisodes[0]?.runtime ? (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Runtime</h3>
            <p className="text-sm font-medium text-cream">{formatRuntime(currentSeasonEpisodes[0].runtime)} (avg)</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Top Cast card (right, Overview)
  const TopCastCard = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Top Cast</h2>
        {cast.length > 5 && (
          <button type="button" onClick={() => setActiveTab("cast")} className="text-sm text-accent-bright hover:underline">View All</button>
        )}
      </div>
      <ul className="space-y-3">
        {cast.slice(0, 5).map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
              {c.profile_path ? (
                <Image src={tmdbImage(c.profile_path, "w185")!} alt={c.name} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">{c.name.charAt(0)}</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-cream">{c.name}</p>
              <p className="truncate text-xs text-text-muted">{c.character || "—"}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setActiveTab("cast")}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-text-secondary transition-colors hover:border-accent hover:text-cream"
      >
        View Full Cast & Crew <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );

  // Seasons sidebar card (right, Overview) — placed in 2-col with Trailer
  const SeasonsCard = seasons.length > 0 ? (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Seasons</h2>
        <button type="button" onClick={() => setActiveTab("episodes")} className="text-sm text-accent-bright hover:underline">View All</button>
      </div>
      <ul className="space-y-2">
        {seasons.map((s) => (
          <li key={s.id}>
            <Link
              href={`/watch/tv/${showId}/${s.season_number}/1`}
              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-elevated"
            >
              <div className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
                {s.poster_path ? (
                  <Image
                    src={tmdbImage(s.poster_path, "w154")!}
                    alt={s.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: "#53151e" }}>
                    <span className="font-display text-[10px] text-cream/40">S{s.season_number}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-cream group-hover:text-accent-bright">Season {s.season_number}</p>
                <p className="text-xs text-text-muted">{s.episode_count} Episodes</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // Trailer — compact (left column, not full width)
  const TrailerCompact = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 font-display text-xl font-semibold text-cream">Trailer</h2>
      {trailers.length > 0 ? (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-bg-primary shadow-elevated">
          <iframe
            src={`https://www.youtube.com/embed/${trailers[0].key}?rel=0`}
            title={trailers[0].name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center text-sm text-text-muted">No trailers available.</p>
      )}
    </div>
  );

  // Reviews — collapsible. Shows first review by default, "See all" reveals the rest.
  const ReviewsSection = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Ratings &amp; Reviews</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <div className="text-center">
            <div className="font-display text-5xl font-bold text-cream">{formatRating(voteAverage)}</div>
            <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-1 text-[10px] text-text-muted">Based on {(voteCount / 1000).toFixed(0)}K votes</p>
          </div>
          <div className="mt-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((r, i) => {
              const buckets = [76, 16, 6, 1, 1];
              return (
                <div key={r} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-text-muted">{r} <span className="text-yellow-400">★</span></span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${buckets[i]}%` }} />
                  </div>
                  <span className="w-10 text-right text-text-muted">{buckets[i]}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-3">
          {reviews.length > 0 ? (
            <>
              <ReviewList reviews={visibleReviews} />
              {reviews.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllReviews((s) => !s)}
                  className="flex w-full items-center justify-center gap-1 rounded-md border border-border bg-surface/40 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated"
                >
                  {showAllReviews ? (
                    <>Show Less <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>See all {reviews.length.toLocaleString()} reviews <ChevronDown className="h-4 w-4" /></>
                  )}
                </button>
              )}
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center text-sm text-text-muted">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Episodes section (bottom row)
  const EpisodesSection = currentSeasonEpisodes.length > 0 ? (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Episodes</h2>
        {seasons.length > 0 && <button type="button" className="text-sm text-accent-bright hover:underline">View All Episodes</button>}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {currentSeasonEpisodes.slice(0, 8).map((ep) => (
          <Link
            key={ep.id}
            href={`/watch/tv/${showId}/${currentSeason}/${ep.episode_number}`}
            className="group w-64 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface/40 transition-all hover:border-accent"
          >
            <div className="relative aspect-video overflow-hidden bg-bg-primary">
              {ep.still_path ? (
                <Image
                  src={tmdbImage(ep.still_path, "w342")!}
                  alt={ep.name}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ background: "#53151e" }}>
                  <span className="text-xs text-text-muted">No preview</span>
                </div>
              )}
              {ep.episode_number === 1 && (
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-cream backdrop-blur">Now Playing</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-bg-deepest/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-cream">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-text-muted">
                S{currentSeason} E{ep.episode_number}
                {ep.runtime ? ` · ${formatRuntime(ep.runtime)}` : ""}
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-cream">{ep.name}</p>
              {ep.overview && (
                <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{ep.overview}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <>
      {/* Tabs */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-6 overflow-x-auto border-b border-border px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "relative whitespace-nowrap pb-3 pt-1 text-sm font-medium transition-colors",
              activeTab === t.id ? "text-accent-bright" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {t.label}
            {t.count && <span className="ml-1 text-xs text-text-muted">({t.count})</span>}
            {activeTab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-bright" />}
          </button>
        ))}
      </div>

      {/* Overview: full design layout */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Row 1: Details | Top Cast */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {DetailsCard}
            {TopCastCard}
          </div>
          {/* Row 2: Trailer (left) | Seasons (right) — trailer in left column, smaller */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {TrailerCompact}
            {SeasonsCard}
          </div>
          {/* Row 3: Ratings & Reviews — collapsible */}
          {ReviewsSection}
          {/* Row 4: Episodes (full width) */}
          {EpisodesSection}
        </div>
      )}

      {activeTab === "episodes" && (
        <div>{EpisodesSection}</div>
      )}

      {activeTab === "cast" && (
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="mb-5 font-display text-xl font-semibold text-cream">Full Cast</h2>
          <CastList cast={cast} />
        </div>
      )}

      {activeTab === "trailers" && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-cream">Trailer</h2>
          {trailers.length > 0 ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-bg-primary shadow-elevated">
              <iframe
                src={`https://www.youtube.com/embed/${trailers[0].key}?rel=0`}
                title={trailers[0].name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center text-sm text-text-muted">No trailers available.</p>
          )}
        </div>
      )}

      {activeTab === "reviews" && <div className="space-y-6">{ReviewsSection}</div>}

      {activeTab === "similar" && similar && similar.length > 0 && (
        <div className="space-y-4">
          {similar.slice(0, 6).map((m) => (
            <a
              key={`${m.type}-${m.id}`}
              href={m.type === "movie" ? `/movies/${m.id}` : `/tv/${m.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-surface/40 p-3 hover:border-accent"
            >
              <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
                {m.posterPath ? (
                  <Image src={tmdbImage(m.posterPath, "w154")!} alt={m.title} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: "#53151e" }}>
                    <span className="font-display text-xs text-cream/40">H</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-cream group-hover:text-accent-bright">{m.title}</p>
                <p className="text-xs text-text-muted">{m.year ? new Date(m.year).getFullYear() : ""}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
