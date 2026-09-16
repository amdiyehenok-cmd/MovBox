import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getBoxmoviesDetail, getBoxmoviesRelated } from "@/lib/data";
import { MovieDetailView } from "@/components/detail/MovieDetailView";
import { AdcashBanner } from "@/components/ads/AdcashBanner";
import { AdcashInterstitial } from "@/components/ads/AdcashInterstitial";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const details = await getBoxmoviesDetail(id).catch(() => null);
  if (!details) return { title: "Movie" };
  return {
    title: details.title,
    description: details.synopsis || `Watch ${details.title} on ${SITE_NAME}.`,
  };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  const details = await getBoxmoviesDetail(id).catch(() => null);
  if (!details) notFound();

  // If boxmovies says this is actually a TV show, redirect.
  if (details.kind === "tv") {
    redirect(`/tv/${encodeURIComponent(details.detailPath)}`);
  }

  // Curated "More Like This" — movie-biased, 12 items.
  const related = await getBoxmoviesRelated(details.detailPath, "movie", 12).catch(() => []);

  return (
    <>
      <AdcashInterstitial />
      <MovieDetailView details={details} related={related} />
      <div className="mx-auto flex max-w-7xl justify-center px-4 pb-10 md:px-6 lg:px-8">
        <AdcashBanner className="my-6" />
      </div>
    </>
  );
}
