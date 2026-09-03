"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Shared cart + overlay state — drives the Bag icon in the nav, the
 * "Quick view" button on product cards, the Bag drawer, and the
 * Checkout drawer (Figma nodes 265:1268, 265:1351, 265:1299).
 */

export type CartItem = {
  id: string;
  name: string;
  variant: string;
  image: string;
  price: number;
  qty: number;
};

export type QuickViewProduct = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  subtotal: number;
  count: number;

  isBagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;

  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;

  quickViewProduct: QuickViewProduct | null;
  openQuickView: (product: QuickViewProduct) => void;
  closeQuickView: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
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
    isBagOpen,
    openBag: () => {
      setIsCheckoutOpen(false);
      setIsBagOpen(true);
    },
    closeBag: () => setIsBagOpen(false),
    isCheckoutOpen,
    openCheckout: () => {
      setIsBagOpen(false);
      setIsCheckoutOpen(true);
    },
    closeCheckout: () => setIsCheckoutOpen(false),
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
