/**
 * Custom next/image loader.
 *
 * WHY THIS EXISTS
 * Next's built-in optimizer (/_next/image) needs a Node runtime with sharp.
 * On Cloudflare Workers it is a pass-through: measured against this site it
 * returned byte-identical output to the source, so every image was being
 * downloaded at full resolution — a 2880x1800 hero shipped to a phone.
 *
 * Sanity's CDN already does resizing, format negotiation and global caching,
 * so pointing the loader straight at it removes the useless Worker hop and
 * actually resizes. Measured on the hero: 175.7 KB -> 74 KB at w=1600.
 *
 * Local files under /public are returned untouched: they are already small,
 * and there is nothing in front of them to transform.
 */

const SANITY_CDN = "https://cdn.sanity.io/";

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function sanityImageLoader({ src, width, quality }: LoaderArgs): string {
  // Anything not on the Sanity CDN (public/, data URIs, blobs) passes through.
  if (!src.startsWith(SANITY_CDN)) return src;

  const url = new URL(src);

  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 80));

  // Negotiates avif/webp from the browser's Accept header rather than
  // hardcoding one, so newer browsers get the smaller format automatically.
  url.searchParams.set("auto", "format");

  // Never upscale past the source, and keep the aspect ratio — cropping is
  // decided by object-fit in the component, not here.
  url.searchParams.set("fit", "max");

  return url.toString();
}
