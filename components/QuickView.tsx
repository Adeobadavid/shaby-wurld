"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Quick View overlay — Figma node 265:1268 ("Desktop - 4").
 * Opens when a product card's "Quick view" button is clicked.
 */

/** Used only when a product has no shades defined in Sanity yet. */
const FALLBACK_SHADES = [
  { name: "Cocoa", color: "#5c3a2e" },
  { name: "Blush", color: "#d68073" },
  { name: "Espresso", color: "#3d1f16" },
  { name: "Noir", color: "#2b0e08" },
  { name: "Ember", color: "#e2431e" },
  { name: "Chestnut", color: "#6b4438" },
];

export default function QuickView() {
  const { quickViewProduct, closeQuickView, addItem, openBag } = useCart();
  const [qty, setQty] = useState(1);
  const [shade, setShade] = useState(0);

  if (!quickViewProduct) return null;
  const p = quickViewProduct;

  const shades = p.shades && p.shades.length > 0 ? p.shades : FALLBACK_SHADES;
  const selected = shades[shade] ?? shades[0];
  const soldOut = p.inStock === false;

  const handleAddToBag = () => {
    addItem(
      {
        id: p.id,
        name: p.name,
        variant: selected?.name ?? "",
        image: p.image,
        price: p.price,
      },
      qty
    );
    closeQuickView();
    openBag();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeQuickView}
    >
      <div
        className="relative flex w-full max-w-[982px] flex-col overflow-hidden bg-white shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)] sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={closeQuickView}
          className="absolute right-4 top-4 z-10 text-2xl leading-none text-[#565656] sm:right-[30px] sm:top-[28px]"
        >
          &times;
        </button>

        <div className="flex h-[320px] w-full shrink-0 p-[15px] pr-[50px] sm:h-auto sm:min-h-[576px] sm:w-[495px]">
          <div className="relative flex-1 overflow-hidden bg-[#f6f3f3]">
            <Image src={p.image} alt={p.name} fill sizes="430px" className="object-contain p-[48px]" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6 sm:gap-[40px] sm:p-[43px_54px_43px_0]">
          <div className="flex flex-col gap-4 sm:gap-[28px]">
            <div className="flex flex-col gap-2 sm:gap-[10px]">
              <p className="font-body text-[14px] font-medium uppercase tracking-[0.28px] text-sw-blush">
                {p.category.toUpperCase()}
              </p>
              <div className="flex flex-col gap-3 sm:gap-[14px]">
                <h2 className="font-display text-[28px] leading-[1.15] text-black sm:text-[34px]">{p.name}</h2>
                <p className="font-body text-[16px] leading-[1.5] text-[#797979] sm:text-[17px]">{p.description}</p>
              </div>
              <p className="mt-[12px] font-body text-[22px] font-medium text-[#3d3d3d] sm:text-[24px]">
                ₦{p.price.toLocaleString()}.00
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-body text-[14px] font-medium tracking-[0.28px] text-[#a79b99]">
                SHADE{selected?.name ? ` — ${selected.name}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-[10px]">
                {shades.map((s, i) => (
                  <button
                    key={`${s.color}-${i}`}
                    aria-label={s.name}
                    title={s.name}
                    aria-pressed={shade === i}
                    onClick={() => setShade(i)}
                    className="h-[25px] w-[25px] rounded-full transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
                    style={{
                      backgroundColor: s.color,
                      outline: shade === i ? "2px solid #d68073" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-[164px]">
              <p className="font-body text-[14px] font-medium tracking-[0.28px] text-[#a79b99]">
                QUANTITY
              </p>
              <div className="flex items-center justify-center gap-6 border border-[#ddd5d4] px-3 py-2">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="text-[20px] text-[#565656]"
                >
                  −
                </button>
                <span className="flex h-[30px] w-[40px] items-center justify-center font-body text-[18px] text-[#565656]">
                  {qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="text-[20px] text-[#565656]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToBag}
            disabled={soldOut}
            className="group mt-auto flex h-[50px] w-full items-center justify-center gap-[15px] bg-sw-blush font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#ddd5d4]"
          >
            {soldOut ? "Sold out" : "Add to Bag"}
            <img
              src="/icons/cart.svg"
              alt=""
              className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
