import { NextResponse } from "next/server";

import { formatFullAddress, shippingRatesSchema, validationError } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fetchRates, validateAddress } from "@/lib/shipbubble";
import { priceCart, OrderError, INTERNATIONAL_FLAT_TOKEN } from "@/lib/orders";
import { isDomestic } from "@/lib/regions";
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

    // Cheapest first — most customers want that, and it makes the default
    // selection obvious.
    rates.sort((a, b) => a.amount - b.amount);

    return NextResponse.json({ rates, subtotal: cart.subtotal });
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
