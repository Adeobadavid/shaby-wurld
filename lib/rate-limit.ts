/**
 * Rate limiting.
 *
 * Two backends, chosen at runtime:
 *
 *  - Cloudflare KV when the RATE_LIMIT_KV binding is present (production).
 *  - An in-process Map otherwise (local `next dev`, or any Node host).
 *
 * The KV path exists because Workers isolates do NOT share memory and are
 * short-lived: an in-memory limiter there would start from zero on almost
 * every request and effectively count nothing. That is a limiter that looks
 * present in code review and protects nothing in production, which is worse
 * than having none — so the backend follows the platform.
 *
 * KV is eventually consistent, so a determined attacker hitting many edge
 * locations at once can exceed the limit briefly. That is an acceptable
 * trade for abuse-throttling; it is not, and must not be used as, an
 * authorisation control.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Options = { limit: number; windowMs: number };

/* ------------------------------------------------------------------ *
 * In-memory backend (dev / Node hosts)
 * ------------------------------------------------------------------ */

const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

function memoryLimit(key: string, { limit, windowMs }: Options): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (buckets.size > MAX_KEYS) buckets.clear();

  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/* ------------------------------------------------------------------ *
 * Cloudflare KV backend (production)
 * ------------------------------------------------------------------ */

type KVNamespace = {
  get(key: string, type: "json"): Promise<number[] | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

async function getKV(): Promise<KVNamespace | null> {
  try {
    // Only resolves inside a Workers runtime; harmless elsewhere.
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as Record<string, unknown> | undefined)?.RATE_LIMIT_KV as
      | KVNamespace
      | null ?? null;
  } catch {
    return null;
  }
}

async function kvLimit(
  kv: KVNamespace,
  key: string,
  { limit, windowMs }: Options
): Promise<RateLimitResult> {
  const now = Date.now();
  const cutoff = now - windowMs;

  const stored = (await kv.get(key, "json")) ?? [];
  const hits = stored.filter((t) => t > cutoff);

  if (hits.length >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)),
    };
  }

  hits.push(now);

  // TTL lets KV expire the key on its own, so nothing accumulates forever.
  await kv.put(key, JSON.stringify(hits), {
    expirationTtl: Math.max(60, Math.ceil(windowMs / 1000)),
  });

  return { ok: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export async function rateLimit(key: string, options: Options): Promise<RateLimitResult> {
  const kv = await getKV();
  if (!kv) return memoryLimit(key, options);

  try {
    return await kvLimit(kv, key, options);
  } catch (error) {
    // A KV outage must not take checkout down with it.
    console.error("[rate-limit] KV failed, falling back to memory", error);
    return memoryLimit(key, options);
  }
}

/**
 * Best-effort client IP.
 *
 * On Cloudflare, CF-Connecting-IP is set by the edge and cannot be spoofed by
 * the client, so it is preferred. x-forwarded-for is a fallback and is only
 * trustworthy behind a proxy that sets it. Either way this is a throttling
 * hint, never identity or authorisation.
 */
export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
}
