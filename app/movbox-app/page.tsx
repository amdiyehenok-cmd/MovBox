import type { Metadata } from "next";
import { Smartphone, Bell, Star, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Movbox App — Coming Soon",
  description: "The Movbox Android app is in development. Get notified when it launches.",
};

export default function MovboxAppPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/30 bg-brand/10">
          <Smartphone className="h-10 w-10 text-accent-bright" />
        </div>
        <h1 className="font-display text-4xl font-bold text-cream md:text-5xl">
          Movbox App
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-bright">
          <span className="h-2 w-2 rounded-full bg-accent-bright animate-pulse" />
          COMING SOON
        </div>
        <p className="mt-6 text-base text-text-secondary md:text-lg">
          We're building the most advanced movie and TV streaming Android app.
          Stream in 4K, download for offline viewing, and pick up where you
          left off across all your devices.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <Star className="mb-3 h-6 w-6 text-accent-bright" />
          <h3 className="font-display text-sm font-semibold text-cream">4K Ultra HD</h3>
          <p className="mt-1 text-xs text-text-muted">
            Crystal-clear streaming on any device, anywhere.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <Shield className="mb-3 h-6 w-6 text-accent-bright" />
          <h3 className="font-display text-sm font-semibold text-cream">Ad-Free</h3>
          <p className="mt-1 text-xs text-text-muted">
            Uninterrupted entertainment, no ads ever.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <Bell className="mb-3 h-6 w-6 text-accent-bright" />
          <h3 className="font-display text-sm font-semibold text-cream">Stay Notified</h3>
          <p className="mt-1 text-xs text-text-muted">
            Get a notification the moment it goes live.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-brand/10 via-surface/60 to-accent/5 p-8 text-center">
        <Bell className="mx-auto mb-3 h-8 w-8 text-accent-bright" />
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          The app is in development
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Want to be the first to know when it launches? Follow us for the
          official release announcement.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream shadow-glow transition-all hover:bg-brand/90"
        >
          Back to Movbox
        </a>
      </div>
    </div>
  );
}
