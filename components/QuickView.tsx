"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Quick View overlay — Figma node 265:1268 ("Desktop - 4").
 * Opens when a product card's "Quick view" button is clicked.
 */

const SHADES = ["#5c3a2e", "#d68073", "#3d1f16", "#2b0e08", "#e2431e", "#6b4438"];

export default function QuickView() {
  const { quickViewProduct, closeQuickView, addItem, openBag } = useCart();
  const [qty, setQty] = useState(1);
  const [shade, setShade] = useState(0);

  if (!quickViewProduct) return null;
  const p = quickViewProduct;

  const handleAddToBag = () => {
    addItem(
      { id: p.id, name: p.name, variant: SHADES[shade] ? `Shade ${shade + 1}` : "", image: p.image, price: p.price },
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
          className="absolute right-4 top-4 z-10 text-2xl leading-none text-[#565656] sm:right-[15px] sm:top-[28px]"
        >
          &times;
        </button>

        <div
          className="flex h-[320px] w-full shrink-0 items-start bg-[#f6f3f3] sm:h-[576px] sm:w-[495px]"
          style={{ padding: "10px 50px 10px 10px" }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
          >
            <Image src={p.image} alt={p.name} fill sizes="435px" className="object-cover" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6 sm:gap-[24px] sm:p-[43px_54px_43px_0]">
          <div className="flex flex-col gap-4 sm:gap-[28px]">
            <div className="flex flex-col gap-3 sm:gap-[16px]">
              <p className="font-body text-[14px] font-medium uppercase tracking-[0.28px] text-sw-blush">
                {p.category.toUpperCase()}
              </p>
              <div className="flex flex-col gap-[5px]">
                <h2 className="font-display text-[28px] text-black sm:text-[34px]">{p.name}</h2>
                <p className="font-body text-[14px] leading-[1.4] text-[#797979]">{p.description}</p>
              </div>
              <p className="font-body text-[22px] font-medium text-[#3d3d3d] sm:text-[24px]">
                ₦{p.price.toLocaleString()}.00
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-body text-[14px] font-medium tracking-[0.28px] text-[#a79b99]">
                SHADE
              </p>
              <div className="flex items-center gap-[10px]">
                {SHADES.map((c, i) => (
                  <button
                    key={c}
                    aria-label={`Shade ${i + 1}`}
                    onClick={() => setShade(i)}
                    className="h-[25px] w-[25px] rounded-full"
                    style={{
                      backgroundColor: c,
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
            className="flex h-[50px] w-full items-center justify-center gap-[15px] bg-sw-blush font-body text-[16px] text-sw-cream transition-colors hover:bg-[#95402f]"
          >
            Add to Bag
            <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
