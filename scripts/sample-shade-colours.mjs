/**
 * Reads the dominant product colour out of each shade photo.
 *
 *   node scripts/sample-shade-colours.mjs "<folder>"
 *
 * The liner shades are identified only by supplier number (#03, #10, ...)
 * with no colour reference, so the swatch colour is derived from the
 * photography instead of guessed.
 *
 * Decodes the PNG directly (zlib is built in), keeps pixels that are opaque
 * and actually coloured — skipping the white/clear packaging and any near
 * black shadow — then takes the most populated bucket in a coarse histogram.
 * Averaging the whole image would just return mud.
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";

/** Minimal 8-bit PNG decoder for colour types 2 (RGB) and 6 (RGBA). */
function decodePng(buffer) {
  if (buffer.slice(1, 4).toString() !== "PNG") throw new Error("not a PNG");

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];

  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`unsupported PNG: depth ${bitDepth}, colour type ${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;

  // Collect every IDAT chunk, then inflate them as one stream.
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString();
    if (type === "IDAT") chunks.push(buffer.slice(offset + 8, offset + 8 + length));
    if (type === "IEND") break;
    offset += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(chunks));

  // Undo per-scanline filtering. Each row depends on the one before it, so
  // this has to run in order even though we only sample some pixels after.
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const prev = dst - stride;

    for (let x = 0; x < stride; x++) {
      const value = raw[src + x];
      const a = x >= channels ? out[dst + x - channels] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x >= channels && y > 0 ? out[prev + x - channels] : 0;

      let recon;
      switch (filter) {
        case 0: recon = value; break;
        case 1: recon = value + a; break;
        case 2: recon = value + b; break;
        case 3: recon = value + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          recon = value + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`bad filter ${filter} on row ${y}`);
      }
      out[dst + x] = recon & 0xff;
    }
  }

  return { width, height, channels, data: out };
}

function dominantColour(png) {
  const { width, height, channels, data } = png;
  const buckets = new Map();

  // Every 3rd pixel is plenty at this resolution and keeps it quick.
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const alpha = channels === 4 ? data[i + 3] : 255;

      if (alpha < 230) continue; // transparent surround and soft edges

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      // Skip the clear/white barrel, the highlights, and deep shadow.
      if (saturation < 0.22) continue;
      if (max > 245 || max < 35) continue;

      // 16-level buckets: fine enough to separate shades, coarse enough
      // that noise in the photograph does not split one colour in two.
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      bucket.n++; bucket.r += r; bucket.g += g; bucket.b += b;
      buckets.set(key, bucket);
    }
  }

  if (buckets.size === 0) return null;

  const best = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  const hex = (v) => Math.round(v / best.n).toString(16).padStart(2, "0");
  return {
    hex: `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`,
    samples: best.n,
  };
}

const folder = process.argv[2];
if (!folder || !fs.existsSync(folder)) {
  console.log('Usage: node scripts/sample-shade-colours.mjs "<folder>"');
  process.exit(1);
}

const files = fs.readdirSync(folder).filter((f) => /\.png$/i.test(f)).sort();

for (const file of files) {
  try {
    const png = decodePng(fs.readFileSync(path.join(folder, file)));
    const result = dominantColour(png);
    console.log(
      `  ${path.basename(file, ".png").padEnd(12)} ${result ? result.hex : "(no colour found)"}` +
        (result ? `   from ${result.samples.toLocaleString()} samples` : "")
    );
  } catch (e) {
    console.log(`  ${file.padEnd(12)} FAILED: ${e.message}`);
  }
}
