import { env } from "./env";

/**
 * Order notification email, sent through Resend.
 *
 * WHY EMAIL AND NOT JUST WHATSAPP
 * The WhatsApp fallback path only builds a wa.me link, which the webhook then
 * logs. A webhook is server-to-server — nobody is looking at that response, so
 * the link went nowhere and the owner was told nothing.
 *
 * Laid out as a receipt: what was bought, who bought it, where it goes, what
 * was paid. The address block is deliberately plain text on its own lines
 * rather than a styled table, because the whole point is that it can be
 * selected and pasted into a courier's booking form.
 *
 * Inline styles and tables throughout: mail clients strip <style> blocks and
 * have no useful flexbox. This is not how the site is built; it is how email
 * has to be built.
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
  paidAt?: string;
  studioUrl?: string;
};

const naira = (n: number) => `&#8358;${n.toLocaleString()}`;

/** Mail clients render unescaped input as markup; customer data is input. */
function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria", US: "United States", GB: "United Kingdom", CA: "Canada",
  IE: "Ireland", FR: "France", DE: "Germany", ES: "Spain", IT: "Italy",
  NL: "Netherlands", BE: "Belgium", PT: "Portugal", GH: "Ghana",
  ZA: "South Africa", AE: "United Arab Emirates", OTHER: "",
};

const LABEL =
  "font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:.1em;color:#a79b99;text-transform:uppercase;";
const BODY =
  "font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#262626;";
const MUTED =
  "font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#797979;";

export function buildOrderEmailHtml(order: OrderEmail): string {
  const date = order.paidAt ? new Date(order.paidAt) : new Date();
  const stamp = `${date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })} · ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  const rows = order.items
    .map(
      (i, n) => `
        <tr>
          <td style="padding:12px 0;border-top:${n === 0 ? "none" : "1px solid #f0e6e2"};${BODY}">
            <span style="font-weight:bold;">${esc(i.name)}</span>
            ${i.shade ? `<br><span style="${MUTED}">Shade ${esc(i.shade)}</span>` : ""}
          </td>
          <td style="padding:12px 0;border-top:${n === 0 ? "none" : "1px solid #f0e6e2"};${MUTED}text-align:center;white-space:nowrap;">
            ${i.qty} &times; ${naira(i.unitPrice)}
          </td>
          <td style="padding:12px 0;border-top:${n === 0 ? "none" : "1px solid #f0e6e2"};${BODY}text-align:right;white-space:nowrap;font-weight:bold;">
            ${naira(i.unitPrice * i.qty)}
          </td>
        </tr>`
    )
    .join("");

  const countryName = order.country
    ? COUNTRY_NAMES[order.country] ?? order.country
    : "";

  const addressLines = [
    order.address,
    [order.city, order.state].filter(Boolean).join(", "),
    order.postalCode,
    countryName,
  ]
    .filter(Boolean)
    .map((l) => esc(String(l)))
    .join("<br>");

  const totalItems = order.items.reduce((n, i) => n + i.qty, 0);

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#fbf7f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #edcac3;">

        <!-- Header -->
        <tr>
          <td style="background:#d68073;padding:24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f4efe9;">
                    New order
                  </p>
                  <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#f4efe9;opacity:.9;">
                    ${esc(order.orderNumber)} &nbsp;·&nbsp; ${stamp}
                  </p>
                </td>
                <td align="right" valign="top">
                  <span style="display:inline-block;background:#f4efe9;color:#95402f;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.08em;padding:6px 12px;">
                    PAID
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Customer + delivery, side by side -->
        <tr>
          <td style="padding:26px 28px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" valign="top" style="padding-right:12px;">
                  <p style="margin:0 0 8px;${LABEL}">Customer</p>
                  <p style="margin:0;${BODY}">${esc(order.customerName)}</p>
                  <p style="margin:2px 0 0;${MUTED}">
                    <a href="tel:${esc(order.customerPhone.replace(/[^0-9+]/g, ""))}" style="color:#95402f;text-decoration:none;">${esc(order.customerPhone)}</a><br>
                    <a href="mailto:${esc(order.customerEmail)}" style="color:#95402f;">${esc(order.customerEmail)}</a>
                  </p>
                </td>
                <td width="50%" valign="top" style="padding-left:12px;border-left:1px solid #f0e6e2;">
                  <p style="margin:0 0 8px;${LABEL}">Deliver to</p>
                  <p style="margin:0;${BODY}">${addressLines}</p>
                  ${
                    order.courier
                      ? `<p style="margin:8px 0 0;${MUTED}">via ${esc(order.courier)}</p>`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:26px 28px 0;">
            <p style="margin:0 0 10px;${LABEL}">
              Items &nbsp;·&nbsp; ${totalItems} unit${totalItems === 1 ? "" : "s"}
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="border-top:1px solid #edcac3;border-bottom:1px solid #edcac3;">
              ${rows}
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:18px 28px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="${MUTED}padding:3px 0;">Subtotal</td>
                <td style="${BODY}text-align:right;padding:3px 0;">${naira(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="${MUTED}padding:3px 0;">Delivery</td>
                <td style="${BODY}text-align:right;padding:3px 0;">
                  ${order.shippingCost === 0 ? "Free" : naira(order.shippingCost)}
                </td>
              </tr>
              <tr>
                <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#262626;padding:14px 0 0;border-top:2px solid #262626;">
                  Total paid
                </td>
                <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#262626;text-align:right;padding:14px 0 0;border-top:2px solid #262626;">
                  ${naira(order.total)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Action -->
        <tr>
          <td style="padding:26px 28px 28px;">
            ${
              order.studioUrl
                ? `<a href="${esc(order.studioUrl)}" style="display:inline-block;background:#d68073;color:#f4efe9;font-family:Arial,Helvetica,sans-serif;font-size:14px;text-decoration:none;padding:13px 26px;">
                     Open this order in Studio
                   </a>`
                : ""
            }
            <p style="margin:18px 0 0;${MUTED}">
              Payment confirmed by Paystack · reference ${esc(order.orderNumber)}
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a79b99;">
        Sent automatically by shabywurld.com when payment cleared.
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
        // Replying reaches the customer rather than Resend.
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
