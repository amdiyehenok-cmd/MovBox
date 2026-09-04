/**
 * Shared TypeScript types used across the Movbox frontend.
 * Mirrors the boxmovies-api data shapes (boxmovies.org is the single
 * source of truth for everything — no TMDB, no CinePro, no Oracle).
 */

// =========================================================================
// Boxmovies types — all metadata + streams come from boxmovies-api
// =========================================================================

/** A single playable source (always MP4 from boxmovies). */
export interface BoxSource {
  id?: string;
  url: string;
  type: "mp4";
  quality: string; // "1080p"
  resolution?: number;
  sizeBytes?: number;
  durationSeconds?: number;
  format?: string;
  codec?: string;
  vipLocked?: boolean;
  /** Subtitle tracks attached to this specific source. */
  subtitles?: BoxCaption[];
  provider: { id: "boxmovies"; name: "BoxMovies" };
}

/** A subtitle track (SRT/VTT) from boxmovies. The URL is signed and works directly. */
export interface BoxCaption {
  id: string;
  url: string;
  /** ISO 639-1 code: "en", "ar", "fr"… */
  languageCode: string;
  /** Human-readable name: "English", "العربية"… */
  language: string;
  delay?: number;
  sizeBytes?: number;
}

/** A single episode quality of a movie / TV episode. */
export interface BoxSourceGroup {
  detailPath: string;
  season: number;
  episode: number;
  subjectId?: string;
  hasResource: boolean;
  isLimited?: boolean;
  vipLocked?: boolean;
  freeStreamsRemaining?: number;
  sources: BoxSource[];
  captions: BoxCaption[];
}

/** Lightweight card shape for browse pages (home / search / trending). */
export interface BoxMediaCard {
  /** Unique ID = the boxmovies detailPath. */
  detailPath: string;
  type: "movie" | "tv";
  title: string;
  year: number | null;
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
}

/** Full detail page metadata. */
export interface BoxDetail {
  detailPath: string;
  /** "movie" | "tv" | "unknown" */
  kind: "movie" | "tv" | "unknown";
  title: string;
  synopsis: string;
  releaseDate: string;
  releaseYear: number | null;
  /** Duration in seconds (movies) or null (TV). */
  durationSeconds: number | null;
  /** Duration formatted as "1h 46m" or null. */
  durationLabel: string | null;
  /** Human-readable genres: ["Action", "Drama"] */
  genres: string[];
  country: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
  hasResource: boolean;
  /** Available subtitle language names. */
  availableSubtitleLanguages: string[];
  /** TV-only — empty for movies. */
  seasons: Array<{
    season: number;
    episodeCount: number;
    episodes: number[] | null;
    resolutions: Array<{ resolution: number; episode: number }>;
  }>;
  source: string;
  uploadBy: string;
  /** Trailer stream URL (boxmovies trailer). */
  trailer: { url: string; source?: string } | null;
  /** Cast list (pageData.stars). Each has name, character, avatar, detailPath. */
  cast: Array<{
    name: string;
    character: string | null;
    avatar: string | null;
    detailPath: string | null;
  }>;
  /** User reviews (pageData.midReviewsList). */
  reviews: Array<{
    postId: string;
    userId: string;
    content: string;
    user: { nickname: string; avatar: string | null };
    createdAt: number | null;
    rating: number | null;
  }>;
}

/** A single entry in a boxmovies /home themed section. */
export interface BoxMediaCard {
  /** Unique ID = the boxmovies detailPath. */
  detailPath: string;
  type: "movie" | "tv";
  title: string;
  year: number | null;
  rating: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
}

// =========================================================================
// Legacy types (kept for backwards-compat — unused by boxmovies flow)
// =========================================================================

export interface CineProSource {
  url: string;
  type: "hls" | "mp4";
  quality: string;
  audioTracks?: { language: string; label: string }[];
  subtitles?: { language: string; label: string; url: string }[];
  provider: { id: string; name: string };
}

export interface CineProResponse {
  responseId: string;
  expiresAt: string;
  sources: CineProSource[];
  subtitles?: { language: string; label: string; url: string }[];
}

// =========================================================================
// App-level types
// =========================================================================

export type MediaType = "movie" | "tv";

/** Unified media shape used by rows/cards (works for both movies and TV). */
export interface MediaCard {
  id: string; // boxmovies detailPath
  type: MediaType;
  title: string;
  year: string;
  rating: number;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  runtime?: number | null;
}
