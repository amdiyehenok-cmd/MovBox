import { HeroCarousel } from "@/components/home/HeroCarousel";
import { MovieRow } from "@/components/home/MovieRow";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeatureFooter } from "@/components/home/FeatureFooter";
import { AdSlot } from "@/components/ads/AdSlot";
import { BannerAd } from "@/components/ads/BannerAd";
import { ADSTERRA } from "@/lib/ads/adsterra";
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
  // AdSlot's frequency cap still limits to 1 banner per session.
  const BANNER_AFTER = new Set([1, 4, 7]);

  return (
    <div className="bg-bg-deepest">
      {/* Hero */}
      <HeroCarousel items={hero} />

      {/* Top-of-page sponsored banner — renders server-side, no hydration
          needed. This is the first thing the user sees after the hero so
          they can't miss it. Capped client-side via the AdSlot helper
          if/when we add one. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
        <BannerAd
          href={ADSTERRA.smartlinkUrl}
          title="Sponsored — Today's Pick"
          subtitle="Hand-picked for Movbox viewers · Tap to see offer"
          cta="See offer"
        />
      </div>

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
              <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
                <AdSlot name="banner" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
