/**
 * In-memory rate limiter.
 *
 * Deliberately simple: a Map of IP -> timestamps, pruned as it goes. That is
 * enough to stop someone hammering the Shipbubble proxy or spraying checkout
 * attempts from one machine, which is the realistic threat for a storefront
 * this size.
 *
 * Its limit is worth stating plainly: state lives in one process, so it does
 * not hold across multiple instances or serverless cold starts. If the site
 * scales to several instances, swap the Map for Upstash Redis — the function
 * signature here is designed so only this file changes.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

// Stop the Map growing without bound on a long-running server.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (buckets.size > MAX_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  // Drop anything outside the window, then judge what's left.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP.
 *
 * x-forwarded-for is spoofable in general, but behind a host that sets it
 * (Vercel, Netlify, Cloudflare) the leftmost entry is the real client. Treated
 * as a throttling hint, never as identity or authorisation.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
