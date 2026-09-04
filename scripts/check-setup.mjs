/**
 * Setup checker. Run any time with: node scripts/check-setup.mjs
 *
 * Verifies every credential actually works, rather than merely being present.
 * Prints status only — never a secret value.
 */
import fs from "fs";

const env = {};
try {
  fs.readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .forEach((l) => {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    });
} catch {
  console.log("No .env.local found. Copy .env.example to .env.local first.");
  process.exit(1);
}

const PASS = "  PASS  ";
const FAIL = "  FAIL  ";
const WARN = "  WARN  ";
let failures = 0;

const fail = (m) => { failures++; console.log(FAIL + m); };

const PROJECT = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const API = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
const DS = env.NEXT_PUBLIC_SANITY_DATASET || "production";

console.log("\n--- Sanity ---");

// Read token: must exist and must be able to read the private dataset.
if (!env.SANITY_API_READ_TOKEN) {
  fail("SANITY_API_READ_TOKEN missing — the site cannot read the private dataset.");
} else {
  const q = encodeURIComponent(`count(*[_type=="product"])`);
  const r = await fetch(
    `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DS}?query=${q}`,
    { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } }
  ).then((x) => x.json()).catch(() => null);

  if (r?.error) fail(`read token rejected: ${r.error.description ?? r.error.message}`);
  else console.log(PASS + `read token works — ${r?.result ?? 0} products`);
}

// Write token: needed to record orders.
if (!env.SANITY_API_WRITE_TOKEN) {
  fail("SANITY_API_WRITE_TOKEN missing — orders cannot be recorded.");
} else {
  const q = encodeURIComponent(`count(*[_type=="order"])`);
  const r = await fetch(
    `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DS}?query=${q}`,
    { headers: { Authorization: `Bearer ${env.SANITY_API_WRITE_TOKEN}` } }
  ).then((x) => x.json()).catch(() => null);

  if (r?.error) fail(`write token rejected: ${r.error.description ?? r.error.message}`);
  else console.log(PASS + `write token works — ${r?.result ?? 0} orders so far`);
}

// The dataset must NOT be publicly readable, or customer PII is exposed.
{
  const q = encodeURIComponent(`count(*[_type=="order"])`);
  const r = await fetch(
    `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DS}?query=${q}`
  ).then((x) => x.json()).catch(() => null);

  if (r?.error) console.log(PASS + "dataset is private (unauthenticated reads blocked)");
  else if ((r?.result ?? 0) === 0) console.log(PASS + "dataset is private (unauthenticated reads return nothing)");
  else fail(`DATASET IS PUBLIC — ${r.result} orders readable by anyone. Set it to Private.`);
}

console.log("\n--- Paystack ---");
if (!env.PAYSTACK_SECRET_KEY) {
  fail("PAYSTACK_SECRET_KEY missing.");
} else {
  const r = await fetch("https://api.paystack.co/transaction/totals", {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  }).catch(() => null);

  if (!r?.ok) fail("Paystack key rejected.");
  else {
    console.log(PASS + "secret key works");
    if (env.PAYSTACK_SECRET_KEY.startsWith("sk_test")) {
      console.log(WARN + "TEST key — real payments will not work until you switch to live.");
    }
  }
}

console.log("\n--- Shipbubble ---");
if (!env.SHIPBUBBLE_API_KEY) {
  fail("SHIPBUBBLE_API_KEY missing.");
} else if (!env.SHIPBUBBLE_FROM_ADDRESS_CODE) {
  fail("SHIPBUBBLE_FROM_ADDRESS_CODE missing — rates cannot be quoted.");
} else {
  // Prove the pickup address is usable by actually quoting a delivery.
  const headers = { Authorization: `Bearer ${env.SHIPBUBBLE_API_KEY}`, "Content-Type": "application/json" };
  const v = await fetch("https://api.shipbubble.com/v1/shipping/address/validate", {
    method: "POST", headers,
    body: JSON.stringify({
      name: "Setup Check", email: "check@example.com", phone: "08012345678",
      address: "12 Adeola Odeku Street, Victoria Island, Lagos, Lagos State, Nigeria",
    }),
  }).then((x) => x.json()).catch(() => null);

  if (!v?.data?.address_code) {
    fail("Shipbubble address validation failed — check the API key.");
  } else {
    const r = await fetch("https://api.shipbubble.com/v1/shipping/fetch_rates", {
      method: "POST", headers,
      body: JSON.stringify({
        sender_address_code: Number(env.SHIPBUBBLE_FROM_ADDRESS_CODE),
        reciever_address_code: Number(v.data.address_code),
        pickup_date: new Date(Date.now() + 86_400_000).toISOString().split("T")[0],
        category_id: 99652979,
        package_items: [{ name: "Lip Gloss", description: "Lip Gloss", unit_weight: "0.5", unit_amount: 5000, quantity: "1" }],
        package_dimension: { length: 20, width: 15, height: 10 },
      }),
    }).then((x) => x.json()).catch(() => null);

    const couriers = r?.data?.couriers?.length ?? 0;
    if (couriers > 0) console.log(PASS + `rates working — ${couriers} couriers quoted`);
    else fail(`rates failed: ${r?.message ?? "unknown error"}`);
  }
}

console.log("\n--- Site ---");
const url = env.NEXT_PUBLIC_SITE_URL ?? "";
if (url.includes("localhost")) {
  console.log(WARN + "NEXT_PUBLIC_SITE_URL is localhost — set the real domain BEFORE building for production.");
  console.log("        Paystack redirects customers to whatever this was at build time.");
} else if (!url) {
  fail("NEXT_PUBLIC_SITE_URL missing.");
} else {
  console.log(PASS + `site URL: ${url}`);
}

console.log(
  failures === 0
    ? "\nAll checks passed.\n"
    : `\n${failures} problem(s) above need fixing.\n`
);
process.exit(failures === 0 ? 0 : 1);
