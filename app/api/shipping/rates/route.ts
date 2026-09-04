import { NextResponse } from "next/server";

import { formatFullAddress, shippingRatesSchema, validationError } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fetchRates, validateAddress } from "@/lib/shipbubble";
import { priceCart, OrderError } from "@/lib/orders";

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
