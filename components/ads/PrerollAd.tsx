"use client";

import { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { ADCASH } from "@/lib/ads/adcash";

/**
 * In-stream video pre-roll via Adcash VAST.
 *
 * Flow:
 *   1. Parent (Player) shows this overlay when the user hits play.
 *   2. We fetch the VAST XML from the Adcash tag URL.
 *   3. We parse out the first <MediaFile> URL that our browser
 *      supports (mp4/webm).
 *   4. We play the ad full-bleed on top of the player.
 *   5. When the ad ends (or the user skips after 5s), we call
 *      onComplete and the parent starts the real content.
 *
 * Frequency cap: at most 1 pre-roll per session. Stored in
 * localStorage under "movbox:ad:preroll:done" (timestamp).
 */

const SESSION_TTL_MS = 30 * 60 * 1000;
const SKIP_AFTER_S = 5;

interface PrerollAdProps {
  /** Called when the ad finishes or is skipped. */
  onComplete: () => void;
}

interface VastMediaFile {
  url: string;
  type: string;
}

function canPlayType(type: string): boolean {
  if (typeof document === "undefined") return false;
  const v = document.createElement("video");
  return v.canPlayType(type) !== "";
}

function pickPlayableMedia(files: VastMediaFile[]): string | null {
  // Prefer mp4 (universally supported), then webm.
  const sorted = [...files].sort((a, b) => {
    const aMp4 = a.type.includes("mp4") ? 0 : 1;
    const bMp4 = b.type.includes("mp4") ? 0 : 1;
    return aMp4 - bMp4;
  });
  for (const f of sorted) {
    if (canPlayType(f.type)) return f.url;
  }
  return null;
}

function parseVast(xmlText: string): VastMediaFile[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  const files: VastMediaFile[] = [];
  doc.querySelectorAll("MediaFile").forEach((node) => {
    const url = node.textContent?.trim() ?? "";
    const type = node.getAttribute("type") ?? "video/mp4";
    if (url) files.push({ url, type });
  });
  // Also try the CDATA-wrapped inner <MediaFile> children
  if (files.length === 0) {
    doc.querySelectorAll("MediaFiles > MediaFile").forEach((node) => {
      const url = node.textContent?.trim() ?? "";
      const type = node.getAttribute("type") ?? "video/mp4";
      if (url) files.push({ url, type });
    });
  }
  return files;
}

function wasShownRecently(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("movbox:ad:preroll:done");
    if (!raw) return false;
    const t = Number(raw);
    return Number.isFinite(t) && Date.now() - t < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

function markShown(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("movbox:ad:preroll:done", String(Date.now()));
  } catch {
    /* noop */
  }
}

export function PrerollAd({ onComplete }: PrerollAdProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "loading" | "playing" | "skipped" | "ended" | "error"
  >("loading");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch + parse the VAST tag, then start the ad.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // If we've already shown a pre-roll in this session, skip
        // immediately and let the real content play.
        if (wasShownRecently()) {
          onComplete();
          return;
        }
        const res = await fetch(ADCASH.inStreamVastUrl, {
          credentials: "omit",
        });
        if (!res.ok) throw new Error(`VAST fetch ${res.status}`);
        const xml = await res.text();
        if (cancelled) return;
        const files = parseVast(xml);
        const url = pickPlayableMedia(files);
        if (!url) throw new Error("No playable media in VAST");
        // Attach the URL to the video element via state.
        setStatus("playing");
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.muted = true;
            videoRef.current
              .play()
              .catch((e) => console.warn("[preroll] autoplay failed", e));
          }
        });
        markShown();
      } catch (e) {
        if (cancelled) return;
        console.warn("[preroll] failed:", e);
        setErrorMsg(e instanceof Error ? e.message : "Ad failed");
        setStatus("error");
        // Don't block the user — let the real content play.
        setTimeout(() => onComplete(), 1500);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  // Tick the elapsed counter so the skip button enables at SKIP_AFTER_S.
  useEffect(() => {
    if (status !== "playing") return;
    const start = Date.now();
    const t = setInterval(() => {
      const e = (Date.now() - start) / 1000;
      setElapsed(e);
      if (e >= SKIP_AFTER_S) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, [status]);

  function handleSkip() {
    if (elapsed < SKIP_AFTER_S) return;
    setStatus("skipped");
    onComplete();
  }

  function handleEnded() {
    setStatus("ended");
    onComplete();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black"
      role="region"
      aria-label="Advertisement"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        onEnded={handleEnded}
        onError={() => {
          setStatus("error");
          setErrorMsg("Video failed");
          setTimeout(() => onComplete(), 1500);
        }}
        className="h-full w-full bg-black object-contain"
      />

      {/* Top bar: ad label + skip button */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
          Ad · Sponsored
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition-colors hover:bg-black/90"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={elapsed < SKIP_AFTER_S}
            aria-label={
              elapsed < SKIP_AFTER_S
                ? `Skip in ${Math.ceil(SKIP_AFTER_S - elapsed)}s`
                : "Skip advertisement"
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {elapsed < SKIP_AFTER_S
              ? `Skip in ${Math.ceil(SKIP_AFTER_S - elapsed)}s`
              : "Skip Ad"}
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom: small loading hint if the ad is still buffering */}
      {(status === "loading" || status === "error") && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center p-3 sm:p-4">
          <div className="inline-flex items-center gap-2 rounded-md bg-black/70 px-3 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur">
            {status === "error"
              ? `Ad unavailable — playing next in a sec${errorMsg ? ` (${errorMsg})` : ""}`
              : "Loading ad…"}
          </div>
        </div>
      )}
    </div>
  );
}
