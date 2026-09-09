import { env } from "./env";

/**
 * Order notification email, sent through Resend.
 *
 * WHY EMAIL AND NOT JUST WHATSAPP
 * The WhatsApp fallback path only builds a wa.me link, which the webhook then
 * logs. A webhook is server-to-server — nobody is looking at that response, so
 * the link went nowhere and the owner was told nothing. Email is delivered
 * without anyone tapping anything, and an inbox is searchable months later
 * when a customer asks about an old order.
 *
 * The address block is deliberately plain text on its own lines rather than a
 * styled table: the whole point is that it can be selected and pasted into a
 * courier's booking form.
 *
 * Written with inline styles and tables because email clients strip <style>
 * blocks and have no useful flexbox support. This is not how the site is
 * built; it is how email has to be built.
 */

export type OrderEmail = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  items: { name: string; shade?: string; qty: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  courier?: string;
  studioUrl?: string;
};

const naira = (n: number) => `&#8358;${n.toLocaleString()}`;

/** Email clients render unescaped input as markup; customer data is input. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOrderEmailHtml(order: OrderEmail): string {
  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #edcac3;font-family:Georgia,serif;font-size:14px;color:#262626;">
            ${esc(i.name)}${i.shade ? `<br><span style="color:#a79b99;font-size:13px;">Shade ${esc(i.shade)}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #edcac3;font-family:Georgia,serif;font-size:14px;color:#797979;text-align:center;white-space:nowrap;">
            &times;${i.qty}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #edcac3;font-family:Georgia,serif;font-size:14px;color:#262626;text-align:right;white-space:nowrap;">
            ${naira(i.unitPrice * i.qty)}
          </td>
        </tr>`
    )
    .join("");

  const addressLines = [
    order.customerName,
    order.address,
    [order.city, order.state].filter(Boolean).join(", "),
    order.postalCode,
    order.country,
  ]
    .filter(Boolean)
    .map((l) => esc(String(l)))
    .join("<br>");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fbf7f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">

        <tr>
          <td style="background:#d68073;padding:22px 26px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:19px;color:#f4efe9;">New order</p>
            <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#f4efe9;opacity:.85;">
              ${esc(order.orderNumber)}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:26px;">

            <!-- Address: plain lines so it can be pasted into a courier form -->
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.08em;color:#a79b99;">
              DELIVER TO
            </p>
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#262626;">
              ${addressLines}
            </p>
            <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#797979;">
              ${esc(order.customerPhone)}<br>
              <a href="mailto:${esc(order.customerEmail)}" style="color:#95402f;">${esc(order.customerEmail)}</a>
            </p>

            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.08em;color:#a79b99;">
              ITEMS
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="font-family:Arial,sans-serif;font-size:14px;color:#797979;padding:3px 0;">Subtotal</td>
                <td style="font-family:Arial,sans-serif;font-size:14px;color:#262626;text-align:right;padding:3px 0;">${naira(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="font-family:Arial,sans-serif;font-size:14px;color:#797979;padding:3px 0;">
                  Delivery${order.courier ? ` &middot; ${esc(order.courier)}` : ""}
                </td>
                <td style="font-family:Arial,sans-serif;font-size:14px;color:#262626;text-align:right;padding:3px 0;">
                  ${order.shippingCost === 0 ? "Free" : naira(order.shippingCost)}
                </td>
              </tr>
              <tr>
                <td style="font-family:Georgia,serif;font-size:17px;color:#262626;padding:12px 0 0;border-top:1px solid #edcac3;">Total paid</td>
                <td style="font-family:Georgia,serif;font-size:17px;color:#262626;text-align:right;padding:12px 0 0;border-top:1px solid #edcac3;">${naira(order.total)}</td>
              </tr>
            </table>

            ${
              order.studioUrl
                ? `<p style="margin:26px 0 0;">
                     <a href="${esc(order.studioUrl)}" style="display:inline-block;background:#d68073;color:#f4efe9;font-family:Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;">
                       Open in Studio
                     </a>
                   </p>`
                : ""
            }

          </td>
        </tr>
      </table>

      <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a79b99;">
        Payment confirmed by Paystack. Sent automatically by shabywurld.com
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Returns true only if Resend accepted the message. The caller uses that to
 * decide whether the order is marked notified — recording a notification that
 * was never delivered is worse than recording none.
 */
export async function sendOrderEmail(order: OrderEmail): Promise<boolean> {
  const apiKey = env.resendApiKey();
  const to = env.orderEmailTo();
  const from = env.orderEmailFrom();

  if (!apiKey || !to) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying goes straight to the customer rather than to Resend.
        reply_to: order.customerEmail,
        subject: `New order ${order.orderNumber} — ₦${order.total.toLocaleString()}`,
        html: buildOrderEmailHtml(order),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] resend rejected the message", res.status, detail.slice(0, 300));
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}
