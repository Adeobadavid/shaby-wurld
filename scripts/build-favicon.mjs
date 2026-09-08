/**
 * Builds the favicon set from the logo lockup.
 *
 *   node scripts/build-favicon.mjs
 *
 * The lockup is one SVG holding the SW monogram (the first path, starting at
 * x≈5.8) plus the "Shaby Wurld" wordmark (three paths, all starting at
 * x≈58.2). A favicon renders at 16px, where a wordmark is illegible, so only
 * the monogram is used.
 *
 * It is set in cream on the brand blush rather than left transparent: a
 * transparent cream mark disappears against a light browser tab.
 *
 * Next's App Router picks these up by filename — app/icon.png and
 * app/apple-icon.png need no <link> tags.
 */
import fs from "fs";
import sharp from "sharp";

const LOCKUP = "public/icons/logo-lockup.svg";
const BLUSH = "#d68073";
const CREAM = "#f4efe9";

const svg = fs.readFileSync(LOCKUP, "utf8");

// First path only — everything from x≈58 is the wordmark.
const firstPath = svg.match(/<path[^>]*\/>/) ?? svg.match(/<path[^>]*>[\s\S]*?<\/path>/);
if (!firstPath) {
  console.log("Could not find a path in the lockup SVG.");
  process.exit(1);
}

// Force the mark to cream regardless of what the lockup declares.
const markPath = firstPath[0].replace(/fill="[^"]*"/, `fill="${CREAM}"`);

// The monogram sits within roughly the first 25 units of the 200-wide box;
// a generous 40 leaves room and the trim below removes the slack.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="330" viewBox="0 0 40 33" fill="none">${markPath}</svg>`;

// Render, then trim to the ink so padding can be applied evenly.
const trimmed = await sharp(Buffer.from(markSvg))
  .trim()
  .toBuffer({ resolveWithObject: true });

console.log(`  monogram trimmed to ${trimmed.info.width} x ${trimmed.info.height}`);

/** Mark centred on a blush square, sized to `size`, with ~18% breathing room. */
async function icon(size, radius) {
  const inner = Math.round(size * 0.64);

  const mark = await sharp(trimmed.data)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BLUSH,
    },
  });

  let composed = base.composite([{ input: mark, gravity: "center" }]);

  // Rounded corners for the Apple touch icon; browsers round the tab icon
  // themselves, so the plain square is right there.
  if (radius) {
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
    );
    composed = sharp(await composed.png().toBuffer()).composite([
      { input: mask, blend: "dest-in" },
    ]);
  }

  return composed.png().toBuffer();
}

// 512 is what Next downsizes from for the tab icon and PWA manifest.
fs.writeFileSync("app/icon.png", await icon(512));
console.log("  wrote app/icon.png            512x512");

// Apple wants 180 and does not round it for you on older iOS.
fs.writeFileSync("app/apple-icon.png", await icon(180, 40));
console.log("  wrote app/apple-icon.png      180x180");

// Open Graph card image — 1200x630 is the size every platform crops toward.
const ogMark = await sharp(trimmed.data)
  .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const og = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: BLUSH },
})
  .composite([{ input: ogMark, gravity: "center" }])
  .png()
  .toBuffer();

fs.writeFileSync("app/opengraph-image.png", og);
console.log("  wrote app/opengraph-image.png 1200x630");
