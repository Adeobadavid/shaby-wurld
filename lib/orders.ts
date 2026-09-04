import { getProductPrices } from "@/sanity/queries";
import type { CartItemInput } from "./validation";

/**
 * Authoritative pricing.
 *
 * The browser sends product ids and quantities. Every price is looked up in
 * Sanity here, and the totals the customer is charged are computed from those
 * — never from anything the client sent. This is the single most important
 * rule in the checkout: a client-supplied price is an invitation to be robbed.
 */

export type PricedItem = {
  productId: string;
  name: string;
  shade?: string;
  qty: number;
  unitPrice: number;
};

export type PricedCart = {
  items: PricedItem[];
  subtotal: number;
};

export async function priceCart(items: CartItemInput[]): Promise<PricedCart> {
  const prices = await getProductPrices(items.map((i) => i.productId));

  const priced: PricedItem[] = [];

  for (const item of items) {
    const record = prices[item.productId];

    // Unknown id — either a stale cart or someone inventing products.
    if (!record) {
      throw new OrderError(`That product is no longer available.`);
    }
    if (!record.inStock) {
      throw new OrderError(`${record.name} is out of stock.`);
    }

    priced.push({
      productId: item.productId,
      name: record.name,
      shade: item.shade,
      qty: item.qty,
      unitPrice: record.price,
    });
  }

  const subtotal = priced.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  return { items: priced, subtotal };
}

/** Free over the threshold; 0 threshold disables the rule entirely. */
export function applyFreeShipping(
  subtotal: number,
  shippingCost: number,
  threshold: number
): number {
  if (threshold > 0 && subtotal >= threshold) return 0;
  return shippingCost;
}

/** Human-readable, hard to guess, and sortable by time. */
export function generateOrderNumber(): string {
  const date = new Date();
  const stamp = [
    date.getFullYear().toString().slice(2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SW-${stamp}-${random}`;
}

/** An error whose message is safe to show the customer. */
export class OrderError extends Error {}
