import { defineField, defineType } from "sanity";

/**
 * Order.
 *
 * Written only by the server (the checkout route and the Paystack webhook),
 * never by the browser — the write token lives in server env vars and is never
 * shipped to the client. Treated as a read-only record in the Studio so an
 * accidental edit can't contradict what Paystack actually charged.
 */
export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  readOnly: true,

  fields: [
    defineField({ name: "orderNumber", title: "Order number", type: "string" }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending payment", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Fulfilled", value: "fulfilled" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    }),

    /* Customer */
    defineField({ name: "customerName", title: "Name", type: "string" }),
    defineField({ name: "customerEmail", title: "Email", type: "string" }),
    defineField({ name: "customerPhone", title: "Phone", type: "string" }),

    /* Shipping */
    defineField({ name: "shippingAddress", title: "Address", type: "text", rows: 2 }),
    defineField({ name: "shippingCity", title: "City", type: "string" }),
    defineField({ name: "shippingState", title: "State", type: "string" }),
    defineField({ name: "shippingPostalCode", title: "Postal code", type: "string" }),
    defineField({
      name: "shippingCourier",
      title: "Courier",
      type: "string",
      description: "Selected Shipbubble courier.",
    }),
    defineField({
      name: "shipbubbleRequestToken",
      title: "Shipbubble request token",
      type: "string",
    }),
    defineField({
      name: "shipbubbleServiceCode",
      title: "Shipbubble service code",
      type: "string",
      description: "Needed with the request token to book the label.",
    }),

    /* Items — snapshotted, not referenced, so the record still reads
       correctly after a product is renamed, repriced or deleted. */
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          fields: [
            { name: "productId", title: "Product ID", type: "string" },
            { name: "name", title: "Name", type: "string" },
            { name: "shade", title: "Shade", type: "string" },
            { name: "qty", title: "Qty", type: "number" },
            { name: "unitPrice", title: "Unit price (₦)", type: "number" },
          ],
          preview: {
            select: { title: "name", qty: "qty", shade: "shade" },
            prepare: ({ title, qty, shade }) => ({
              title: `${qty} × ${title}`,
              subtitle: shade,
            }),
          },
        },
      ],
    }),

    /* Money — all in naira, integers. Recomputed server-side; never trusted
       from the browser. */
    defineField({ name: "subtotal", title: "Subtotal (₦)", type: "number" }),
    defineField({ name: "shippingCost", title: "Shipping (₦)", type: "number" }),
    defineField({ name: "total", title: "Total (₦)", type: "number" }),

    /* Payment */
    defineField({ name: "paystackReference", title: "Paystack reference", type: "string" }),
    defineField({ name: "paidAt", title: "Paid at", type: "datetime" }),

    defineField({ name: "notifiedAt", title: "WhatsApp notified at", type: "datetime" }),
  ],

  orderings: [
    { title: "Newest", name: "newest", by: [{ field: "_createdAt", direction: "desc" }] },
  ],

  preview: {
    select: {
      title: "orderNumber",
      name: "customerName",
      status: "status",
      total: "total",
    },
    prepare({ title, name, status, total }) {
      return {
        title: `${title ?? "Order"} — ${name ?? "Unknown"}`,
        subtitle: `${status ?? "pending"} · ₦${(total ?? 0).toLocaleString()}`,
      };
    },
  },
});
