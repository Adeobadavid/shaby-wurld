import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * The KV incremental cache is what makes ISR work — without it the homepage's
 * `revalidate = 60` has nowhere to store rendered output, so every request
 * re-renders and re-queries Sanity.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
