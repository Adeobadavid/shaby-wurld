/**
 * Uploads product photos to Sanity and attaches them to their products.
 *
 *   node scripts/upload-product-images.mjs "<folder>" [--dry-run]
 *
 * Filenames drive the mapping: everything before the trailing -N is matched
 * against the product slug, and -N sets the order (so -1 becomes the card
 * photo). A file whose stem matches "<slug>-<shadeName>" is attached to that
 * shade instead of the main gallery.
 *
 * Re-running replaces a product's images rather than appending, so fixing a
 * photo is just a matter of dropping in a new file and running it again.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

const env = {};
for (const f of [".env.local", ".dev.vars"]) {
  try {
    fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    });
  } catch {}
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const folder = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!folder || !fs.existsSync(folder)) {
  console.log("Usage: node scripts/upload-product-images.mjs \"<folder>\" [--dry-run]");
  process.exit(1);
}

const products = await client.fetch(
  `*[_type == "product"]{ _id, name, category, "slug": slug.current, featured }`
);

const files = fs
  .readdirSync(folder)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

/** "africa-beauty-1.png" -> { stem: "africa-beauty", index: 1 } */
function parseName(file) {
  const stem = path.basename(file, path.extname(file));
  const m = stem.match(/^(.*?)-(\d+)$/);
  return m ? { stem: m[1], index: Number(m[2]) } : { stem, index: 1 };
}

// Longest slug first, so "twist-up-liner-deep" wins over a shorter prefix.
const byLength = [...products].sort((a, b) => (b.slug?.length ?? 0) - (a.slug?.length ?? 0));

const plan = new Map(); // productId -> [{ file, index }]
const unmatched = [];

for (const file of files) {
  const { stem, index } = parseName(file);
  const norm = stem.toLowerCase();

  const product = byLength.find((p) => {
    if (!p.slug) return false;
    const slug = p.slug.toLowerCase();
    // Either the filename is the slug, or a recognisable shortening of it.
    return norm === slug || slug.includes(norm) || norm.includes(slug);
  });

  if (!product) {
    unmatched.push(file);
    continue;
  }

  if (!plan.has(product._id)) plan.set(product._id, []);
  plan.get(product._id).push({ file, index });
}

console.log(`Found ${files.length} image(s) in the folder.\n`);

for (const [productId, entries] of plan) {
  const p = products.find((x) => x._id === productId);
  entries.sort((a, b) => a.index - b.index);
  console.log(`  ${p.name}`);
  entries.forEach((e, i) => console.log(`      ${i === 0 ? "card photo " : "extra     "} ${e.file}`));
}

if (unmatched.length) {
  console.log(`\n  NOT MATCHED to any product (skipped):`);
  unmatched.forEach((f) => console.log(`      ${f}`));
}

const missing = products.filter((p) => !plan.has(p._id));
if (missing.length) {
  console.log(`\n  Products still without photos (${missing.length}):`);
  missing.forEach((p) => console.log(`      ${p.category.padEnd(10)} ${p.name}`));
}

if (dryRun) {
  console.log("\nDry run — nothing uploaded.");
  process.exit(0);
}

console.log("\nUploading...\n");

for (const [productId, entries] of plan) {
  const p = products.find((x) => x._id === productId);
  entries.sort((a, b) => a.index - b.index);

  const images = [];
  for (const [i, entry] of entries.entries()) {
    const full = path.join(folder, entry.file);
    const asset = await client.assets.upload("image", fs.createReadStream(full), {
      filename: entry.file,
    });

    images.push({
      _type: "image",
      _key: `img-${i}`,
      asset: { _type: "reference", _ref: asset._id },
      alt: `${p.name} — Shaby Wurld`,
    });

    console.log(`  uploaded  ${entry.file}`);
  }

  await client.patch(productId).set({ images }).commit();
  console.log(`  attached  ${images.length} image(s) -> ${p.name}\n`);
}

console.log("Done.");
