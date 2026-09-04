import crypto from "crypto";
import { env } from "./env";

/**
 * Paystack.
 *
 * Two things here matter more than the rest:
 *
 * 1. Amounts are in KOBO. Paystack takes the smallest currency unit, so ₦5,000
 *    is 500000. Getting this wrong charges 100x too little or too much.
 * 2. The webhook signature must be verified against the RAW request body. Any
 *    JSON.parse/re-stringify round trip changes the bytes and the HMAC will
 *    never match.
 */

const BASE = "https://api.paystack.co";

export const toKobo = (naira: number) => Math.round(naira * 100);
export const fromKobo = (kobo: number) => Math.round(kobo / 100);

export type InitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(input: {
  email: string;
  amountNaira: number;
  reference: string;
  metadata: Record<string, unknown>;
}): Promise<InitializeResult> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: toKobo(input.amountNaira),
      reference: input.reference,
      currency: "NGN",
      metadata: input.metadata,
      callback_url: `${env.siteUrl()}/order/confirmation?ref=${input.reference}`,
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.status) {
    console.error("[paystack] initialize failed", res.status, json);
    throw new Error("Could not start payment");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

/**
 * Confirm with Paystack directly that a reference was really paid.
 *
 * Never trust the browser's word that payment succeeded — a redirect back to
 * the success page proves nothing. This, and the webhook, are the only two
 * sources of truth.
 */
export async function verifyTransaction(reference: string): Promise<{
  paid: boolean;
  amountNaira: number;
  paidAt: string | null;
}> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.paystackSecretKey()}` },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.status) {
    console.error("[paystack] verify failed", res.status, json);
    return { paid: false, amountNaira: 0, paidAt: null };
  }

  return {
    paid: json.data.status === "success",
    amountNaira: fromKobo(json.data.amount),
    paidAt: json.data.paid_at ?? null,
  };
}

/**
 * Verify a webhook signature.
 *
 * `rawBody` must be the exact bytes Paystack sent. Compared with
 * timingSafeEqual so the check can't be probed byte by byte via response
 * timing.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha512", env.paystackSecretKey())
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
