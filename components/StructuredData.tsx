import type { Product, SiteSettings } from "@/sanity/queries";

/**
 * JSON-LD for Google.
 *
 * This is what turns a plain blue link into a result with a price, stock
 * state and star rating attached. Google reads it from the HTML; nothing is
 * rendered visually.
 *
 * Emitted as one @graph rather than several separate blocks so the entities
 * can reference each other — the store is tied to the organisation, and each
 * product to the store.
 */
export default function StructuredData({
  settings,
  products,
  siteUrl,
}: {
  settings: SiteSettings | null;
  products: Product[];
  siteUrl: string;
}) {
  const orgId = `${siteUrl}/#organization`;
  const siteId = `${siteUrl}/#website`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "Shaby Wurld",
      url: siteUrl,
      ...(settings?.seoImage ? { logo: settings.seoImage } : {}),
      ...(settings?.contactEmail ? { email: settings.contactEmail } : {}),
      ...(settings?.contactPhone ? { telephone: settings.contactPhone } : {}),
      // Google uses sameAs to connect the site to its social profiles, which
      // is what produces a knowledge panel over time.
      ...(settings?.socialLinks?.length
        ? { sameAs: settings.socialLinks.map((s) => s.url) }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: siteUrl,
      name: "Shaby Wurld",
      publisher: { "@id": orgId },
      ...(settings?.seoDescription ? { description: settings.seoDescription } : {}),
    },
  ];

  for (const p of products) {
    graph.push({
      "@type": "Product",
      "@id": `${siteUrl}/#product-${p.slug}`,
      name: p.name,
      description: p.shortDescription || p.description,
      category: p.category,
      brand: { "@id": orgId },
      ...(p.images?.length ? { image: p.images } : {}),
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "NGN",
        availability: p.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        // No product pages yet, so every offer points at the shop section.
        // Once products have their own routes this becomes that URL.
        url: `${siteUrl}/#shop`,
        seller: { "@id": orgId },
      },
    });
  }

  return (
    <script
      type="application/ld+json"
      // The content is built from our own CMS data, not user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
