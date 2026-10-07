import { HeroCarousel } from "@/components/home/HeroCarousel";
import { MovieRow } from "@/components/home/MovieRow";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureFooter } from "@/components/home/FeatureFooter";
import { ContinueWatchingRow } from "@/components/home/ContinueWatchingRow";
import { ExoclickBanner } from "@/components/ads/ExoclickBanner";
import { getBoxmoviesHome } from "@/lib/data";
import type { MediaCard, BoxMediaCard } from "@/lib/types";

export const revalidate = 1800; // 30 min

function toMediaCard(c: BoxMediaCard): MediaCard {
  return {
    id: c.detailPath,
    type: c.type,
    title: c.title,
    year: c.year?.toString() ?? "",
    rating: c.rating ?? 0,
    posterPath: c.posterUrl,
    backdropPath: c.backdropUrl,
    overview: c.overview,
  };
}

// Boxmovies' home page has a few "tab" carousels at the top (Home, TV show,
// Movie, Animation, Novel, Most Watched, Boxmovies App, FM Download, Games)
// that all render the same top picks. We skip them and keep the real
// themed rows below.
const SKIP_SECTION_TITLES = new Set([
  "Home",
  "TV show",
  "TV Show",
  "Movie",
  "Movies",
  "Animation",
  "Novel",
  "Most Watched",
  "Boxmovies App",
  "FM Download",
  "Games",
  "Boxmovies",
]);

export default async function HomePage() {
  const home = await getBoxmoviesHome().catch(() => ({
    sections: [],
    hero: [],
    count: 0,
  }));

  const hero: MediaCard[] = home.hero.map(toMediaCard);

  // Filter + dedupe sections
  const seenItemSets = new Set<string>();
  const sections: Array<{ title: string; items: MediaCard[]; key: string }> = [];
  for (const s of home.sections) {
    if (SKIP_SECTION_TITLES.has(s.title)) continue;
    if (!s.items?.length) continue;
    const fp = s.items
      .slice(0, 6)
      .map((i) => i.detailPath)
      .sort()
      .join("|");
    if (seenItemSets.has(fp)) continue;
    seenItemSets.add(fp);
    sections.push({
      title: s.title,
      items: s.items.map(toMediaCard),
      key: `${s.title}-${fp.slice(0, 16)}`,
    });
  }

  // Inject sponsored banners between rows. After row 1 (under the hero),
  // after row 4 (mid-page), and after row 7 (deep scroll) — three
  // placements so the user is exposed regardless of scroll depth. The
  // banner's own session cap still limits it to 1 per session, so
  // additional <ExoclickBanner /> renders in the same session are
  // no-ops.
  const BANNER_AFTER = new Set([1, 4, 7]);

  return (
    <div className="bg-bg-deepest">
      {/* Hero */}
      <HeroCarousel items={hero} />

      {/* Top-of-page sponsored banner — ExoClick display zone. The
          first thing the user sees after the hero, so they can't
          miss it. Capped to 1 per session; the banner itself hides
          below `sm` because a banner that doesn't fit the viewport
          is worse than no banner on mobile. */}
      <div className="mx-auto flex max-w-7xl justify-center px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
        <ExoclickBanner />
      </div>

      {/* Continue Watching — only shows if the user has history.
          Reads from localStorage; SSR returns nothing (avoids
          hydration mismatch). */}
      <ContinueWatchingRow />

      {/* Promo banner + features just under the hero */}
      <div className="pt-6">
        <PromoBanner />
      </div>
      <div className="pt-3">
        <FeatureFooter />
      </div>

      {/* Themed sections + sponsored banners */}
      {sections.map((section, idx) => {
        const rowNum = idx + 1;
        const showBannerAfter = BANNER_AFTER.has(rowNum);
        return (
          <div key={section.key}>
            <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10 lg:px-8">
              <MovieRow title={section.title} items={section.items} />
            </section>
            {showBannerAfter && (
              <div className="mx-auto flex max-w-7xl justify-center px-4 pt-6 md:px-6 lg:px-8">
                <ExoclickBanner />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
