import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Movbox brand mark.
 * The "M" is rendered in Cinzel display serif (burgundy), the "ovbox" wordmark in Inter.
 * Matches the brand: lowercase "ovbox" + capital "M" gives a premium, distinctive look.
 */
export function Logo({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { h: "text-lg", w: "text-lg" },
    md: { h: "text-2xl", w: "text-xl" },
    lg: { h: "text-4xl", w: "text-3xl" },
  } as const;

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-baseline gap-0.5 font-display font-bold tracking-tight",
        className
      )}
      aria-label="Movbox — Home"
    >
      <span
        className={cn(
          "text-brand transition-colors group-hover:text-accent-bright",
          sizes[size].h
        )}
      >
        M
      </span>
      <span className={cn("text-text-primary", sizes[size].w)}>ovbox</span>
    </Link>
  );
}
