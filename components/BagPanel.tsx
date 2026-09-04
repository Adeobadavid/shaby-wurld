"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Step 1 of the cart drawer — Figma node 265:1351.
 *
 * Renders content only. The sliding panel, backdrop and step transition
 * all live in <CartDrawer>, so bag -> checkout reads as one surface
 * moving rather than two separate modals.
 */
export default function BagPanel() {
  const { items, closeDrawer, openCheckout, updateQty, removeItem, subtotal, count } = useCart();

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header — fixed, never scrolls */}
      <div className="flex w-full shrink-0 items-start justify-between border-b-[0.5px] border-[#edcac3] px-[26px] pb-[18px] pt-[38px]">
        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center gap-2">
            <p className="font-body text-[20px] font-medium tracking-[0.4px] text-black">Your Bag</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sw-blush font-body text-[20px] tracking-[0.4px] text-sw-blush">
              {count}
            </span>
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="h-[3px] w-6 bg-sw-blush transition-colors duration-500" />
            <span className="h-[3px] w-6 bg-[#ede2df] transition-colors duration-500" />
            <span className="h-[3px] w-6 bg-[#ede2df] transition-colors duration-500" />
          </div>
        </div>
        <button
          aria-label="Close"
          onClick={closeDrawer}
          className="text-2xl leading-none text-[#565656] transition-transform duration-200 hover:rotate-90"
        >
          &times;
        </button>
      </div>

      {/* Product list — the only part that scrolls */}
      <div className="flex w-full flex-1 flex-col gap-[26px] overflow-y-auto px-[26px] py-[26px]">
        {items.length === 0 && (
          <p className="py-10 text-center font-body text-[14px] text-[#a79b99]">Your bag is empty.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-[27px]">
            <div className="flex w-full items-end gap-[13px]">
              <div className="relative h-[112px] w-[92px] shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="92px"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-[19px]">
                <div className="flex flex-col text-[14px]">
                  <p className="font-body font-medium text-black">{item.name}</p>
                  <p className="font-body text-[#a79b99]">{item.variant}</p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-[10px] border border-[#ddd5d4] px-[5px] py-[2px]">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-1 text-[#565656] transition-colors hover:text-sw-blush"
                      >
                        −
                      </button>
                      <span className="px-1 font-body text-[14px] text-[#565656]">{item.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-1 text-[#565656] transition-colors hover:text-sw-blush"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-body text-[14px] font-medium text-black">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-left font-body text-[12px] text-[#a79b99] underline transition-colors hover:text-sw-blush"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-[#edcac3]" />
          </div>
        ))}
      </div>

      {/* Subtotal + Checkout — fixed, never scrolls */}
      <div className="flex w-full shrink-0 flex-col gap-[15px] border-t-[0.5px] border-[#edcac3] px-[26px] pb-[26px] pt-[28px]">
        <div className="flex flex-col gap-[10px] font-body text-[14px]">
          <div className="flex justify-between font-medium text-[#3d3d3d]">
            <p>Subtotal</p>
            <p>₦{subtotal.toLocaleString()}</p>
          </div>
          <p className="text-[#a79b99]">
            Free shipping on orders over ₦50,000. Delivery fee confirmed via WhatsApp.
          </p>
        </div>
        <button
          onClick={openCheckout}
          disabled={items.length === 0}
          className="group flex h-[50px] w-full items-center justify-center gap-[15px] bg-sw-blush font-body text-[16px] font-semibold text-sw-cream transition-colors duration-300 hover:bg-[#95402f] active:scale-[0.99] disabled:opacity-40"
        >
          <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
          Checkout
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
