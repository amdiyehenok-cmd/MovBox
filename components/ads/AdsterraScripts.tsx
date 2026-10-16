"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADSTERRA, adsterraAllowedForPath } from "@/lib/ads/adsterra";

/**
 * AdsterraScripts — loads the Adsterra direct-link tags (zone pl31180787 and
 * pl31180785) exactly once per document.
 *
 * WHY AN IMPERATIVE INJECTION INSTEAD OF <Script>
 *
 * `next/script` is the right tool for tags we render, because those tags
 * belong to a specific component that mounts and unmounts with its route.
 * These do not. Adsterra's loaders attach listeners to `window`/`document`
 * and keep them attached for the life of the document; there is no teardown
 * API and no return handle. Two consequences:
 *
 *   1. Rendering them via <Script> inside a pathname-gated component would
 *      unmount/remount the tag on every client-side navigation, re-appending
 *      the <script> element each time. Re-executing the loader on a route
 *      change buys us nothing (their state already lives in the listeners)
 *      and risks duplicate impressions.
 *   2. We therefore append once, imperatively, and never touch them again.
 *
 * The decision is LATCHED at first evaluation. That is not an optimisation,
 * it is a correctness requirement: the moment we load the tags, their
 * listeners are live on the page. Deleting the <script> element afterwards
 * would not detach them, so pretending we "unload on /watch" would be a
 * lie we then document around. Instead we make one honest choice based on
 * where the document load began, and the policy for it lives in
 * lib/ads/adsterra.ts.
 *
 * Idempotence: every unit carries a stable DOM id and we check for it before
 * appending, so a hard reload, a bfcache restore, or React 19 StrictMode's
 * double-invoked effects in development can never double-append a unit.
 */

/**
 * Latches the entry-path decision for this document. Module scope, so it
 * survives re-renders and client-side navigations but resets on a real page
 * load — exactly the lifetime we want.
 */
let decisionLatched = false;
let injected = false;

export function AdsterraScripts() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!decisionLatched) {
      decisionLatched = true;
      const allowed = adsterraAllowedForPath(pathname);
      console.log(
        `[movbox:adsterra] entry decision — path=${pathname} allowed=${allowed}`
      );
      if (!allowed) return;
    }

    if (injected) return;

    const appended: string[] = [];

    for (const unit of ADSTERRA.scripts) {
      if (document.getElementById(unit.id)) continue;
      const el = document.createElement("script");
      el.id = unit.id;
      el.src = unit.src;
      el.async = true;
      el.type = "text/javascript";
      // Deliberately no `crossOrigin`. These are classic script tags, not
      // module imports; forcing CORS mode on them adds a failure mode for
      // zero benefit.
      document.body.appendChild(el);
      appended.push(unit.zone);
    }

    injected = true;
    console.log(`[movbox:adsterra] injected zones: ${appended.join(", ")}`);
  }, [pathname]);

  return null;
}