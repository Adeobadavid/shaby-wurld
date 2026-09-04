import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image as SanityImage } from "sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * Read client.
 *
 * The read token is optional and only ever present on the server (no
 * NEXT_PUBLIC_ prefix, so it is never bundled). It is what allows the site to
 * keep rendering if the dataset is switched from public to private — which is
 * what protects customer PII on order documents from being world-readable.
 *
 * With a public dataset it is simply unused.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token: typeof window === "undefined" ? readToken() : undefined,
});

/**
 * The dataset is private, so reads need a token.
 *
 * A dedicated Viewer token is strongly preferred: page rendering only ever
 * needs to read, and handing it write access widens the blast radius of any
 * future bug that can influence a query. The write token is accepted as a
 * fallback purely so the site does not go dark while that token is being
 * created — it warns loudly rather than failing silently.
 */
function readToken(): string | undefined {
  const read = process.env.SANITY_API_READ_TOKEN;
  if (read) return read;

  const write = process.env.SANITY_API_WRITE_TOKEN;
  if (write) {
    console.warn(
      "[sanity] SANITY_API_READ_TOKEN is not set — falling back to the write token. " +
        "Create a Viewer token and set SANITY_API_READ_TOKEN."
    );
    return write;
  }

  return undefined;
}

/**
 * Write client — SERVER ONLY.
 *
 * Guarded rather than merely documented: importing this into a client
 * component throws at build time instead of silently shipping a token that
 * can rewrite the whole dataset.
 */
export function getWriteClient() {
  if (typeof window !== "undefined") {
    throw new Error("getWriteClient() must never be called in the browser.");
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is not set — cannot write to Sanity.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    // Writes must never read through the CDN, or you can act on stale data.
    useCdn: false,
  });
}

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

/** Convenience: a plain URL string at a given width, or "" if unset. */
export function imageUrl(source: SanityImage | undefined | null, width = 800) {
  if (!source) return "";
  return urlFor(source).width(width).auto("format").url();
}
