import { env } from "./env";

/**
 * Shipbubble — used only to price delivery, not to book it.
 *
 * Flow is two calls: validate the customer's address to get an address code,
 * then fetch rates between your saved pickup address and theirs. The returned
 * `request_token` is what ties a quote to a later booking, so it is carried
 * through checkout and stored on the order.
 */

const BASE = "https://api.shipbubble.com/v1";

/**
 * Shipbubble package category.
 *
 * These are real ids from their /shipping/labels/categories endpoint, not
 * sequential numbers — 99652979 is "Health and beauty", which is what a
 * cosmetics parcel is. Overridable via env if the catalogue ever widens.
 */
const CATEGORY_HEALTH_AND_BEAUTY = 99652979;

/** Per-item shipping weight in kg when a product has none set. */
const DEFAULT_UNIT_WEIGHT_KG = "0.5";

export type ShippingRate = {
  courierId: string;
  courierName: string;
  amount: number; // naira, integer
  deliveryEta: string;
  requestToken: string;
  /** Needed alongside request_token to actually book the label later. */
  serviceCode: string;
};

async function shipbubble<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.shipbubbleApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Log server-side with detail; the route returns something generic so a
    // third party's error text never leaks to the browser.
    console.error("[shipbubble]", path, res.status, json);
    throw new Error(`Shipbubble ${path} failed with ${res.status}`);
  }

  return json as T;
}

/** Validate an address and return Shipbubble's address code for it. */
export async function validateAddress(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): Promise<string> {
  const json = await shipbubble<{ data: { address_code: number | string } }>(
    "/shipping/address/validate",
    {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
    }
  );

  return String(json.data.address_code);
}

/** Fetch courier rates from the saved pickup address to the customer. */
export async function fetchRates(input: {
  toAddressCode: string;
  items: { name: string; quantity: number; unitAmount: number }[];
}): Promise<ShippingRate[]> {
  const fromCode = env.shipbubbleFromAddressCode();
  if (!fromCode) {
    throw new Error(
      "SHIPBUBBLE_FROM_ADDRESS_CODE is not set — create your pickup address in Shipbubble first."
    );
  }

  const json = await shipbubble<{
    data: {
      request_token: string;
      couriers: {
        courier_id: string;
        courier_name: string;
        service_code: string;
        total: number;
        delivery_eta?: string;
      }[];
    };
  }>("/shipping/fetch_rates", {
    sender_address_code: Number(fromCode),
    reciever_address_code: Number(input.toAddressCode), // Shipbubble's spelling
    // Tomorrow, not today: an order placed late in the evening can't be
    // collected the same day, and some couriers reject a past cut-off date.
    pickup_date: new Date(Date.now() + 86_400_000).toISOString().split("T")[0],
    category_id: Number(
      process.env.SHIPBUBBLE_CATEGORY_ID || CATEGORY_HEALTH_AND_BEAUTY
    ),
    package_items: input.items.map((i) => ({
      name: i.name,
      description: i.name,
      unit_weight: DEFAULT_UNIT_WEIGHT_KG,
      unit_amount: i.unitAmount,
      quantity: String(i.quantity),
    })),
    package_dimension: { length: 20, width: 15, height: 10 },
  });

  return (json.data.couriers ?? []).map((c) => ({
    courierId: String(c.courier_id),
    courierName: c.courier_name,
    serviceCode: String(c.service_code ?? ""),
    // Couriers quote fractional naira (e.g. 8587.22); round UP so the
    // shipping charged is never less than the courier will bill.
    amount: Math.ceil(Number(c.total)),
    deliveryEta: c.delivery_eta ?? "",
    requestToken: json.data.request_token,
  }));
}
