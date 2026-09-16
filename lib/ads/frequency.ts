/**
 * Client-side ad frequency cap. Cheap, runs in localStorage, never
 * makes a network call.
 *
 * Rules (matches AD_FREQUENCY in adcash.ts):
 *  - One impression per slot per session (display, interstitial, etc.)
 *  - Hard total cap of 4 paid impressions per session, then silent.
 *  - A "session" is 30 min of inactivity on the same tab.
 *  - Closing the tab starts a new session.
 *  - Dismissals are sticky for the rest of the session (e.g. user
 *    clicks × on the video slider; it won't come back this session).
 */

import { AD_FREQUENCY, type AdSlotName, AD_SLOT } from "./adcash";

const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_KEY = "movbox:ad:session";
const IMPRESSIONS_KEY = "movbox:ad:impressions";
const DISMISSALS_KEY = "movbox:ad:dismissals";

interface SessionState {
  startedAt: number;
}

interface ImpressionLog {
  /** Timestamps (ms) for each impression, in this session. */
  list: number[];
  /** Per-slot count so shouldShowAd can check fast without scanning. */
  bySlot: Record<string, number>;
}

interface DismissalLog {
  /** slot-name → timestamp of dismissal. Stale on read. */
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
    writeJson(IMPRESSIONS_KEY, {
      list: [],
      bySlot: {},
    } as ImpressionLog);
    writeJson(DISMISSALS_KEY, { bySlot: {} } as DismissalLog);
    return fresh;
  }
  return current;
}

/** Total impressions in the current session. */
export function totalImpressions(): number {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [], bySlot: {} });
  const cutoff = Date.now() - SESSION_TTL_MS;
  return log.list.filter((t) => t > cutoff).length;
}

/** How many impressions this session for a given slot. */
export function impressionsForSlot(slot: AdSlotName): number {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [], bySlot: {} });
  return log.bySlot[slot] ?? 0;
}

/**
 * Should we show this slot? Returns false if the user already
 * dismissed this slot, hit its per-slot cap, or hit the total cap.
 */
export function shouldShowAd(slot: AdSlotName): boolean {
  if (totalImpressions() >= AD_FREQUENCY.hardCapPerSession) return false;
  const perSlotCap = AD_FREQUENCY[`${slot}MaxPerSession` as keyof typeof AD_FREQUENCY];
  if (typeof perSlotCap === "number") {
    if (impressionsForSlot(slot) >= perSlotCap) return false;
  }
  if (isDismissed(slot)) return false;
  return true;
}

/** Record an impression (called by the slot when the ad actually rendered). */
export function recordImpression(slot: AdSlotName): void {
  ensureSession();
  const log = readJson<ImpressionLog>(IMPRESSIONS_KEY, { list: [], bySlot: {} });
  log.list.push(Date.now());
  log.bySlot[slot] = (log.bySlot[slot] ?? 0) + 1;
  writeJson(IMPRESSIONS_KEY, log);
}

/** Mark a slot as dismissed. Sticky for the rest of the session. */
export function dismissSlot(slot: AdSlotName): void {
  ensureSession();
  const log = readJson<DismissalLog>(DISMISSALS_KEY, { bySlot: {} });
  log.bySlot[slot] = Date.now();
  writeJson(DISMISSALS_KEY, log);
}

export function isDismissed(slot: AdSlotName): boolean {
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

// Re-export for convenience so consumers don't need a second import.
export { AD_SLOT } from "./adcash";
