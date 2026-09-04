import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb";
import type { TMDBCastMember } from "@/lib/types";

export function CastList({ cast }: { cast: TMDBCastMember[] }) {
  if (!cast.length) {
    return (
      <p className="text-sm text-text-muted">No cast information available.</p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cast.slice(0, 12).map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3"
        >
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
              <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                {c.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream">
              {c.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              {c.character || "—"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
