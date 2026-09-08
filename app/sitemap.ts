import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Served at /sitemap.xml.
 *
 * Only the homepage and its in-page sections are listed, because those are
 * the only real URLs the site has — every product opens in a modal over the
 * same page rather than at its own address. Listing product URLs that do not
 * resolve would earn crawl errors, not rankings.
 *
 * Giving products their own pages is the single biggest SEO change available
 * here; the slugs already exist in Sanity, so this file becomes a map over
 * them the moment those routes do.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/#shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
