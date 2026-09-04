import { NextRequest, NextResponse } from "next/server";
import { getBoxmoviesStream } from "@/lib/boxmovies";
import type { BoxSource, BoxSourceGroup } from "@/lib/types";

/**
 * GET /api/sources?detailPath=...&season=N&episode=N
 *
 * The Next.js app does NOT proxy video/subtitle bytes itself anymore.
 * Everything goes through the thin relay (the same relay the Android
 * app uses):
 *
 *   - source list + captions  →  thin relay /stream
 *   - MP4 bytes               →  thin relay /mp4?url=...
 *   - subtitle bytes          →  thin relay /subtitle?url=...
 *
 * The relay injects the upstream Bearer auth and the right Referer/
 * Origin headers so the browser can play videos and render subtitles
 * directly (same-origin to the relay, CORS-allowed).
 *
 * The shape returned here is unchanged from the old boxmovies-api
 * shape so the player code doesn't need to know which backend is in
 * use.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIMEOUT_MS = 25_000;

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, rej) => {
        t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (t) clearTimeout(t);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const detailPath = searchParams.get("detailPath");
  const season = Number(searchParams.get("season") ?? 0);
  const episode = Number(searchParams.get("episode") ?? 0);
  const subjectId = searchParams.get("subjectId") ?? "";

  if (!detailPath) {
    return NextResponse.json(
      { error: "Missing detailPath" },
      { status: 400 }
    );
  }

  try {
    const data = await withTimeout(
      getBoxmoviesStream(detailPath, season, episode, subjectId),
      TIMEOUT_MS,
      `stream ${detailPath}`
    );

    // Route every subtitle URL through /api/subtitle-proxy. The thin
    // relay returns the SRT bytes with `application/x-subrip` MIME
    // type, but the browser's <track> element only recognizes
    // `text/vtt` (WebVTT). This Next.js route fetches the bytes from
    // the thin relay and converts SRT→VTT on the way out, so every
    // browser renders the cues.
    const toPlayerSubtitleUrl = (upstreamOrRelayUrl: string) => {
      if (!upstreamOrRelayUrl) return upstreamOrRelayUrl;
      // Already a Next.js proxy URL — leave it.
      if (upstreamOrRelayUrl.startsWith("/api/subtitle-proxy")) {
        return upstreamOrRelayUrl;
      }
      return `/api/subtitle-proxy?url=${encodeURIComponent(upstreamOrRelayUrl)}`;
    };

    // The thin relay already returns MP4 URLs proxied through its own
    // /mp4 endpoint. Pass them through unchanged. (Subtitles get
    // re-routed above so the player gets WebVTT.)
    const sources: BoxSource[] = data.sources.map((s) => ({
      id: s.id,
      url: s.url,
      type: "mp4" as const,
      quality: s.quality,
      resolution: s.resolution,
      sizeBytes: s.sizeBytes,
      durationSeconds: s.durationSeconds,
      format: s.format,
      codec: s.codec,
      vipLocked: s.vipLocked,
      subtitles: data.captions.map((c) => ({
        id: c.id,
        url: toPlayerSubtitleUrl(c.url),
        languageCode: c.languageCode,
        language: c.language,
        delay: c.delay,
        sizeBytes: c.sizeBytes,
      })),
      provider: { id: "boxmovies" as const, name: "BoxMovies" },
    }));

    // Player-friendly subtitle tracks list (mirrors the old boxmovies-api
    // shape so the existing subtitle picker in the player UI keeps working).
    const subtitleTracks = data.captions.map((c) => ({
      id: c.id,
      url: toPlayerSubtitleUrl(c.url),
      language: c.languageCode,
      label: c.language,
    }));

    const payload: BoxSourceGroup & {
      ok: boolean;
      provider: { id: string; name: string };
      subtitleTracks: { id: string; url: string; language: string; label: string }[];
    } = {
      ok: true,
      detailPath,
      season,
      episode,
      subjectId: data.subjectId,
      hasResource: !!data.hasResource,
      isLimited: !!data.isLimited,
      vipLocked: !!data.vipLocked,
      freeStreamsRemaining: data.freeStreamsRemaining,
      sources,
      captions: data.captions,
      subtitleTracks,
      count: sources.length,
      provider: { id: "boxmovies", name: "BoxMovies" },
    };

    return NextResponse.json(payload, {
      headers: {
        // Boxmovies stream URLs are proxied through the thin relay and
        // that proxy is essentially a passthrough — short cache.
        "Cache-Control": "public, max-age=60, s-maxage=120",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn(`[api/sources] ${detailPath} failed: ${message}`);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        detailPath,
        season,
        episode,
        sources: [],
        captions: [],
        subtitleTracks: [],
        count: 0,
        provider: { id: "boxmovies", name: "BoxMovies" },
      },
      { status: 504 }
    );
  }
}
