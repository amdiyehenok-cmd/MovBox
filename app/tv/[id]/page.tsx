import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getBoxmoviesDetail, getBoxmoviesRelated } from "@/lib/boxmovies";
import { TVDetailView } from "@/components/detail/TVDetailView";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TVDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const details = await getBoxmoviesDetail(id).catch(() => null);
  if (!details) return { title: "TV Show" };
  return {
    title: details.title,
    description: details.synopsis || `Watch ${details.title} on ${SITE_NAME}.`,
  };
}

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const { id } = await params;
  const details = await getBoxmoviesDetail(id).catch(() => null);
  if (!details) notFound();

  // If boxmovies says this is actually a movie, redirect.
  if (details.kind === "movie") {
    redirect(`/movie/${encodeURIComponent(details.detailPath)}`);
  }

  // Curated "More Like This" — TV-biased, 12 items, no dupes, current excluded.
  const related = await getBoxmoviesRelated(details.detailPath, "tv", 12).catch(() => []);

  return <TVDetailView details={details} related={related} />;
}
