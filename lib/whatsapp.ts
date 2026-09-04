import { env } from "./env";

/**
 * Order notifications over WhatsApp.
 *
 * Two paths, same message, chosen automatically:
 *
 *  - wa.me link (default). Zero setup, works the moment you deploy. The order
 *    is already saved and paid; this just opens WhatsApp with the details
 *    pre-filled so you can send them to yourself. Requires a human tap.
 *
 *  - Cloud API. Fully automatic, no tap. Needs a Meta business account,
 *    a verified number and an approved template.
 *
 * Fill the WHATSAPP_* env vars and the app switches over on its own — no code
 * change. Starting with wa.me because business verification takes days and
 * this way you can take orders today.
 */

export type OrderNotification = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  items: { name: string; shade?: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  courier?: string;
};

const naira = (n: number) => `NGN ${n.toLocaleString()}`;

export function formatOrderMessage(order: OrderNotification): string {
  const lines = [
    `NEW ORDER — ${order.orderNumber}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Deliver to: ${order.address}, ${order.city}`,
    "",
    "Items:",
    ...order.items.map(
      (i) =>
        `• ${i.qty} x ${i.name}${i.shade ? ` (${i.shade})` : ""} — ${naira(
          i.unitPrice * i.qty
        )}`
    ),
    "",
    `Subtotal: ${naira(order.subtotal)}`,
    `Shipping${order.courier ? ` (${order.courier})` : ""}: ${naira(order.shippingCost)}`,
    `TOTAL PAID: ${naira(order.total)}`,
  ];

  return lines.join("\n");
}

/** A wa.me link that opens WhatsApp with the order pre-filled. */
export function buildWhatsAppLink(toNumber: string, order: OrderNotification): string {
  const digits = toNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(formatOrderMessage(order))}`;
}

/**
 * Send automatically via the Cloud API.
 *
 * Returns false rather than throwing: a notification failure must never roll
 * back an order the customer has already paid for. The order is in Sanity
 * either way, and the failure is logged.
 */
export async function sendViaCloudApi(order: OrderNotification): Promise<boolean> {
  if (!env.whatsappCloudEnabled()) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${env.whatsappPhoneNumberId()}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.whatsappToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: env.whatsappRecipient(),
          type: "text",
          text: { body: formatOrderMessage(order) },
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("[whatsapp] cloud api failed", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[whatsapp] cloud api threw", error);
    return false;
  }
}

/**
 * Notify however we can. Never throws.
 *
 * Returns a wa.me link when the Cloud API isn't configured (or failed), so the
 * caller always has a usable fallback to hand the shop owner.
 */
export async function notifyNewOrder(
  order: OrderNotification,
  fallbackNumber: string
): Promise<{ sent: boolean; link: string }> {
  const sent = await sendViaCloudApi(order);
  return { sent, link: buildWhatsAppLink(fallbackNumber, order) };
}
