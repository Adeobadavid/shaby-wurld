/**
 * One-off import of the real Shaby Wurld catalogue from shabyproduct.xlsx.
 *
 * Copy is written fresh in the brand's own voice (from Site Settings: bold,
 * inclusive, "luxury but not intimidating") rather than lifted from other
 * brands' product pages — that would be someone else's copyright sitting on
 * your storefront.
 *
 * Images are deliberately NOT set: they get added by hand in the Studio.
 * The site falls back to a placeholder tile until then.
 */
import fs from "fs";
import { createClient } from "@sanity/client";

const PROJECT = "C:/Users/tm mobile/Downloads/shaby-wurlld/shaby-wurld";

const env = {};
fs.readFileSync(`${PROJECT}/.env.local`, "utf8")
  .split(/\r?\n/)
  .forEach((l) => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  });

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Liner shade hex values are ESTIMATES. The sheet gives supplier shade
 * numbers (#13, #10, ...) with no colour, so these are plausible stand-ins
 * chosen to sit in the right family. They must be corrected against the real
 * shade photos before launch — the numbers are preserved as the shade names
 * so they stay matchable.
 */
const products = [
  // ---- Lip Gloss ----
  {
    id: "product-rodo",
    name: "Rodo",
    category: "Lip Gloss",
    shortDescription: "A juicy strawberry red with a glass-clear finish.",
    description:
      "A true strawberry red that reads bright and clean on every skin tone. Cushioned, non-sticky shine that layers over liner or wears on its own — Rodo is the one you reach for when you intend to be seen.",
    featured: true,
    order: 1,
  },
  {
    id: "product-africa-beauty",
    name: "Africa Beauty",
    category: "Lip Gloss",
    shortDescription: "Deep chocolate brown with a rich, glossy finish.",
    description:
      "A warm chocolate brown built to flatter deeper complexions rather than mute them. Full pigment, glass-like shine and a weightless feel that stays comfortable from morning through to last call.",
    featured: true,
    order: 2,
  },
  {
    id: "product-no-filter",
    name: "No Filter",
    category: "Lip Gloss",
    shortDescription: "Clear high-shine gloss that goes over everything.",
    description:
      "The finishing step. A crystal-clear, non-sticky gloss that lifts any lipstick or liner into full shine — or wears alone for lips that look like your best day, unedited.",
    featured: true,
    order: 3,
  },
  {
    id: "product-belle-queen",
    name: "Belle Queen",
    category: "Lip Gloss",
    shortDescription: "A soft nude that flatters every undertone.",
    description:
      "Our everyday nude, mixed warm so it reads natural on deep and medium skin instead of washing it out. Sheer-to-buildable colour with a soft glossy finish that makes it effortless to wear.",
    featured: true,
    order: 4,
  },
  {
    id: "product-main-character",
    name: "Main Character",
    category: "Lip Gloss",
    shortDescription: "A confident pink with a mirror-like shine.",
    description:
      "Bright, unapologetic pink with enough pigment to stand on its own. Smooth, cushioned and non-sticky — the shade for days you have no intention of blending into the background.",
    featured: true,
    order: 5,
  },
  {
    id: "product-shade-shift",
    name: "Shade Shift",
    category: "Lip Gloss",
    shortDescription: "Colour-changing gloss that becomes your own pink.",
    description:
      "Goes on as a soft pink and shifts with your natural pH, so the finished colour is unique to you. One tube, no two people alike — glossy, hydrating and quietly clever.",
    featured: true,
    order: 6,
  },

  // ---- Lip Liner ----
  {
    id: "product-twist-up-liner-deep",
    name: "Twist Up Lip Liner — Deep",
    category: "Lip Liner",
    shortDescription: "Retractable liner in three deep, true-to-skin shades.",
    description:
      "A creamy twist-up liner that glides without dragging and holds a crisp line all day. This set of deeper shades is made to define, reshape and outlast — no sharpener, no fuss.",
    featured: false,
    order: 7,
    shades: [
      { name: "#03", color: "#3f231c" },
      { name: "#10", color: "#6d3b2c" },
      { name: "#13", color: "#57262b" },
    ],
  },
  {
    id: "product-twist-up-liner-classic",
    name: "Twist Up Lip Liner — Classic",
    category: "Lip Liner",
    shortDescription: "Retractable liner in three everyday, wearable shades.",
    description:
      "The everyday liner. Creamy enough to glide, firm enough to keep a clean edge, and retractable so it is always ready. Wear it alone for a soft matte lip, or under gloss to make the colour last.",
    featured: false,
    order: 8,
    shades: [
      { name: "#06", color: "#a06a56" },
      { name: "#07", color: "#8f4f45" },
      { name: "#14", color: "#b56a58" },
    ],
  },

  // ---- Lip Balm ----
  {
    id: "product-lip-balm-cocoa",
    name: "Tinted Lip Balm — Cocoa",
    category: "Lip Balm",
    shortDescription: "A tinted balm that conditions as it warms your lips.",
    description:
      "Deep conditioning care with a sheer wash of warm brown. Softens dry lips on contact and leaves a natural, healthy-looking tint — the balm you will actually want to be seen wearing.",
    featured: false,
    order: 9,
  },
  {
    id: "product-lip-balm-clear",
    name: "Nourishing Lip Balm — Clear",
    category: "Lip Balm",
    shortDescription: "Clear balm that repairs and softens overnight.",
    description:
      "An untinted, deeply nourishing balm for dry, tired lips. Melts in clean, sits happily under any gloss or liner, and works just as well as an overnight treatment.",
    featured: false,
    order: 10,
  },

  // ---- Lip Scrub ----
  {
    id: "product-sugar-lip-scrub",
    name: "Sugar Lip Scrub",
    category: "Lip Scrub",
    shortDescription: "A gentle sugar scrub for soft, colour-ready lips.",
    description:
      "Buffs away flakes so colour goes on smooth and even. A fine sugar base melts as you work it in, leaving lips soft, conditioned and ready for gloss.",
    featured: false,
    order: 11,
  },
];

const dryRun = process.argv.includes("--dry-run");

/* ---- 1. remove the placeholder seed products I created earlier ---- */
const seeds = await client.fetch(`*[_type == "product" && _id match "seed-product-*"]._id`);
console.log(`Placeholder seed products found: ${seeds.length}`);

/* ---- 2. write the real catalogue ---- */
console.log(`\nImporting ${products.length} products:\n`);

for (const p of products) {
  const doc = {
    _id: p.id,
    _type: "product",
    name: p.name,
    slug: { _type: "slug", current: slugify(p.name) },
    category: p.category,
    price: 5000,
    shortDescription: p.shortDescription,
    description: p.description,
    // images intentionally omitted — added by hand in the Studio
    images: [],
    shades: (p.shades ?? []).map((s, i) => ({
      _type: "shade",
      _key: `shade-${i}`,
      name: s.name,
      color: s.color,
      enabled: true,
    })),
    inStock: true,
    stockQty: 20,
    featured: p.featured,
    order: p.order,
  };

  const shadeNote = doc.shades.length ? ` — ${doc.shades.length} shades` : "";
  console.log(`  ${p.category.padEnd(10)} ${p.name}${shadeNote}`);

  if (!dryRun) await client.createOrReplace(doc);
}

if (!dryRun && seeds.length) {
  await client.delete({ query: `*[_type == "product" && _id match "seed-product-*"]` });
  console.log(`\nRemoved ${seeds.length} placeholder seed products.`);
}

console.log(dryRun ? "\nDry run — nothing written." : "\nDone.");
