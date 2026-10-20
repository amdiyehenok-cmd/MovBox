import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// NOTE: defineCloudflareConfig only accepts top-level keys such as
// incrementalCache / queue / tagCache. Unknown keys (like a nested
// `cache: { incremental: { r2 } }`) are silently ignored and everything
// falls back to "dummy" (no caching at all).
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache, // ISR pages stored in R2 (NEXT_INC_CACHE_R2_BUCKET)
  queue: memoryQueue, // time-based revalidation via WORKER_SELF_REFERENCE
});
