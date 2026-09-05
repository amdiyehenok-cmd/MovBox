/**
 * Client-side ad frequency cap. Cheap, runs in localStorage, never
 * makes a network call. Server-side mirroring lives in
 * `lib/ads/server-frequency.ts` (uses Supabase ad_impressions for
 * signed-in users).
 *
 * Rules:
 *  - Each slot has its own per-session cap (configured in
 *    `adsterra.ts` → AD_FREQUENCY).
 *  - There's a hard total cap across all slots. After 3 ad
 *    impressions in a session we stop showing ads entirely.
 *  - A "session" is 30 min of inactivity on the same tab. Closing
 *    the tab starts a new session.
 *  - The user can dismiss the social bar; that dismissal is sticky
 *    for the rest of the session.
 */

import { AD_FREQUENCY } from "./adsterra";

const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_KEY = "movbox:ad:session";
const IMPRESSIONS_KEY = "movbox:ad:impressions";
const DISMISSALS_KEY = "movbox:ad:dismissals";

interface SessionState {
  startedAt: number;
}

interface ImpressionLog {
  // Array of timestamps (ms) for each impression, in this session.
  // Stale ones (older than SESSION_TTL_MS) are filtered on read.
  list: number[];
}

interface DismissalLog {
  // Map of slot-name → timestamp of dismissal. Stale on read.
  bySlot: Record<string, number>;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / disabled — silently skip */
  }
}

function ensureSession(): SessionState {
  const now = Date.now();
  const current = readJson<SessionState | null>(SESSION_KEY, null);
  if (!current || now - current.startedAt > SESSION_TTL_MS) {
    const fresh: SessionState = { startedAt: now };
    writeJson(SESSION_KEY, fresh);
    writeJson(IMPRESSIONS_KEY, { list: [] } as ImpressionLog);
    writeJson(DISMISSALS_KEY, { bySlot: {} } as DismissalLog);
    return fresh;
  }
  return current;
}

/** How many impressions in the current session for a given slot. */
export function impressionsForSlot(slot: string): number {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [] });
  const cutoff = Date.now() - SESSION_TTL_MS;
  const fresh = log.list.filter((t) => t > cutoff);
  return fresh.length;
}

/** Total impressions across all slots in this session. */
export function totalImpressions(): number {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [] });
  const cutoff = Date.now() - SESSION_TTL_MS;
  return log.list.filter((t) => t > cutoff).length;
}

/**
 * Should we show this slot? Returns false if the user already
 * dismissed this slot, hit its per-slot cap, or hit the total cap.
 */
export function shouldShowAd(slot: keyof typeof AD_FREQUENCY): boolean {
  // Total cap (across all slots)
  if (totalImpressions() >= AD_FREQUENCY.hardCapPerSession) return false;
  // Per-slot cap (only for the slots that have a per-slot cap)
  const slotCap = AD_FREQUENCY[slot];
  if (typeof slotCap === "number") {
    if (impressionsForSlot(slot as string) >= slotCap) return false;
  }
  // Dismissal
  if (isDismissed(slot as string)) return false;
  return true;
}

/** Record an impression (called by the AdSlot when its ad actually rendered). */
export function recordImpression(slot: string): void {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [] });
  log.list.push(Date.now());
  writeJson(IMPRESSIONS_KEY, log);
}

/** Mark a slot as dismissed. Sticky for the rest of the session. */
export function dismissSlot(slot: string): void {
  ensureSession();
  const log = readJson<DismissalLog>(DISMISSALS_KEY, { bySlot: {} });
  log.bySlot[slot] = Date.now();
  writeJson(DISMISSALS_KEY, log);
}

export function isDismissed(slot: string): boolean {
  ensureSession();
  const log = readJson<DismissalLog>(DISMISSALS_KEY, { bySlot: {} });
  const t = log.bySlot[slot];
  return !!t && Date.now() - t < SESSION_TTL_MS;
}

/** For testing: clear all ad state. */
export function _resetAdState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(IMPRESSIONS_KEY);
    window.localStorage.removeItem(DISMISSALS_KEY);
  } catch {
    /* noop */
  }
}
