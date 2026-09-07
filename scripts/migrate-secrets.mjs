/**
 * Moves server secrets out of .env.local and into .dev.vars.
 *
 * WHY: @opennextjs/cloudflare reads every .env* file at build time and writes
 * the values into .open-next/cloudflare/next-env.mjs, which is bundled into
 * the deployed Worker. Anything in .env.local ends up compiled into the
 * script. .dev.vars is read by wrangler at runtime and never by Next, so
 * secrets placed there stay out of the bundle.
 *
 * After this runs:
 *   .env.local   NEXT_PUBLIC_* and non-secret config (safe to bake in)
 *   .dev.vars    server secrets, for local `wrangler dev` only
 *   production   `wrangler secret put NAME` for each secret
 *
 * Prints names only, never values.
 */
import fs from "fs";

const SECRETS = [
  "SANITY_API_READ_TOKEN",
  "SANITY_API_WRITE_TOKEN",
  "PAYSTACK_SECRET_KEY",
  "SHIPBUBBLE_API_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
];

const ENV = ".env.local";
const DEV_VARS = ".dev.vars";

const raw = fs.readFileSync(ENV, "utf8");
const lines = raw.split(/\r?\n/);

const moved = [];
const kept = [];
const keptLines = [];

for (const line of lines) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);

  if (!m) {
    keptLines.push(line); // comments and blanks stay put
    continue;
  }

  const [, key, value] = m;

  if (SECRETS.includes(key)) {
    // Skip empties: no point creating a blank secret line.
    if (value.trim() === "") {
      keptLines.push(line);
      kept.push(`${key} (empty)`);
      continue;
    }
    moved.push({ key, value: value.trim().replace(/^["']|["']$/g, "") });
  } else {
    keptLines.push(line);
    kept.push(key);
  }
}

if (moved.length === 0) {
  console.log("Nothing to move — .env.local holds no server secrets.");
  process.exit(0);
}

// Back up before touching anything.
const backup = `${ENV}.backup`;
fs.writeFileSync(backup, raw, "utf8");

const devVarsBody = [
  "# Local development secrets, read by `wrangler dev` (npm run cf:preview).",
  "# Deliberately NOT in .env.local: OpenNext bakes .env* files into the",
  "# deployed Worker bundle. Production reads these from `wrangler secret put`.",
  "#",
  "# Never commit this file.",
  "",
  ...moved.map(({ key, value }) => `${key}=${value}`),
  "",
].join("\n");

fs.writeFileSync(DEV_VARS, devVarsBody, "utf8");

// Collapse any run of blank lines left behind by removed entries.
const cleaned = keptLines.join("\n").replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(ENV, cleaned, "utf8");

console.log(`Backed up  -> ${backup}`);
console.log(`\nMoved to ${DEV_VARS} (${moved.length}):`);
moved.forEach(({ key }) => console.log(`  ${key}`));
console.log(`\nStill in ${ENV} (${kept.length}):`);
kept.forEach((k) => console.log(`  ${k}`));
console.log("\nNext: set the same names as Worker secrets for production.");
