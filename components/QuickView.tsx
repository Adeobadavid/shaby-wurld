"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Quick View overlay — Figma node 265:1268 ("Desktop - 4").
 * Opens when a product card's "Quick view" button is clicked.
 */

export default function QuickView() {
  const { quickViewProduct, closeQuickView, addItem, openBag } = useCart();
  const [qty, setQty] = useState(1);
  const [shade, setShade] = useState(0);
  const [lastId, setLastId] = useState<string | null>(null);

  // This overlay is a singleton, so state survives between products. Without
  // this, opening a liner on shade 3 and then another product would carry
  // that selection across. Adjusting state during render is React's
  // documented pattern for resetting on a prop change.
  if (quickViewProduct && quickViewProduct.id !== lastId) {
    setLastId(quickViewProduct.id);
    setShade(0);
    setQty(1);
  }

  if (!quickViewProduct) return null;
  const p = quickViewProduct;

  /**
   * Only products that genuinely have shades show a selector — currently the
   * two lip liners. There used to be a hardcoded fallback list here, which
   * meant every gloss and balm displayed six invented shades that did not
   * exist and could be "selected" into an order.
   */
  const shades = p.shades ?? [];
  const hasShades = shades.length > 0;
  const selected = hasShades ? shades[shade] ?? shades[0] : undefined;

  // A shade's own photo replaces the main one, so picking #10 shows the #10
  // product shot.
  const displayImage = selected?.image ?? p.image;
  const soldOut = p.inStock === false;

  const handleAddToBag = () => {
    addItem(
      {
        id: p.id,
        name: p.name,
        variant: selected?.name ?? "",
        image: displayImage,
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
        // Floats centred at every size. Scrolls internally on short screens
        // rather than being pinned to the bottom edge.
        className="relative flex max-h-[88dvh] w-full max-w-[982px] flex-col overflow-y-auto bg-white shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)] sm:max-h-[92dvh] sm:flex-row sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={closeQuickView}
          className="absolute right-4 top-4 z-10 text-2xl leading-none text-[#565656] sm:right-[30px] sm:top-[28px]"
        >
          &times;
        </button>

        {/* Taller on mobile so the product reads at a proper size — 240px
            shrank it to a thumbnail. */}
        <div className="flex h-[340px] w-full shrink-0 p-[15px] sm:h-auto sm:min-h-[576px] sm:w-[495px] sm:pr-[50px]">
          <div className="relative flex-1 overflow-hidden bg-[#f6f3f3]">
            {/* key forces a remount on shade change so the new photo fades
                in rather than swapping mid-decode. */}
            <Image
              key={displayImage}
              src={displayImage}
              alt={selected?.name ? `${p.name} — shade ${selected.name}` : p.name}
              fill
              sizes="430px"
              className="sw-shade-fade object-contain p-[48px]"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-2 sm:gap-[40px] sm:p-[43px_54px_43px_0]">
          <div className="flex flex-col gap-4 sm:gap-[28px]">
            <div className="flex flex-col gap-2 sm:gap-[10px]">
              <p className="font-body text-[14px] font-medium uppercase tracking-[0.28px] text-sw-blush">
                {p.category.toUpperCase()}
              </p>
              <div className="flex flex-col gap-3 sm:gap-[14px]">
                <h2 className="font-display text-[28px] leading-[1.15] text-black sm:text-[34px]">{p.name}</h2>
                <p className="font-body text-[16px] leading-[1.5] text-[#797979] sm:text-[17px]">{p.description}</p>
              </div>
              {/* Canela (font-display), matching how prices are set on the
                  product cards and the receipt total. */}
              <p className="mt-[12px] font-display text-[24px] text-[#262626] sm:text-[28px]">
                ₦{p.price.toLocaleString()}.00
              </p>
            </div>

            {hasShades && (
              <div className="flex flex-col gap-3">
                <p className="font-body text-[14px] font-medium tracking-[0.28px] text-[#a79b99]">
                  SHADE{selected?.name ? ` — ${selected.name}` : ""}
                </p>
                <div className="flex flex-wrap items-center gap-[10px]">
                  {shades.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      aria-label={`Shade ${s.name}`}
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
            )}

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
