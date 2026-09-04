import { z } from "zod";

/**
 * Request validation.
 *
 * Every API route parses its body through one of these before touching it.
 * Note what is deliberately ABSENT: prices. The browser sends product ids and
 * quantities only — the server looks the prices up in Sanity itself. Accepting
 * a price from the client would let anyone buy anything for ₦1 by editing the
 * request.
 */

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(200),
  qty: z.number().int().min(1).max(20),
  shade: z.string().max(80).optional(),
});

export const customerSchema = z.object({
  email: z.string().email().max(200),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
  fullName: z.string().min(2).max(120),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  // Required: Shipbubble rejects an address that has no state, so collecting
  // it is not optional polish — rates simply fail without it.
  state: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional().default(""),
});

/**
 * Shipbubble needs city, state and country in one string, or validation
 * returns "couldn't validate the provided address".
 */
export function formatFullAddress(c: {
  address: string;
  city: string;
  state: string;
}): string {
  return [c.address, c.city, c.state, "Nigeria"]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export const shippingRatesSchema = z.object({
  customer: customerSchema,
  items: z.array(cartItemSchema).min(1).max(50),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(cartItemSchema).min(1).max(50),
  // Chosen from the rates the server previously returned. Re-validated
  // against Shipbubble before it is charged.
  shipping: z
    .object({
      courierId: z.string().max(200),
      courierName: z.string().max(200),
      serviceCode: z.string().max(200).optional().default(""),
      requestToken: z.string().max(500),
      amount: z.number().int().min(0).max(1_000_000),
    })
    .optional(),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Uniform 400 body for a failed parse — never echoes back raw input. */
export function validationError(error: z.ZodError) {
  return {
    error: "Invalid request",
    details: error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })),
  };
}
