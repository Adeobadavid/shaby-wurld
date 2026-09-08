"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Shared cart + overlay state — drives the Bag icon in the nav, the
 * "Quick view" button on product cards, the Bag drawer, and the
 * Checkout drawer (Figma nodes 265:1268, 265:1351, 265:1299).
 */

export type CartItem = {
  /** Sanity product id. Several bag lines can share one — one per shade. */
  id: string;
  /**
   * Identity of a bag LINE: product + shade. The bag used to key on `id`
   * alone, so adding shade #10 and then #03 of the same liner merged into a
   * single line showing the first shade — the second was silently
   * unorderable. Quantity and remove also act on this, or they would hit
   * whichever shade happened to come first.
   */
  lineId: string;
  name: string;
  variant: string;
  image: string;
  price: number;
  qty: number;
};

/** Product plus shade, so each shade is its own bag line. */
export const lineIdFor = (productId: string, variant?: string) =>
  `${productId}::${variant ?? ""}`;

export type QuickViewProduct = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  /**
   * Enabled shades only — disabled ones are filtered out in the GROQ query.
   * `image` is that shade's own photo; selecting the swatch shows it in place
   * of the main one, so a liner's six numbered shades each show their own
   * product shot rather than one generic picture.
   */
  shades?: { name: string; color: string; image?: string }[];
  inStock?: boolean;
};

export type DrawerStep = "bag" | "checkout";

type CartContextType = {
  items: CartItem[];
  /** lineId is derived from product + shade, so callers never pass it. */
  addItem: (item: Omit<CartItem, "qty" | "lineId">, qty?: number) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  subtotal: number;
  count: number;

  /**
   * The bag and checkout are two steps of ONE drawer, not two overlays —
   * the panel slides in once, then the steps slide horizontally inside it.
   */
  isDrawerOpen: boolean;
  step: DrawerStep;
  openBag: () => void;
  openCheckout: () => void;
  backToBag: () => void;
  closeDrawer: () => void;

  quickViewProduct: QuickViewProduct | null;
  openQuickView: (product: QuickViewProduct) => void;
  closeQuickView: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [step, setStep] = useState<DrawerStep>("bag");
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const addItem = useCallback((item: Omit<CartItem, "qty" | "lineId">, qty = 1) => {
    const lineId = lineIdFor(item.id, item.variant);

    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, lineId, qty }];
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQty = useCallback((lineId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i))
    );
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQty,
    subtotal,
    count,
    isDrawerOpen,
    step,
    // Opening from the nav bag icon always lands on step 1.
    openBag: () => {
      setStep("bag");
      setIsDrawerOpen(true);
    },
    openCheckout: () => {
      setStep("checkout");
      setIsDrawerOpen(true);
    },
    backToBag: () => setStep("bag"),
    closeDrawer: () => setIsDrawerOpen(false),
    quickViewProduct,
    openQuickView: (product) => setQuickViewProduct(product),
    closeQuickView: () => setQuickViewProduct(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
