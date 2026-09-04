/**
 * Sanity connection values.
 *
 * Project ID and dataset are public by design — they appear in every query URL
 * the browser makes, so NEXT_PUBLIC_ is correct for them. The API token is NOT
 * here: it is read only inside server code (see lib/env.ts) so it can never be
 * bundled into the client.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "l1gq8pzc";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// Pinned rather than "latest": a floating API version means Sanity can change
// query behaviour under you on a deploy you didn't make.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
