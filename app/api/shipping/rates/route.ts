import { NextResponse } from "next/server";

import { formatFullAddress, shippingRatesSchema, validationError } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fetchRates, validateAddress } from "@/lib/shipbubble";
import {
  priceCart,
  OrderError,
  INTERNATIONAL_FLAT_TOKEN,
  DOMESTIC_FLAT_TOKEN,
  FEZ_TOKEN,
} from "@/lib/orders";
import { isDomestic } from "@/lib/regions";
import { getFezQuote } from "@/lib/fez";
import { getSiteSettings } from "@/sanity/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/shipping/rates
 *
 * Proxies Shipbubble so the API key stays on the server. Rate limited because
 * each call costs a third-party request and validates an address — an open
 * endpoint here is someone else's bill.
 */
export async function POST(request: Request) {
  const limit = await rateLimit(`rates:${clientIp(request)}`, { limit: 15, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = shippingRatesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed.error), { status: 400 });
  }

  const { customer, items } = parsed.data;

  try {
    // Price server-side so Shipbubble gets real declared values, and so a
    // bad cart fails here rather than at payment.
    const cart = await priceCart(items);

    /**
     * Shipbubble is a Nigerian carrier aggregator and cannot quote anywhere
     * else — asking it to would fail address validation, not return an empty
     * list. Overseas orders get a single flat rate from Site Settings instead,
     * which is honest about being an estimate the courier confirms later.
     */
    if (!isDomestic(customer.country)) {
      const settings = await getSiteSettings();
      const fee = settings?.internationalShippingFee ?? 0;

      if (fee <= 0) {
        return NextResponse.json(
          {
            error:
              "We can't quote delivery to that country online yet. Message us on WhatsApp and we'll arrange it.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        rates: [
          {
            courierId: "international-flat",
            courierName: "International delivery",
            serviceCode: "",
            amount: fee,
            deliveryEta: "7–14 business days",
            // Nothing to re-verify against a carrier, so the checkout
            // recognises this token and re-reads the fee from Sanity itself.
            requestToken: INTERNATIONAL_FLAT_TOKEN,
          },
        ],
        subtotal: cart.subtotal,
      });
    }

    /**
     * Live courier rates, with a flat fee as a safety net.
     *
     * Shipbubble can refuse for reasons that have nothing to do with the
     * customer: an empty wallet (address validation is billed), an outage, or
     * an address no courier serves. Treating any of those as fatal meant a
     * Nigerian customer could not check out at all — a shipping provider's
     * billing state should never be able to stop a sale.
     *
     * So: try the couriers, and if that fails fall back to the flat fee from
     * Site Settings. The failure is logged, because a silent fallback that
     * runs for weeks is its own problem.
     */
    /**
     * Fez first. Its public quote endpoint needs no key and no wallet, and
     * bills nothing for asking — unlike Shipbubble, where every quote costs
     * an address validation. Verified against a real order: Fez direct came
     * within 2% of what Shipbubble charged for the same Fez delivery.
     */
    const units = cart.items.reduce((n, i) => n + i.qty, 0);
    const fez = await getFezQuote({
      state: customer.state,
      city: customer.city,
      units,
    });

    if (fez) {
      return NextResponse.json({
        rates: [
          {
            courierId: "fez",
            courierName: "Fez Delivery",
            serviceCode: "",
            // VAT included: the customer should see one number, and it is
            // what they will actually be charged.
            amount: fez.total,
            deliveryEta: "2–5 business days",
            requestToken: FEZ_TOKEN,
          },
        ],
        subtotal: cart.subtotal,
      });
    }

    /**
     * Shipbubble second. Kept because it can compare carriers, which Fez
     * cannot — but it only runs when Fez has no rate for the destination,
     * so the wallet is spent rarely rather than on every keystroke.
     */
    try {
      const toAddressCode = await validateAddress({
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: formatFullAddress(customer),
      });

      const rates = await fetchRates({
        toAddressCode,
        items: cart.items.map((i) => ({
          name: i.name,
          quantity: i.qty,
          unitAmount: i.unitPrice,
        })),
      });

      if (rates.length > 0) {
        // Cheapest first — most customers want that, and it makes the default
        // selection obvious.
        rates.sort((a, b) => a.amount - b.amount);
        return NextResponse.json({ rates, subtotal: cart.subtotal });
      }

      console.warn("[api/shipping/rates] no couriers returned; using flat fee");
    } catch (carrierError) {
      console.error("[api/shipping/rates] carrier lookup failed", carrierError);
    }

    const settings = await getSiteSettings();
    const flat = settings?.domesticShippingFee ?? 0;

    if (flat <= 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't work out delivery for that address. Please message us on WhatsApp and we'll sort it.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      rates: [
        {
          courierId: "domestic-flat",
          courierName: "Standard delivery",
          serviceCode: "",
          amount: flat,
          deliveryEta: "2–5 business days",
          requestToken: DOMESTIC_FLAT_TOKEN,
        },
      ],
      subtotal: cart.subtotal,
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Detail to the logs, something generic to the browser.
    console.error("[api/shipping/rates]", error);
    return NextResponse.json(
      { error: "Could not fetch delivery rates. Please check the address and try again." },
      { status: 502 }
    );
  }
}
