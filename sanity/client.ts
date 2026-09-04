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
  token: typeof window === "undefined" ? process.env.SANITY_API_READ_TOKEN : undefined,
});

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
