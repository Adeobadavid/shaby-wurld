// `node:` prefix is required on Cloudflare Workers — a bare "crypto" import
// resolves to nothing under nodejs_compat and the module fails to load.
import crypto from "node:crypto";

import { env } from "./env";

/**
 * Webhook signature verification, kept in its own module.
 *
 * This is the only code that needs node:crypto. Pages that merely verify a
 * transaction (which is a plain fetch) must not import it — bundling a Node
 * built-in into a React Server Component broke the confirmation page with
 * "Cannot read properties of undefined (reading 'call')".
 *
 * `rawBody` must be the exact bytes Paystack sent. Any JSON.parse and
 * re-stringify changes them and the HMAC will never match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha512", env.paystackSecretKey())
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");

  // Compared in constant time so the check can't be probed byte by byte.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
