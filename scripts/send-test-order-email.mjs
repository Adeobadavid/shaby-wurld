/**
 * Sends the order notification email for a real order in Sanity, so the
 * template can be checked without waiting for a customer.
 *
 *   node scripts/send-test-order-email.mjs            # most recent order
 *   node scripts/send-test-order-email.mjs SW-260908-XXXXX
 *
 * Reads the same env the app does and calls Resend directly. It does NOT
 * change the order — nothing is marked notified, so a real notification for
 * that order still behaves normally.
 */
import fs from "fs";

const env = {};
for (const f of [".env.local", ".dev.vars"]) {
  try {
    fs.readFileSync(f, "utf8")
      .split(/\r?\n/)
      .forEach((l) => {
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      });
  } catch {}
}

const missing = ["RESEND_API_KEY", "ORDER_EMAIL_TO", "SANITY_API_READ_TOKEN"].filter(
  (k) => !env[k]
);
if (missing.length) {
  console.log(`Missing locally: ${missing.join(", ")}`);
  console.log("Add them to .dev.vars (secrets) or .env.local (config) and retry.");
  process.exit(1);
}

const PROJECT = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const API = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
const DS = env.NEXT_PUBLIC_SANITY_DATASET || "production";

const wanted = process.argv[2];

// Prefer a paid order — that is what the real email is built from.
const filter = wanted
  ? `*[_type=="order" && orderNumber=="${wanted}"][0]`
  : `*[_type=="order"] | order(coalesce(paidAt, _createdAt) desc)[0]`;

const query = encodeURIComponent(`${filter}{
  _id, orderNumber, status, paidAt,
  customerName, customerEmail, customerPhone,
  shippingAddress, shippingCity, shippingState, shippingPostalCode,
  shippingCountry, shippingCourier,
  subtotal, shippingCost, total,
  items[]{ name, shade, qty, unitPrice }
}`);

const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DS}?query=${query}`,
  { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } }
).then((r) => r.json());

const order = res.result;
if (!order) {
  console.log(wanted ? `No order named ${wanted}.` : "No orders in Sanity yet.");
  process.exit(1);
}

console.log(`Order   : ${order.orderNumber}  (${order.status})`);
console.log(`Customer: ${order.customerName}`);
console.log(`Total   : NGN ${order.total?.toLocaleString()}`);
console.log(`Items   : ${order.items?.length ?? 0}`);
console.log("");

// Import the real template so this proves the actual production output,
// not a copy that could drift from it.
const { buildOrderEmailHtml } = await import("../lib/email.ts").catch(() => ({}));

let html;
if (buildOrderEmailHtml) {
  html = buildOrderEmailHtml(toEmailShape(order));
} else {
  // .ts is not importable from plain node without a loader; fall back to
  // building the same shape through the deployed bundle is not possible
  // either, so render a clear failure rather than a different template.
  console.log("Could not import lib/email.ts directly (TypeScript).");
  console.log("Run with:  npx tsx scripts/send-test-order-email.mjs");
  process.exit(1);
}

function toEmailShape(o) {
  return {
    orderNumber: o.orderNumber,
    customerName: o.customerName ?? "",
    customerEmail: o.customerEmail ?? "",
    customerPhone: o.customerPhone ?? "",
    address: o.shippingAddress ?? "",
    city: o.shippingCity ?? "",
    state: o.shippingState ?? "",
    postalCode: o.shippingPostalCode ?? "",
    country: o.shippingCountry ?? "",
    items: o.items ?? [],
    subtotal: o.subtotal ?? 0,
    shippingCost: o.shippingCost ?? 0,
    total: o.total ?? 0,
    courier: o.shippingCourier ?? "",
    paidAt: o.paidAt,
    studioUrl: `https://shabywurld.sanity.studio/structure/order;${o._id}`,
  };
}

const send = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: env.ORDER_EMAIL_FROM || "Shaby Wurld <orders@shabywurld.com>",
    to: [env.ORDER_EMAIL_TO],
    reply_to: order.customerEmail,
    subject: `New order ${order.orderNumber} — NGN ${order.total?.toLocaleString()}`,
    html,
  }),
});

const body = await send.json().catch(() => ({}));

if (send.ok) {
  console.log(`Sent to ${env.ORDER_EMAIL_TO}`);
  console.log(`Resend id: ${body.id}`);
} else {
  console.log(`Resend refused it (${send.status}):`);
  console.log(JSON.stringify(body, null, 2).slice(0, 600));
  process.exit(1);
}
