/**
 * Product list <-> CSV round trip, for editing the catalogue in Excel.
 *
 *   node scripts/products-csv.mjs export    -> writes products.csv
 *   node scripts/products-csv.mjs import    -> reads products.csv into Sanity
 *   node scripts/products-csv.mjs import --dry-run
 *
 * Workflow: export, edit in Excel, Save As CSV (UTF-8), import.
 *
 * CSV rather than .xlsx on purpose — Excel opens and saves it natively, and
 * it needs no parsing library, so there is nothing to go stale.
 *
 * Import is an UPSERT keyed on the `id` column:
 *   - row with an id      -> updates that product
 *   - row with empty id   -> creates a new one
 *   - product missing from the sheet -> left alone, never deleted
 * Deleting a row will not delete the product; that is deliberate, so a
 * spreadsheet slip cannot wipe the catalogue.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

/* ---------- env ---------- */
const env = {};
fs.readFileSync(".env.local", "utf8")
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

const FILE = "products.csv";

const COLUMNS = [
  "id",
  "name",
  "category",
  "price",
  "compareAtPrice",
  "description",
  "inStock",
  "featured",
  "order",
  "images",
  "shades",
];

/* ---------- CSV helpers ---------- */

/** Quote a field if it contains a comma, quote or newline. */
function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Parse CSV, honouring quoted fields that contain commas and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  // Strip a BOM — Excel adds one when saving UTF-8 CSV.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += c;
      continue;
    }

    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/* ---------- shades: "Cocoa:#5c3a2e:on | Blush:#d68073:off" ---------- */

function shadesToText(shades = []) {
  return shades
    .map((s) => `${s.name}:${s.color}:${s.enabled === false ? "off" : "on"}`)
    .join(" | ");
}

function textToShades(text) {
  if (!text || !text.trim()) return [];

  return text
    .split("|")
    .map((chunk, i) => {
      const parts = chunk.split(":").map((p) => p.trim());
      const [name, color, state] = parts;
      if (!name || !color) return null;

      if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
        throw new Error(`Shade "${name}" has an invalid colour "${color}" — use a hex like #5c3a2e`);
      }

      return {
        _type: "shade",
        _key: `shade-${i}`,
        name,
        color,
        enabled: state !== "off",
      };
    })
    .filter(Boolean);
}

/* ---------- export ---------- */

async function exportCsv() {
  const products = await client.fetch(
    `*[_type == "product"] | order(order asc, _createdAt desc){
      _id, name, category, price, compareAtPrice, description,
      inStock, featured, order,
      "images": images[].asset->url,
      shades[]{ name, color, enabled }
    }`
  );

  const lines = [COLUMNS.join(",")];

  for (const p of products) {
    lines.push(
      [
        p._id,
        p.name,
        p.category,
        p.price,
        p.compareAtPrice ?? "",
        p.description,
        p.inStock === false ? "no" : "yes",
        p.featured === true ? "yes" : "no",
        p.order ?? 0,
        (p.images ?? []).join(" | "),
        shadesToText(p.shades),
      ]
        .map(csvCell)
        .join(",")
    );
  }

  // BOM so Excel opens UTF-8 correctly and the naira sign survives.
  fs.writeFileSync(FILE, "﻿" + lines.join("\r\n"), "utf8");
  console.log(`Wrote ${products.length} products to ${FILE}`);
  console.log("Edit in Excel, then: node scripts/products-csv.mjs import");
}

/* ---------- images ---------- */

const assetCache = new Map();

/**
 * Accepts an existing cdn.sanity.io URL (reused as-is), a local file under
 * public/, or any other http(s) URL (downloaded and uploaded once).
 */
async function resolveImage(ref) {
  const value = ref.trim();
  if (!value) return null;
  if (assetCache.has(value)) return assetCache.get(value);

  // Already a Sanity asset — pull the id straight out of the URL.
  const sanityMatch = value.match(/\/images\/[^/]+\/[^/]+\/([^.]+)\.(\w+)/);
  if (value.includes("cdn.sanity.io") && sanityMatch) {
    const id = `image-${sanityMatch[1]}-${sanityMatch[2]}`;
    assetCache.set(value, id);
    return id;
  }

  let buffer;
  let filename;

  if (/^https?:\/\//.test(value)) {
    const res = await fetch(value);
    if (!res.ok) throw new Error(`Could not download ${value} (${res.status})`);
    buffer = Buffer.from(await res.arrayBuffer());
    filename = path.basename(new URL(value).pathname) || "image.jpg";
  } else {
    const local = path.join("public", value.replace(/^\/?public\/?/, "").replace(/^\//, ""));
    if (!fs.existsSync(local)) throw new Error(`Image not found: ${local}`);
    buffer = fs.readFileSync(local);
    filename = path.basename(local);
  }

  const asset = await client.assets.upload("image", buffer, { filename });
  assetCache.set(value, asset._id);
  return asset._id;
}

/* ---------- import ---------- */

const VALID_CATEGORIES = [
  "Lip Gloss",
  "Lip Balm",
  "Lip Liner",
  "Lipstick",
  "Lip Oil",
  "Gift Set",
];

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function importCsv({ dryRun }) {
  if (!fs.existsSync(FILE)) {
    console.log(`${FILE} not found. Run: node scripts/products-csv.mjs export`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(FILE, "utf8"));
  const header = rows[0].map((h) => h.trim());
  const body = rows.slice(1);

  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    console.log(`Missing column(s) in ${FILE}: ${missing.join(", ")}`);
    process.exit(1);
  }

  const col = (row, name) => (row[header.indexOf(name)] ?? "").trim();

  // Validate everything BEFORE writing anything, so a bad sheet can't leave
  // the catalogue half-updated.
  const prepared = [];
  const errors = [];

  for (const [i, row] of body.entries()) {
    const line = i + 2; // 1-indexed, plus the header
    const name = col(row, "name");
    if (!name) {
      errors.push(`Line ${line}: name is required`);
      continue;
    }

    const category = col(row, "category");
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(
        `Line ${line} (${name}): category "${category}" is not valid. Use one of: ${VALID_CATEGORIES.join(", ")}`
      );
      continue;
    }

    const price = Number(col(row, "price").replace(/[^\d.]/g, ""));
    if (!Number.isFinite(price) || price <= 0) {
      errors.push(`Line ${line} (${name}): price must be a positive number`);
      continue;
    }

    const compareRaw = col(row, "compareAtPrice").replace(/[^\d.]/g, "");
    const images = col(row, "images").split("|").map((s) => s.trim()).filter(Boolean);
    if (images.length === 0) {
      errors.push(`Line ${line} (${name}): at least one image is required`);
      continue;
    }

    let shades;
    try {
      shades = textToShades(col(row, "shades"));
    } catch (e) {
      errors.push(`Line ${line} (${name}): ${e.message}`);
      continue;
    }

    prepared.push({
      line,
      id: col(row, "id"),
      name,
      category,
      price: Math.round(price),
      compareAtPrice: compareRaw ? Math.round(Number(compareRaw)) : undefined,
      description: col(row, "description"),
      inStock: col(row, "inStock").toLowerCase() !== "no",
      featured: col(row, "featured").toLowerCase() === "yes",
      order: Number(col(row, "order")) || 0,
      images,
      shades,
    });
  }

  if (errors.length) {
    console.log(`\n${errors.length} problem(s) — nothing was written:\n`);
    errors.forEach((e) => console.log("  " + e));
    process.exit(1);
  }

  console.log(`${prepared.length} row(s) validated.`);
  if (dryRun) {
    prepared.forEach((p) =>
      console.log(`  ${p.id ? "update" : "CREATE"}  ${p.name} — NGN ${p.price} — ${p.images.length} image(s), ${p.shades.length} shade(s)`)
    );
    console.log("\nDry run — nothing written.");
    return;
  }

  for (const p of prepared) {
    const imageRefs = [];
    for (const [i, ref] of p.images.entries()) {
      const assetId = await resolveImage(ref);
      if (assetId) {
        imageRefs.push({
          _type: "image",
          _key: `img-${i}`,
          asset: { _type: "reference", _ref: assetId },
        });
      }
    }

    const doc = {
      _type: "product",
      name: p.name,
      slug: { _type: "slug", current: slugify(p.name) },
      category: p.category,
      price: p.price,
      ...(p.compareAtPrice ? { compareAtPrice: p.compareAtPrice } : {}),
      description: p.description,
      images: imageRefs,
      shades: p.shades,
      inStock: p.inStock,
      featured: p.featured,
      order: p.order,
    };

    if (p.id) {
      await client.createOrReplace({ _id: p.id, ...doc });
      console.log(`  updated  ${p.name}`);
    } else {
      const created = await client.create(doc);
      console.log(`  created  ${p.name}  (${created._id})`);
    }
  }

  console.log("\nDone. Re-run export to pull the new ids back into the sheet.");
}

/* ---------- run ---------- */
const mode = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (mode === "export") await exportCsv();
else if (mode === "import") await importCsv({ dryRun });
else {
  console.log("Usage:");
  console.log("  node scripts/products-csv.mjs export");
  console.log("  node scripts/products-csv.mjs import [--dry-run]");
  process.exit(1);
}
