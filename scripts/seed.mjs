/**
 * Seed Sanity with the copy and products currently hardcoded in the site.
 *
 * Safe to re-run:
 *  - Products and reviews use deterministic ids (`seed-*`), so a second run
 *    updates those same documents instead of creating duplicates.
 *  - Site Settings uses setIfMissing, so anything already edited in the Studio
 *    is left alone — only blank fields get filled.
 *  - Images are looked up by filename before uploading, so re-running doesn't
 *    pile up duplicate assets.
 *
 * Run with: node scripts/seed.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

/* ---- env ---- */
const envText = fs.readFileSync(".env.local", "utf8");
const env = {};
envText.split(/\r?\n/).forEach((line) => {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

/* ---- image upload, cached by filename ---- */
const uploaded = new Map();

async function uploadImage(publicPath) {
  if (uploaded.has(publicPath)) return uploaded.get(publicPath);

  const filename = path.basename(publicPath);

  // Reuse an asset with this filename if one is already there.
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename }
  );

  if (existing) {
    uploaded.set(publicPath, existing);
    console.log(`  reused  ${filename}`);
    return existing;
  }

  const file = path.join("public", publicPath);
  if (!fs.existsSync(file)) {
    console.log(`  MISSING ${file} — skipping`);
    return null;
  }

  const asset = await client.assets.upload("image", fs.createReadStream(file), {
    filename,
  });
  uploaded.set(publicPath, asset._id);
  console.log(`  uploaded ${filename}`);
  return asset._id;
}

const imageRef = (id) =>
  id ? { _type: "image", asset: { _type: "reference", _ref: id } } : undefined;

/* ---- shades (from the QuickView palette) ---- */
const SHADES = [
  { name: "Cocoa", color: "#5c3a2e", enabled: true },
  { name: "Blush", color: "#d68073", enabled: true },
  { name: "Espresso", color: "#3d1f16", enabled: true },
  { name: "Noir", color: "#2b0e08", enabled: true },
  { name: "Ember", color: "#e2431e", enabled: true },
  // Left off deliberately, to show what the toggle does.
  { name: "Chestnut", color: "#6b4438", enabled: false },
];

const shadeArray = () =>
  SHADES.map((s, i) => ({ _type: "shade", _key: `shade-${i}`, ...s }));

/* ---- products (from BestSellers.tsx) ---- */
const PRODUCTS = [
  { n: 1, name: "Deep brown glossy shine matte lip gloss", category: "Lip Gloss", price: 5000, img: "/products/placeholder-1.webp", featured: true },
  { n: 2, name: "Rich chocolate shine lip gloss", category: "Lip Gloss", price: 5000, img: "/products/placeholder-3.webp", featured: true },
  { n: 3, name: "Natural tinted lip balm", category: "Lip Balm", price: 3500, img: "/products/placeholder-2.webp", featured: true },
  { n: 4, name: "Rose shimmer glaze lip gloss", category: "Lip Gloss", price: 5000, img: "/products/placeholder-1.webp" },
  { n: 5, name: "Copper glow lip gloss", category: "Lip Gloss", price: 5000, img: "/products/placeholder-3.webp" },
  { n: 6, name: "Berry tint hydrating lip balm", category: "Lip Balm", price: 3500, img: "/products/placeholder-2.webp" },
  { n: 7, name: "Deep brown glossy lip liner", category: "Lip Liner", price: 4200, img: "/products/placeholder-1.webp" },
  { n: 8, name: "Rose nude lip liner", category: "Lip Liner", price: 4200, img: "/products/placeholder-3.webp" },
  { n: 9, name: "Vanilla glow lip balm", category: "Lip Balm", price: 3500, img: "/products/placeholder-2.webp" },
];

const DESCRIPTION =
  "Rich pigments, glass-like shine, and shades designed to flatter deeper skin tones.";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---- reviews (from Reviews.tsx) ---- */
const REVIEWS = [
  { n: 1, name: "Tinuade", rating: 5, img: "/brand-story/photo-1.webp", text: "The lip combo is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish." },
  { n: 2, name: "Amara", rating: 5, img: "/brand-story/photo-2.webp", text: "First time trying a Nigerian lip brand and I'm obsessed. The gloss doesn't feel sticky and it actually lasts through lunch." },
  { n: 3, name: "Chiamaka", rating: 4, img: "/brand-story/photo-3.webp", text: "Shade range finally makes sense for deeper skin tones. The liner glides on smooth, no tugging at all." },
  { n: 4, name: "Feyisayo", rating: 5, img: "/products/placeholder-2.webp", text: "Delivery was fast and the packaging alone felt luxury. The lip balm has become a permanent bag item for me." },
];

/* ---- run ---- */
async function main() {
  console.log("Uploading images…");
  const heroId = await uploadImage("/hero/hero-photo.webp");
  const compositeId = await uploadImage("/brand-story/composite.webp");
  for (const p of PRODUCTS) await uploadImage(p.img);
  for (const r of REVIEWS) await uploadImage(r.img);

  /* Site Settings — fill blanks only, never overwrite existing edits. */
  console.log("\nSite Settings…");
  await client.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });

  await client
    .patch("siteSettings")
    .setIfMissing({
      heroEyebrow: "Beauty that\nfeels like you.",
      heroHeadline: "Naturally You.",
      heroSubtext: "Made for every\nskin tone.",
      ...(heroId ? { heroImage: imageRef(heroId) } : {}),
      benefits: [
        { _type: "benefit", _key: "b1", title: "Cruelty-Free" },
        { _type: "benefit", _key: "b2", title: "Vegan Friendly" },
        { _type: "benefit", _key: "b3", title: "Fast Shipping" },
        { _type: "benefit", _key: "b4", title: "Secure Checkout" },
      ],
      storyHeading: "Beauty made for you.",
      storyBody:
        "Shaby wurld is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish edge elegance soft meets fierce inclusive, expressive, and youthful — feels luxury but not intimidating",
      ...(compositeId ? { storyImages: [{ ...imageRef(compositeId), _key: "story1" }] } : {}),
      contactPhone: "+234 800 000 0000",
      contactEmail: "hello@shabywurld.com",
      footerNote: "Copyright @ 2026 Shaby Wurld",
      socialLinks: [
        { _type: "socialLink", _key: "s1", platform: "instagram", url: "https://instagram.com/shabywurld" },
        { _type: "socialLink", _key: "s2", platform: "whatsapp", url: "https://wa.me/2348000000000" },
      ],
      orderWhatsappNumber: "2348000000000",
      freeShippingThreshold: 50000,
      shippingNote:
        "Free shipping on orders over ₦50,000. Delivery fee confirmed at checkout.",
    })
    .commit();
  console.log("  filled blank fields (existing values untouched)");

  /* Products */
  console.log("\nProducts…");
  for (const p of PRODUCTS) {
    const assetId = uploaded.get(p.img);
    await client.createOrReplace({
      _id: `seed-product-${p.n}`,
      _type: "product",
      name: p.name,
      slug: { _type: "slug", current: slugify(p.name) },
      category: p.category,
      price: p.price,
      description: DESCRIPTION,
      images: assetId ? [{ ...imageRef(assetId), _key: "img1" }] : [],
      shades: shadeArray(),
      inStock: true,
      featured: p.featured === true,
      order: p.n,
    });
    console.log(`  ${p.name}`);
  }

  /* Reviews */
  console.log("\nReviews…");
  for (const r of REVIEWS) {
    const assetId = uploaded.get(r.img);
    await client.createOrReplace({
      _id: `seed-review-${r.n}`,
      _type: "review",
      name: r.name,
      text: r.text,
      rating: r.rating,
      ...(assetId ? { photo: imageRef(assetId) } : {}),
      published: true,
      order: r.n,
    });
    console.log(`  ${r.name} — ${"*".repeat(r.rating)}`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("\nSeed failed:", e.message);
  process.exit(1);
});
