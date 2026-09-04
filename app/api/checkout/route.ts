import { NextResponse } from "next/server";

import { checkoutSchema, formatFullAddress, validationError } from "@/lib/validation";
import { fetchRates, validateAddress } from "@/lib/shipbubble";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { applyFreeShipping, generateOrderNumber, priceCart, OrderError } from "@/lib/orders";
import { initializeTransaction } from "@/lib/paystack";
import { getWriteClient } from "@/sanity/client";
import { getSiteSettings } from "@/sanity/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 *
 * Prices the cart from Sanity, records a pending order, and asks Paystack to
 * start a transaction. Returns the authorization URL for the browser to open.
 *
 * The order is written BEFORE payment on purpose: if the webhook arrives for a
 * reference we have no record of, we have lost a paying customer's details.
 * A pending row that never completes is harmless by comparison.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`checkout:${clientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed.error), { status: 400 });
  }

  const { customer, items, shipping } = parsed.data;

  try {
    const cart = await priceCart(items);
    const settings = await getSiteSettings();

    /**
     * Re-price shipping server-side.
     *
     * The browser tells us WHICH courier was chosen; it does not get to say
     * what that courier costs. Trusting `shipping.amount` would let anyone
     * POST `amount: 0` and take free delivery while we still pay the courier
     * — exactly the same hole as trusting item prices.
     */
    let quotedShipping = 0;
    let courierName = "";
    let serviceCode = "";
    let requestToken = "";

    if (shipping) {
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

      const match = rates.find((r) => r.courierId === shipping.courierId);
      if (!match) {
        // The quote expired or the courier stopped serving that address.
        return NextResponse.json(
          { error: "That delivery option is no longer available. Please pick another." },
          { status: 409 }
        );
      }

      quotedShipping = match.amount;
      courierName = match.courierName;
      serviceCode = match.serviceCode;
      requestToken = match.requestToken;
    }

    const shippingCost = applyFreeShipping(
      cart.subtotal,
      quotedShipping,
      settings?.freeShippingThreshold ?? 0
    );

    const total = cart.subtotal + shippingCost;
    if (total <= 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const sanity = getWriteClient();

    await sanity.create({
      _type: "order",
      orderNumber,
      status: "pending",
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: customer.address,
      shippingCity: customer.city,
      shippingState: customer.state,
      shippingPostalCode: customer.postalCode,
      // All three from the server's own quote, not the request body.
      shippingCourier: courierName,
      shipbubbleRequestToken: requestToken,
      shipbubbleServiceCode: serviceCode,
      items: cart.items.map((i) => ({
        _type: "orderItem",
        _key: `${i.productId}-${i.shade ?? "default"}`,
        productId: i.productId,
        name: i.name,
        shade: i.shade ?? "",
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      subtotal: cart.subtotal,
      shippingCost,
      total,
      paystackReference: orderNumber,
    });

    const payment = await initializeTransaction({
      email: customer.email,
      amountNaira: total,
      reference: orderNumber,
      // Kept small: metadata is echoed back in the webhook, and there is no
      // reason to round-trip personal data through a third party.
      metadata: { orderNumber, itemCount: cart.items.length },
    });

    return NextResponse.json({
      orderNumber,
      authorizationUrl: payment.authorizationUrl,
      accessCode: payment.accessCode,
      subtotal: cart.subtotal,
      shippingCost,
      total,
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[api/checkout]", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
