"use client";

import { useState } from "react";
import Image from "next/image";
import { CastList } from "./CastList";
import { ReviewList, RatingBreakdown } from "./ReviewList";
import { MovieRow } from "@/components/home/MovieRow";
import { Star, ChevronRight, ChevronDown, ChevronUp, Play, Plus } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import { formatYear, formatRating, formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TMDBCastMember, TMDBVideo, MediaCard } from "@/lib/types";

interface Review {
  id: string;
  author: string;
  author_details: { name: string; username: string; avatar_path: string | null; rating: number | null };
  content: string;
  created_at: string;
}

interface MovieDetailContentProps {
  title: string;
  posterPath: string | null;
  overview: string | null;
  tagline?: string | null;
  cast: TMDBCastMember[];
  crew: Array<{ id: number; name: string; job: string; department: string }>;
  trailers: TMDBVideo[];
  reviews: Review[];
  voteAverage: number;
  voteCount: number;
  releaseDate?: string;
  runtime?: number | null;
  status?: string;
  productionCompanies?: { id: number; name: string; logo_path: string | null }[];
  similar?: MediaCard[];
}

export function MovieDetailContent({
  title,
  overview,
  cast,
  crew,
  trailers,
  reviews,
  voteAverage,
  voteCount,
  releaseDate,
  runtime,
  status,
  productionCompanies,
  similar,
}: MovieDetailContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "reviews" | "trailers" | "similar">(
    "overview"
  );
  // Reviews: show only first by default, expand to show all
  const [showAllReviews, setShowAllReviews] = useState(false);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  const director = crew.find((c) => c.job === "Director");
  const writers = crew.filter(
    (c) =>
      c.department === "Writing" &&
      (c.job === "Writer" || c.job === "Screenplay")
  );
  const year = formatYear(releaseDate);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "cast" as const, label: "Cast & Crew" },
    { id: "reviews" as const, label: "Reviews", count: "1.2K" },
    { id: "trailers" as const, label: "Trailers & Clips" },
    { id: "similar" as const, label: "More Like This" },
  ];

  // Reusable shared content for the body
  const DetailsCard = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-5 font-display text-xl font-semibold text-cream">Details</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {director && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Director</h3>
            <p className="text-sm font-medium text-cream">{director.name}</p>
          </div>
        )}
        {writers.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Writers</h3>
            <p className="text-sm font-medium text-cream">
              {Array.from(new Set(writers.map((w) => w.name))).join(", ")}
            </p>
          </div>
        )}
        {releaseDate && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Release Date</h3>
            <p className="text-sm font-medium text-cream">
              {new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        )}
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Language</h3>
          <p className="text-sm font-medium text-cream">English</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Budget</h3>
          <p className="text-sm font-medium text-cream">$190 million</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Box Office</h3>
          <p className="text-sm font-medium text-cream">$714 million</p>
        </div>
        {productionCompanies && productionCompanies.length > 0 && (
          <div className="sm:col-span-2">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Studio</h3>
            <p className="text-sm font-medium text-cream">{productionCompanies[0].name}</p>
          </div>
        )}
        {status && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</h3>
            <p className="text-sm font-medium text-cream">{status}</p>
          </div>
        )}
      </div>
    </div>
  );

  const CastCard = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Cast</h2>
        {cast.length > 5 && (
          <button
            type="button"
            onClick={() => setActiveTab("cast")}
            className="text-sm text-accent-bright hover:underline"
          >
            View All
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {cast.slice(0, 5).map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
              {c.profile_path ? (
                <Image
                  src={tmdbImage(c.profile_path, "w185")!}
                  alt={c.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
                  {c.name.charAt(0)}
                </div>
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

  const SimilarCard = similar && similar.length > 0 ? (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Similar Movies</h2>
        <button
          type="button"
          onClick={() => setActiveTab("similar")}
          className="text-sm text-accent-bright hover:underline"
        >
          View All
        </button>
      </div>
      <ul className="space-y-3">
        {similar.slice(0, 4).map((m) => (
          <li key={`${m.type}-${m.id}`}>
            <a
              href={m.type === "movie" ? `/movies/${m.id}` : `/tv/${m.id}`}
              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-elevated"
            >
              <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
                {m.posterPath ? (
                  <Image
                    src={tmdbImage(m.posterPath, "w154")!}
                    alt={m.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: "#53151e" }}>
                    <span className="font-display text-[10px] text-cream/40">H</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-cream group-hover:text-accent-bright">{m.title}</p>
                <p className="text-xs text-text-muted">
                  {m.year ? new Date(m.year).getFullYear() : ""}
                  {m.runtime ? ` · ${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : ""}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // Trailer now lives in the left column (smaller), next to Similar/Seasons (right column)
  const TrailerCompact = (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 font-display text-xl font-semibold text-cream">Watch Trailer</h2>
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
        <p className="rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center text-sm text-text-muted">
          No trailers available.
        </p>
      )}
    </div>
  );

  // Reviews — collapsible. Shows first review by default, "See all" reveals the rest.
  const ReviewsSection = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-cream">Reviews</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Rating breakdown card */}
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <div className="text-center">
            <div className="font-display text-5xl font-bold text-cream">{formatRating(voteAverage)}</div>
            <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-1 text-[10px] text-text-muted">Based on {(voteCount / 1000).toFixed(0)}K votes</p>
          </div>
          <div className="mt-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((r, i) => {
              const buckets = [70, 20, 5, 2, 1];
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
        {/* Review cards — collapsible */}
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
            <p className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center text-sm text-text-muted">
              No reviews yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );

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

      {/* Overview tab: full design layout */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Row 1: Details | Cast */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {DetailsCard}
            {CastCard}
          </div>
          {/* Row 2: Trailer (left) | Similar Movies (right) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {TrailerCompact}
            {SimilarCard}
          </div>
          {/* Row 3: Reviews — collapsible */}
          {ReviewsSection}
          {/* Row 4: You Might Also Like (full width) */}
          {similar && similar.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold text-cream">You Might Also Like</h2>
              <MovieRow title="" items={similar.slice(0, 6)} />
            </section>
          )}
        </div>
      )}

      {activeTab === "cast" && (
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="mb-5 font-display text-xl font-semibold text-cream">Full Cast</h2>
          <CastList cast={cast} />
        </div>
      )}

      {activeTab === "trailers" && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-cream">Watch Trailer</h2>
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

      {activeTab === "reviews" && (
        <div className="space-y-6">{ReviewsSection}</div>
      )}

      {activeTab === "similar" && similar && similar.length > 0 && (
        <MovieRow title="More Like This" items={similar} />
      )}
    </>
  );
}

