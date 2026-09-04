/**
 * Server-only environment access.
 *
 * Every secret in the app is read through here and nowhere else, so there is a
 * single place to audit. The `window` guard means a stray import from a client
 * component fails loudly in development instead of quietly bundling a secret
 * key into JavaScript that anyone can read with View Source.
 */

function serverOnly() {
  if (typeof window !== "undefined") {
    throw new Error("lib/env.ts was imported in the browser — this leaks secrets.");
  }
}

/** Throws if missing. Use for values the feature genuinely cannot run without. */
function required(name: string): string {
  serverOnly();
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env.local (see .env.example).`
    );
  }
  return value;
}

/** Returns "" if missing. Use where the app should degrade, not crash. */
function optional(name: string): string {
  serverOnly();
  return process.env[name] ?? "";
}

export const env = {
  /* Sanity — write token, server only. Read access needs no token. */
  sanityWriteToken: () => required("SANITY_API_WRITE_TOKEN"),

  /* Paystack. The SECRET key must never appear in client code. The public
     key is safe in the browser and is the only one exposed. */
  paystackSecretKey: () => required("PAYSTACK_SECRET_KEY"),
  paystackPublicKey: () => optional("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),

  /* Shipbubble — proxied server-side so the key never reaches the browser. */
  shipbubbleApiKey: () => required("SHIPBUBBLE_API_KEY"),
  shipbubbleFromAddressCode: () => optional("SHIPBUBBLE_FROM_ADDRESS_CODE"),

  /* WhatsApp Cloud API — only needed for the automatic notification path.
     The wa.me fallback requires none of these. */
  whatsappToken: () => optional("WHATSAPP_ACCESS_TOKEN"),
  whatsappPhoneNumberId: () => optional("WHATSAPP_PHONE_NUMBER_ID"),
  whatsappRecipient: () => optional("WHATSAPP_RECIPIENT_NUMBER"),

  /** True only when the Cloud API is fully configured; otherwise use wa.me. */
  whatsappCloudEnabled: () =>
    Boolean(
      process.env.WHATSAPP_ACCESS_TOKEN &&
        process.env.WHATSAPP_PHONE_NUMBER_ID &&
        process.env.WHATSAPP_RECIPIENT_NUMBER
    ),

  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
