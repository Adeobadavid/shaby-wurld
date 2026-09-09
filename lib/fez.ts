/**
 * Fez delivery rates.
 *
 * Deliberately NOT marked "server-only": this calls a public endpoint with no
 * credentials, so there is nothing here to leak, and the guard would make the
 * module untestable outside Next's bundler.
 *
 * Uses the same public endpoint that powers Fez's own quote calculator at
 * web.fezdelivery.co/delivery-estimate. No API key, no wallet, no account —
 * which matters because the alternative (Shipbubble) bills for every address
 * validation, and quotes there cost money before a single parcel moves.
 *
 * WHAT THIS IS NOT
 * This is Fez's internal website API, not their documented Business API. It
 * could change shape or start requiring auth without notice. Every failure
 * path therefore falls back to the flat/zone rate in Site Settings rather
 * than erroring — a carrier's undocumented endpoint must never be able to
 * stop a sale. Verified against a real order: Fez quoted NGN 6,772 for
 * Lagos->Imo where Shipbubble charged NGN 6,656 for the same Fez delivery.
 *
 * When the Business API credentials arrive (they need KYC), this can move to
 * the documented POST /order/cost with a bearer token and nothing else
 * changes.
 */

const BASE = "https://customerapi.fezdelivery.co/v1";

/** Zones change rarely; a day's cache keeps this off the hot path. */
const ZONE_CACHE_SECONDS = 60 * 60 * 24;

/** The rate call itself, cached briefly so a customer editing their address
 *  does not re-request the same quote on every keystroke settle. */
const RATE_CACHE_SECONDS = 60 * 30;

type FezZone = { id: number; name: string };

export type FezQuote = {
  /** Rate excluding VAT, naira. */
  rate: number;
  vat: number;
  /** What the customer is charged. */
  total: number;
  zoneName: string;
};

/**
 * Where parcels are collected from. Ifako-Ijaiye is northern Lagos mainland.
 * Overridable without a deploy if the pickup point moves.
 */
const DEFAULT_PICKUP_ZONE = 577; // Lagos Mainland Northern

/**
 * Nigerian state -> Fez dropoff zone.
 *
 * Not every state maps by name: Fez names some zones after their hub city
 * rather than the state (Akwa Ibom is "Uyo", Rivers is "Rivers - PHC",
 * Osun is "Osogbo"), and Lagos is split into eight. Matching on name alone
 * silently missed those, so they are explicit here.
 */
const STATE_TO_ZONE: Record<string, number> = {
  Abia: 27,
  Adamawa: 28,
  "Akwa Ibom": 6, // Uyo
  Anambra: 29,
  Bauchi: 30,
  Bayelsa: 31,
  Benue: 32,
  Borno: 33,
  "Cross River": 8,
  Delta: 159,
  Ebonyi: 35,
  Edo: 36,
  Ekiti: 38,
  Enugu: 37,
  "Federal Capital Territory": 560, // Abuja
  Gombe: 39,
  Imo: 40,
  Jigawa: 41,
  Kaduna: 10,
  Kano: 9,
  Katsina: 212,
  Kebbi: 42,
  Kogi: 43,
  Kwara: 44,
  Lagos: 572, // Lagos Mainland Central — refined by city below
  Nasarawa: 45,
  Niger: 46,
  Ogun: 464,
  Ondo: 7,
  Osun: 482, // Osogbo
  Oyo: 510,
  Plateau: 48,
  Rivers: 538, // Rivers - PHC
  Sokoto: 49,
  Taraba: 50,
  Yobe: 51,
  Zamfara: 52,
};

/**
 * Lagos is eight zones and they price differently, so the city field is used
 * to pick one. Anything unrecognised falls through to Mainland Central, which
 * sits mid-range rather than at either extreme.
 */
const LAGOS_CITY_ZONES: { match: RegExp; zone: number }[] = [
  { match: /lekki|chevron|vgc|osapa|agungi/i, zone: 412 },
  { match: /ajah|sangotedo|abraham adesanya/i, zone: 579 },
  { match: /ikorodu/i, zone: 81 },
  { match: /victoria island|\bvi\b|ikoyi|lagos island|obalende|marina/i, zone: 578 },
  { match: /berger|ojodu|magodo/i, zone: 93 },
  { match: /ikeja|agege|ifako|ojota|maryland|ogba/i, zone: 577 },
  { match: /yaba|surulere|ebute|mushin|shomolu|bariga/i, zone: 572 },
  { match: /festac|amuwo|okota|isolo|ajegunle|apapa/i, zone: 573 },
  { match: /ketu|mile 12|alapere|ogudu/i, zone: 574 },
];

/** Fetches the live zone list. Only used to sanity-check the static map. */
export async function fetchDropoffZones(): Promise<FezZone[]> {
  const res = await fetch(`${BASE}/zones/dropoff`, {
    next: { revalidate: ZONE_CACHE_SECONDS },
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return data?.zones ?? [];
}

/** Resolves a customer address to a Fez dropoff zone id, or null. */
export function resolveDropoffZone(state: string, city?: string): number | null {
  const clean = state.trim();

  if (/^lagos$/i.test(clean) && city) {
    const hit = LAGOS_CITY_ZONES.find((z) => z.match.test(city));
    if (hit) return hit.zone;
  }

  // Exact first, then case-insensitive, so "lagos" and "Lagos" both work.
  if (STATE_TO_ZONE[clean]) return STATE_TO_ZONE[clean];

  const key = Object.keys(STATE_TO_ZONE).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  return key ? STATE_TO_ZONE[key] : null;
}

/**
 * Cart weight in kg.
 *
 * Products carry no weight in Sanity, so this estimates from unit count. Lip
 * products are light and Fez's rate did not move between 0.5kg and 2kg on the
 * routes tested, so precision here buys nothing — it only needs to be in the
 * right band.
 */
export function estimateWeightKg(units: number): number {
  return Math.max(0.5, Math.round(units * 0.15 * 10) / 10);
}

/**
 * Live quote. Returns null on ANY failure so the caller falls back rather
 * than surfacing a carrier problem to the customer.
 */
export async function getFezQuote(opts: {
  state: string;
  city?: string;
  units: number;
  pickupZone?: number;
}): Promise<FezQuote | null> {
  const desZone = resolveDropoffZone(opts.state, opts.city);
  if (!desZone) return null;

  const oriZone = opts.pickupZone ?? DEFAULT_PICKUP_ZONE;

  try {
    const res = await fetch(`${BASE}/getpricesV2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ori_zone: oriZone,
        des_zone: desZone,
        // "bike" is what the website sends for domestic. "local" is rejected
        // by this endpoint despite appearing in their bundle.
        deliveryType: "bike",
        weight: estimateWeightKg(opts.units),
      }),
      next: { revalidate: RATE_CACHE_SECONDS },
    });

    if (!res.ok) return null;

    const data = await res.json().catch(() => null);

    // The endpoint answers 200 with {status:"Error"} for unpriced routes, so
    // the status field matters as much as the HTTP code.
    if (!data || data.status !== "Success") return null;

    const rate = Number(data.discountedRate ?? data.rate);
    const vat = Number(data.vat?.vatAmount ?? 0);
    if (!Number.isFinite(rate) || rate <= 0) return null;

    return {
      rate: Math.round(rate),
      vat: Math.round(vat),
      total: Math.round(rate + vat),
      zoneName: opts.state,
    };
  } catch {
    return null;
  }
}
