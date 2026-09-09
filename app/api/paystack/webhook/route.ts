import { NextResponse } from "next/server";

import { fromKobo } from "@/lib/paystack";
import { verifyWebhookSignature } from "@/lib/paystack-webhook";
import { getWriteClient } from "@/sanity/client";
import { getSiteSettings } from "@/sanity/queries";
import { notifyNewOrder } from "@/lib/whatsapp";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/paystack/webhook
 *
 * The only trustworthy signal that money actually moved.
 *
 * Three rules this route exists to enforce:
 *  1. Verify the signature against the RAW body before parsing anything.
 *  2. Confirm the amount Paystack charged matches the order's stored total —
 *     otherwise a tampered init could pay ₦100 for a ₦100,000 order.
 *  3. Be idempotent. Paystack retries, and a retry must not double-notify.
 *
 * Set the URL in Paystack: Settings -> API Keys & Webhooks ->
 *   https://shabywurld.com/api/paystack/webhook
 */
export async function POST(request: Request) {
  // Raw text, not request.json() — parsing changes the bytes and breaks the HMAC.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[paystack webhook] bad signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, any> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Anything else (refunds, transfers) is acknowledged and ignored, so
  // Paystack stops retrying it.
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference: string | undefined = event.data?.reference;
  if (!reference) return NextResponse.json({ received: true });

  try {
    const sanity = getWriteClient();

    const order = await sanity.fetch(
      // customerEmail and the full address are here for the notification
      // email — without them the message arrives with a half-empty address
      // block and no way to reply to the customer.
      `*[_type == "order" && paystackReference == $reference][0]{
         _id, status, total, orderNumber,
         customerName, customerEmail, customerPhone,
         shippingAddress, shippingCity, shippingState, shippingPostalCode,
         shippingCountry, shippingCourier,
         subtotal, shippingCost,
         items[]{ name, shade, qty, unitPrice }
       }`,
      { reference }
    );

    if (!order) {
      console.error("[paystack webhook] no order for reference", reference);
      // 200 so Paystack stops retrying something we can never resolve.
      return NextResponse.json({ received: true });
    }

    // Idempotency: a retry of an already-paid order stops here.
    if (order.status === "paid" || order.status === "fulfilled") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // Amount check — the order is only paid if the right amount arrived.
    const paidNaira = fromKobo(Number(event.data.amount ?? 0));
    if (paidNaira !== order.total) {
      console.error("[paystack webhook] amount mismatch", {
        reference,
        expected: order.total,
        paid: paidNaira,
      });
      await sanity.patch(order._id).set({ status: "failed" }).commit();
      return NextResponse.json({ received: true, mismatch: true });
    }

    await sanity
      .patch(order._id)
      .set({ status: "paid", paidAt: event.data.paid_at ?? new Date().toISOString() })
      .commit();

    // Notification must never fail the webhook — the money is already taken.
    const settings = await getSiteSettings();
    const notification = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      items: order.items ?? [],
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      courier: order.shippingCourier,
    };

    try {
      /**
       * Email and WhatsApp are tried together rather than as a fallback
       * chain. They fail for unrelated reasons — a Resend outage, an expired
       * Meta token — and the point of a notification is that the owner finds
       * out. One arriving twice is a far smaller problem than none arriving.
       */
      const [emailSent, whatsapp] = await Promise.all([
        sendOrderEmail({
          ...notification,
          customerEmail: order.customerEmail,
          state: order.shippingState ?? "",
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry,
          studioUrl: `https://shabywurld.sanity.studio/structure/order;${order._id}`,
        }),
        notifyNewOrder(notification, settings?.orderWhatsappNumber ?? ""),
      ]);

      if (emailSent || whatsapp.sent) {
        await sanity.patch(order._id).set({ notifiedAt: new Date().toISOString() }).commit();
      } else {
        // Nothing was delivered. Logged loudly rather than quietly, because
        // this means a paid order nobody has been told about.
        console.error(
          "[order] NOT NOTIFIED — no channel configured or all failed:",
          order.orderNumber,
          "wa.me fallback:",
          whatsapp.link
        );
      }
    } catch (notifyError) {
      console.error("[paystack webhook] notification failed", notifyError);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paystack webhook]", error);
    // 500 asks Paystack to retry — correct for a transient failure on our side.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
