import type { Metadata } from "next";
import { AdcashLoader } from "@/components/ads/AdcashLoader";
import { AdcashBanner } from "@/components/ads/AdcashBanner";
import { AdcashInterstitial } from "@/components/ads/AdcashInterstitial";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

/**
 * /ad — landing page for in-app Adcash click-throughs.
 *
 * The Android app opens this URL in a Chrome Custom Tab when the user
 * taps the native Adcash banner. Chrome is a real browser context
 * (full DOM, full JS, full Adcash fill), so impressions / clicks
 * count as real Adcash traffic. No WebView, no chromium sandbox
 * crashes — just a normal page that an Android user is shown in
 * their existing Chrome session.
 *
 * Layout: minimal, no nav. Just enough chrome for Adcash's auto-tag
 * to recognise this as a real visit. The page DOES render the
 * Display 468×60 banner inline so the user sees at least one ad
 * even if Adcash's auto-tag rotation decides not to fire a popup.
 */

export const metadata: Metadata = {
  title: `Sponsored · ${SITE_NAME}`,
  description: "Sponsored picks, hand-curated.",
  robots: { index: false, follow: false }, // never indexed
  alternates: { canonical: `${SITE_URL}/ad` },
};

export default function AdLandingPage() {
  return (
    <div className="min-h-screen bg-bg-deepest text-cream">
      {/* Site-wide Adcash auto-tag — rotates pop / interstitial /
          in-page push / video slider with Adcash's per-visitor
          UX/$ weighting. Same zones the rest of the site uses. */}
      <AdcashLoader />

      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-12 md:px-6 md:py-16">
        <header className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-bright">
            Sponsored
          </p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Today&rsquo;s picks, hand-curated for Movbox viewers
          </h1>
          <p className="mt-3 text-sm text-vanilla-dim md:text-base">
            We&rsquo;ve partnered with brands our community actually
            likes. Tap any banner below &mdash; it opens in your browser
            and the partner pays us a small fee, which keeps Movbox
            free for you.
          </p>
        </header>

        {/* The same 468×60 Display banner the home page uses. Renders
            inline in this page (no click-out, no redirect) so users
            can tap the banner CTA and earn us a click-through. */}
        <AdcashBanner />

        {/* Interstitial on entry — capped at 1 per session via
            lib/ads/frequency. Reuses the same zone as the rest of
            the site. */}
        <AdcashInterstitial />

        <footer className="mt-12 text-center text-xs text-vanilla-dim">
          <p>
            You were taken here from the Movbox app. Return to the
            app to keep watching &mdash; this page will close
            automatically when you&rsquo;re done.
          </p>
        </footer>
      </main>
    </div>
  );
}
