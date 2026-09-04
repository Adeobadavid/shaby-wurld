"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import BagPanel from "./BagPanel";
import CheckoutPanel from "./CheckoutPanel";

/**
 * The one cart surface.
 *
 * Previously the bag and checkout were separate overlays, so moving between
 * them unmounted one and mounted the other — the backdrop blinked and the
 * panel slid in from the right a second time, which read as two unrelated
 * modals. Now the panel slides in once and the two steps sit side by side on
 * a track that shifts horizontally, so checkout feels like the next page of
 * the same drawer.
 */
export default function CartDrawer() {
  const { isDrawerOpen, step, closeDrawer } = useCart();

  // Esc closes; the page behind must not scroll while the drawer is open.
  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const onCheckout = step === "checkout";

  return (
    <div
      className="sw-backdrop fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={closeDrawer}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={onCheckout ? "Checkout" : "Your bag"}
        className="drawer-slide-in flex h-full w-full max-w-[427px] flex-col overflow-hidden bg-white shadow-[-4px_0px_48px_0px_rgba(0,0,0,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Two steps on one track, each exactly half its width. Shifting the
            track by -50% slides checkout in while the bag slides out. */}
        <div
          className="flex h-full w-[200%] transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: onCheckout ? "translateX(-50%)" : "translateX(0)" }}
        >
          <div className="h-full w-1/2 shrink-0" aria-hidden={onCheckout}>
            <BagPanel />
          </div>
          <div className="h-full w-1/2 shrink-0" aria-hidden={!onCheckout}>
            <CheckoutPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
