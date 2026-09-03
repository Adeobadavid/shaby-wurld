"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * "The Perfect Liner" — Figma node 265:1159.
 *
 * IMAGE: composited from the client's own Figma export (grayscale bg +
 * color inset + "Rodo Spice / Deep brown glossy Lip liner" text) into a
 * SINGLE flat image, per request — the product text lives inside the
 * image pixels now, not as separate HTML overlay text. Trade-off worth
 * knowing: because the text is baked in, changing it later means
 * re-exporting/recompositing the image, not editing a CMS text field.
 * Swap /public/perfect-liner/composite.webp for a new export to update it
 * — that's the "place to change it in the database later" this needs:
 * point this path at a CMS image field once one exists.
 *
 * LAYOUT: whole section is aspect-ratio locked to Figma's 1440:621 at
 * desktop, so full-bleed width growth scales height proportionally
 * instead of stretching the columns wider against a fixed height.
 *
 * PRODUCT: this is real, sellable inventory now — tied to its own
 * product record (not just a static banner) with shade selection and a
 * working Add to Cart, same cart the rest of the site uses.
 */

const SHADES = ["#4a1f16", "#7a3226", "#d68073"];
const PRODUCT = {
  id: "perfect-liner-rodo-spice",
  name: "Deep brown glossy Lip liner",
  price: 5000,
  image: "/perfect-liner/rodo-spice.webp",
};

export default function PerfectLiner() {
  const [shade, setShade] = useState(2);
  const { addItem, openBag } = useCart();

  const handleAddToCart = () => {
    addItem(
      { id: PRODUCT.id, name: PRODUCT.name, variant: `Shade ${shade + 1}`, image: PRODUCT.image, price: PRODUCT.price },
      1
    );
    openBag();
  };

  return (
    <section
      data-figma-node="265:1159"
      className="flex w-full flex-col items-center bg-[#fbf7f5] py-16 lg:py-0"
    >
      <div className="flex w-full flex-col items-center gap-10 px-6 sm:px-10 lg:aspect-[1440/621] lg:flex-row lg:items-stretch lg:gap-0 lg:px-0">
        <div className="flex w-full flex-col items-start justify-center gap-[30px] lg:w-1/2 lg:px-[150px] lg:py-0">
          <div className="flex flex-col gap-[35px]">
            <div className="flex flex-col items-start gap-5">
              <h2 className="font-display text-[32px] text-black sm:text-[45px]">
                The Perfect Liner
              </h2>
              <p className="max-w-[532px] font-body text-[16px] leading-[1.35] text-[#797979] sm:text-[18px]">
                Rich pigments, glass-like shine, and shades designed to flatter deeper skin tones Rich pigments, glass-like shine.
              </p>
            </div>
            <div className="flex w-[253px] flex-col items-start gap-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {SHADES.map((c, i) => (
                    <button
                      key={c}
                      aria-label={`Shade ${i + 1}`}
                      onClick={() => setShade(i)}
                      className="h-[25px] w-[25px] rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        outline: shade === i ? "2px solid #262626" : "2px solid transparent",
                        outlineOffset: "2px",
                        transform: shade === i ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="font-display text-[27px] text-[#262626]">₦{PRODUCT.price.toLocaleString()}.00</p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex w-full max-w-[306px] items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors hover:bg-[#95402f]"
          >
            Add to Cart
            <img src="/icons/cart.svg" alt="" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[420px] w-full sm:h-[520px] lg:h-auto lg:w-1/2">
          <Image
            src={PRODUCT.image}
            alt="Rodo Spice — Deep brown glossy Lip liner"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
