/**
 * Checks every state in the checkout dropdown resolves to a Fez zone, and
 * fetches a few live quotes.
 *
 *   npx tsx scripts/test-fez-rates.mjs
 *
 * Worth running whenever the state list or the zone map changes — a state
 * that fails to map falls back to the flat fee silently, which is easy to
 * miss until a customer is over- or under-charged.
 */
import { resolveDropoffZone, getFezQuote } from "../lib/fez.ts";
import { NIGERIAN_STATES } from "../lib/regions.ts";

const unmapped = NIGERIAN_STATES.filter((s) => resolveDropoffZone(s) === null);

console.log(`states in checkout dropdown : ${NIGERIAN_STATES.length}`);
console.log(
  `unmapped to a Fez zone      : ${unmapped.length}` +
    (unmapped.length ? `  -> ${unmapped.join(", ")}` : "")
);
console.log("");
console.log("  live quotes (1 unit):");

const samples = [
  ["Lagos", "Yaba"],
  ["Lagos", "Lekki"],
  ["Lagos", "Ikorodu"],
  ["Imo", "Owerri"],
  ["Rivers", "Port Harcourt"],
  ["Kano", ""],
  ["Akwa Ibom", "Uyo"],
  ["Federal Capital Territory", "Abuja"],
  ["Osun", "Osogbo"],
];

for (const [state, city] of samples) {
  const q = await getFezQuote({ state, city, units: 1 });
  const label = state + (city ? ` / ${city}` : "");
  console.log(
    "    " +
      label.padEnd(36) +
      (q
        ? `NGN ${q.total.toLocaleString()}   (rate ${q.rate.toLocaleString()} + vat ${q.vat.toLocaleString()})`
        : "no quote — would fall back to the flat fee")
  );
}
