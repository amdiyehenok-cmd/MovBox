import { SITE_NAME, SITE_URL } from "@/lib/constants";
import type { BoxDetail } from "@/lib/types";

/**
 * JSON-LD structured data for a movie. Google uses this to render
 * rich results (poster thumbnail, rating, year, director) directly
 * in the search result. Critical for "watch {title} online" type
 * queries to surface the Movbox page in a card format instead of a
 * plain blue link.
 *
 * Schema reference: https://schema.org/Movie
 */
export function MovieJsonLd({ details }: { details: BoxDetail }) {
  const pageUrl = `${SITE_URL}/movie/${encodeURIComponent(details.detailPath)}`;
  const rating =
    typeof details.rating === "number" && details.rating > 0
      ? { ratingValue: details.rating, bestRating: 10 }
      : undefined;

  const json = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: details.title,
    url: pageUrl,
    description: details.synopsis,
    image: details.backdropUrl ?? details.posterUrl,
    datePublished: details.releaseDate || undefined,
    director: details.cast
      .filter((c) => /director/i.test(c.character || ""))
      .map((c) => ({ "@type": "Person", name: c.name })),
    actor: details.cast.slice(0, 10).map((c) => ({
      "@type": "Person",
      name: c.name,
    })),
    genre: details.genres,
    duration: details.durationSeconds
      ? `PT${Math.floor(details.durationSeconds / 60)}M`
      : undefined,
    aggregateRating: rating && details.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: rating.ratingValue,
          bestRating: rating.bestRating,
          ratingCount: details.ratingCount,
        }
      : rating
        ? { "@type": "AggregateRating", ...rating }
        : undefined,
    inLanguage: "en",
    isAccessibleForFree: true,
    // Google Discover + movie carousels pick this up.
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

/**
 * JSON-LD structured data for a TV series. Same idea as the movie
 * variant but uses the TVSeries schema so Google can show the
 * "TV show" badge.
 */
export function TVShowJsonLd({ details }: { details: BoxDetail }) {
  const pageUrl = `${SITE_URL}/tv/${encodeURIComponent(details.detailPath)}`;
  const rating =
    typeof details.rating === "number" && details.rating > 0
      ? { ratingValue: details.rating, bestRating: 10 }
      : undefined;

  const json = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: details.title,
    url: pageUrl,
    description: details.synopsis,
    image: details.backdropUrl ?? details.posterUrl,
    datePublished: details.releaseDate || undefined,
    director: details.cast
      .filter((c) => /director/i.test(c.character || ""))
      .map((c) => ({ "@type": "Person", name: c.name })),
    actor: details.cast.slice(0, 10).map((c) => ({
      "@type": "Person",
      name: c.name,
    })),
    genre: details.genres,
    numberOfSeasons: details.seasons.length || undefined,
    numberOfEpisodes: details.seasons.reduce(
      (acc, s) => acc + (s.episodes?.length ?? s.episodeCount ?? 0),
      0
    ) || undefined,
    aggregateRating: rating && details.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: rating.ratingValue,
          bestRating: rating.bestRating,
          ratingCount: details.ratingCount,
        }
      : rating
        ? { "@type": "AggregateRating", ...rating }
        : undefined,
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
