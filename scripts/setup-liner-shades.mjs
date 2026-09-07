/**
 * Wires up the lip liners and corrects the balm.
 *
 *   node scripts/setup-liner-shades.mjs [--dry-run]
 *
 * Shade numbers and their grouping come from shabyproduct.xlsx:
 *   Twist up Lip Liner (darker shades) -> #13, #10, #03
 *   Twist up Lip Liner                 -> #06, #14, #07
 *
 * Each shade carries its own photo, and the product gallery is the same three
 * photos in the same order, so selecting a swatch in Quick View shows that
 * shade's product shot.
 *
 * Swatch hex values are sampled from the photography (see
 * scripts/sample-shade-colours.mjs), because the shades have supplier numbers
 * and no colour reference. They are approximations of a pigment photographed
 * on skin — easy to correct in the Studio, and secondary now that each shade
 * shows its own image.
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

const LINER_DIR = "C:/Users/tm mobile/Downloads/Lip liner images";
const BALM_DIR = "C:/Users/tm mobile/Downloads/Lip Balm images";

/** Sampled from the shade photography — see the note above. */
const SHADE_HEX = {
  "03": "#672b27",
  "06": "#8b3625",
  "07": "#742c23",
  "10": "#5b241b",
  "13": "#c68c99",
  "14": "#c42b2b",
};

const LINERS = [
  { id: "product-twist-up-liner-deep", shades: ["13", "10", "03"] },
  { id: "product-twist-up-liner-classic", shades: ["06", "14", "07"] },
];

const dryRun = process.argv.includes("--dry-run");

async function uploadOnce(file) {
  return client.assets.upload("image", fs.createReadStream(file), {
    filename: path.basename(file),
  });
}

/* ---------- liners ---------- */
for (const liner of LINERS) {
  const product = await client.fetch(`*[_id == $id][0]{ name }`, { id: liner.id });
  console.log(`\n${product?.name ?? liner.id}`);

  const images = [];
  const shades = [];

  for (const [i, num] of liner.shades.entries()) {
    const file = path.join(LINER_DIR, `Shade-${num}.png`);
    if (!fs.existsSync(file)) {
      console.log(`   MISSING ${file}`);
      continue;
    }

    console.log(`   #${num}  ${SHADE_HEX[num]}  ${path.basename(file)}`);
    if (dryRun) continue;

    const asset = await uploadOnce(file);
    const ref = { _type: "reference", _ref: asset._id };

    // Same asset in both places: the gallery keeps the order the swatches are
    // in, and the shade holds its own copy so the selector can find it.
    images.push({
      _type: "image",
      _key: `img-${i}`,
      asset: ref,
      alt: `${product?.name ?? "Lip liner"} shade #${num}`,
    });

    shades.push({
      _type: "shade",
      _key: `shade-${i}`,
      name: `#${num}`,
      color: SHADE_HEX[num],
      image: { _type: "image", asset: ref },
      enabled: true,
    });
  }

  if (!dryRun) {
    await client.patch(liner.id).set({ images, shades }).commit();
    console.log(`   -> ${images.length} images, ${shades.length} shades`);
  }
}

/* ---------- balm: Cocoa is actually rose pink ---------- */
console.log("\nTinted Lip Balm");
const NEW_BALM_NAME = "Tinted Lip Balm — Rose Pink";
console.log(`   rename -> ${NEW_BALM_NAME}`);

if (!dryRun) {
  await client
    .patch("product-lip-balm-cocoa")
    .set({
      name: NEW_BALM_NAME,
      slug: { _type: "slug", current: "tinted-lip-balm-rose-pink" },
      shortDescription: "A tinted balm that conditions as it softens your lips.",
      description:
        "Deep conditioning care with a sheer wash of rose pink. Softens dry lips on contact and leaves a natural, healthy-looking flush — the balm you will actually want to be seen wearing.",
    })
    .commit();
}

/* ---------- balm: clear photo ---------- */
const clearFile = path.join(BALM_DIR, "Clear.png");
if (fs.existsSync(clearFile)) {
  console.log(`   Clear.png -> Nourishing Lip Balm — Clear`);
  if (!dryRun) {
    const asset = await uploadOnce(clearFile);
    await client
      .patch("product-lip-balm-clear")
      .set({
        images: [
          {
            _type: "image",
            _key: "img-0",
            asset: { _type: "reference", _ref: asset._id },
            alt: "Nourishing Lip Balm — Clear",
          },
        ],
      })
      .commit();
  }
}

/* ---------- everything else: no shade selector ---------- */
console.log("\nClearing shades from non-liner products");
const others = await client.fetch(
  `*[_type == "product" && category != "Lip Liner" && count(shades) > 0]{ _id, name }`
);

if (others.length === 0) {
  console.log("   none had shades — nothing to clear");
} else {
  for (const o of others) {
    console.log(`   ${o.name}`);
    if (!dryRun) await client.patch(o._id).set({ shades: [] }).commit();
  }
}

console.log(dryRun ? "\nDry run — nothing written." : "\nDone.");
