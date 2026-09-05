import { groq } from "next-sanity";
import { client } from "./client";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type Shade = {
  name: string;
  color: string;
  enabled: boolean;
  /** Photo of the product in this shade. Absent until one is uploaded. */
  image?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  description: string;
  images: string[];
  shades: Shade[];
  inStock: boolean;
  featured: boolean;
};

export type Benefit = { title: string; description?: string; icon?: string };
export type SocialLink = { platform: string; url: string };

export type SiteSettings = {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage?: string;
  benefits: Benefit[];
  storyHeading?: string;
  storyBody?: string;
  storyImages: string[];
  contactPhone: string;
  contactEmail: string;
  contactAddress?: string;
  footerNote?: string;
  socialLinks: SocialLink[];
  orderWhatsappNumber: string;
  freeShippingThreshold: number;
  shippingNote?: string;
};

export type Review = {
  _id: string;
  name: string;
  text: string;
  rating: number;
  photo?: string;
};

/* ------------------------------------------------------------------ *
 * Queries
 *
 * Images are resolved to URLs inside GROQ (`asset->url`) so components
 * receive plain strings and don't each need the image-url builder.
 * `shades` is filtered to enabled ones here, so a disabled shade simply
 * never reaches the browser.
 * ------------------------------------------------------------------ */

const productFields = groq`
  _id,
  name,
  "slug": slug.current,
  category,
  price,
  compareAtPrice,
  shortDescription,
  description,
  "images": images[].asset->url,
  // Each shade can carry its own photo; the gallery slides to it when the
  // swatch is tapped. Null when no photo has been uploaded for that shade.
  "shades": shades[enabled == true]{
    name,
    color,
    enabled,
    "image": image.asset->url
  },
  "inStock": coalesce(inStock, true),
  "featured": coalesce(featured, false)
`;

export const productsQuery = groq`
  *[_type == "product"] | order(order asc, _createdAt desc) { ${productFields} }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true] | order(order asc, _createdAt desc) { ${productFields} }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    heroEyebrow,
    heroHeadline,
    heroSubtext,
    "heroImage": heroImage.asset->url,
    benefits[]{ title, description, "icon": icon.asset->url },
    storyHeading,
    storyBody,
    "storyImages": storyImages[].asset->url,
    contactPhone,
    contactEmail,
    contactAddress,
    footerNote,
    socialLinks[]{ platform, url },
    orderWhatsappNumber,
    "freeShippingThreshold": coalesce(freeShippingThreshold, 50000),
    shippingNote
  }
`;

export const reviewsQuery = groq`
  *[_type == "review" && published == true] | order(order asc, _createdAt desc) {
    _id, name, text, rating, "photo": photo.asset->url
  }
`;

/* ------------------------------------------------------------------ *
 * Fetchers
 *
 * `revalidate: 60` means edits in the Studio appear within a minute
 * without a redeploy, while still serving cached HTML to most visitors.
 * ------------------------------------------------------------------ */

const CACHE = { next: { revalidate: 60 } } as const;

export async function getProducts(): Promise<Product[]> {
  return client.fetch(productsQuery, {}, CACHE);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return client.fetch(featuredProductsQuery, {}, CACHE);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(siteSettingsQuery, {}, CACHE);
}

export async function getReviews(): Promise<Review[]> {
  return client.fetch(reviewsQuery, {}, CACHE);
}

export type ReceiptOrder = {
  orderNumber: string;
  status: string;
  items: { name: string; shade?: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  courier?: string;
  paidAt?: string;
};

/**
 * Order lookup for the receipt.
 *
 * Deliberately narrow: no email, phone or address. The confirmation page is
 * reachable by anyone holding a reference, so it returns only what a receipt
 * needs and nothing that would leak the customer's identity or location.
 */
export async function getOrderForReceipt(reference: string): Promise<ReceiptOrder | null> {
  if (!reference) return null;

  return client.fetch(
    groq`*[_type == "order" && paystackReference == $reference][0]{
      orderNumber,
      status,
      items[]{ name, shade, qty, unitPrice },
      subtotal,
      shippingCost,
      total,
      "courier": shippingCourier,
      paidAt
    }`,
    { reference },
    { cache: "no-store" }
  );
}

/** Server-side price lookup — the browser's claimed prices are never trusted. */
export async function getProductPrices(
  ids: string[]
): Promise<Record<string, { name: string; price: number; inStock: boolean }>> {
  if (ids.length === 0) return {};

  const rows: { _id: string; name: string; price: number; inStock: boolean }[] =
    await client.fetch(
      groq`*[_type == "product" && _id in $ids]{ _id, name, price, "inStock": coalesce(inStock, true) }`,
      { ids },
      // No caching: stock and price must be current at the moment of checkout.
      { cache: "no-store" }
    );

  return Object.fromEntries(
    rows.map((r) => [r._id, { name: r.name, price: r.price, inStock: r.inStock }])
  );
}
