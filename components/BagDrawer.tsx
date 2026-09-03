"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * "Your Bag" drawer — Figma node 265:1351. Slides in from the right.
 * Step indicator: 3 segments, first one active (Bag -> Checkout -> Payment).
 */
export default function BagDrawer() {
  const { items, isBagOpen, closeBag, openCheckout, updateQty, removeItem, subtotal, count } = useCart();

  if (!isBagOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={closeBag}>
      <div
        className="drawer-slide-in flex h-full w-full max-w-[427px] flex-col bg-white shadow-[-4px_0px_48px_0px_rgba(0,0,0,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
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
              <span className="h-[3px] w-6 bg-sw-blush" />
              <span className="h-[3px] w-6 bg-[#ede2df]" />
              <span className="h-[3px] w-6 bg-[#ede2df]" />
            </div>
          </div>
          <button aria-label="Close" onClick={closeBag} className="text-2xl leading-none text-[#565656]">
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
                  <div className="relative h-[112px] w-[92px] shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="92px" className="object-cover" />
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
                            className="px-1 text-[#565656]"
                          >
                            −
                          </button>
                          <span className="px-1 font-body text-[14px] text-[#565656]">{item.qty}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="px-1 text-[#565656]"
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
                        className="text-left font-body text-[12px] text-[#a79b99] underline"
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
            className="flex h-[50px] w-full items-center justify-center gap-[15px] bg-sw-blush font-body text-[16px] font-semibold text-sw-cream transition-colors hover:bg-[#95402f] disabled:opacity-40"
          >
            <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
