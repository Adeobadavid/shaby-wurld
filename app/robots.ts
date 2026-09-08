import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Served at /robots.txt.
 *
 * The API routes are disallowed not for secrecy — they already reject
 * unsigned and malformed requests — but because a crawler hitting
 * /api/shipping/rates burns Shipbubble quota for nothing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/order/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
