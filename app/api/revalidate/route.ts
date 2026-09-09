import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/revalidate
 *
 * Called by a Sanity webhook whenever a document is published, so Studio edits
 * appear on the site straight away.
 *
 * This exists because of KV economics, not speed for its own sake. Cached
 * fetches used a 60-second revalidate, and each revalidation is a Cloudflare
 * KV write against a free tier of 1,000 writes a day — one cached fetch could
 * spend the entire quota by itself. The interval is now an hour, and this
 * route covers the gap: content is fresh because publishing pushes, not
 * because the site polls.
 *
 * Authenticated with an HMAC over the raw body, the same pattern as the
 * Paystack webhook. An unauthenticated purge endpoint is a free way for
 * anyone to force the origin to refetch everything on demand.
 */
export async function POST(request: Request) {
  const secret = env.sanityWebhookSecret();

  if (!secret) {
    console.error("[revalidate] SANITY_WEBHOOK_SECRET is not set; refusing");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Raw text, not json() — parsing changes the bytes and breaks the HMAC.
  const raw = await request.text();
  const signatureHeader = request.headers.get("sanity-webhook-signature") ?? "";

  if (!isValidSignature(raw, signatureHeader, secret)) {
    console.warn("[revalidate] bad signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Everything the site reads shares one tag, so a publish of any kind
  // refreshes the lot. The catalogue is small; finer granularity would be
  // more moving parts for no practical gain.
  revalidateTag("sanity");
  revalidatePath("/", "layout");

  let type = "unknown";
  try {
    type = JSON.parse(raw)?._type ?? "unknown";
  } catch {
    // The purge already happened; a malformed body only costs us the log line.
  }

  console.info("[revalidate] purged after publish:", type);
  return NextResponse.json({ revalidated: true, type });
}

/**
 * Sanity signs as `t=<timestamp>,v1=<base64url hmac of "timestamp.body">`.
 *
 * The timestamp is checked as well as the digest: without it a captured
 * request stays valid forever and can be replayed to force refetches.
 */
function isValidSignature(body: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.trim().split("=");
      return [k, rest.join("=")];
    })
  );

  const timestamp = Number(parts.t);
  const provided = parts.v1;
  if (!Number.isFinite(timestamp) || !provided) return false;

  // Five minutes either way, allowing for clock drift.
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("base64url");

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  // Length check first: timingSafeEqual throws on a mismatch.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
