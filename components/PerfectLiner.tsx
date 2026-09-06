"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Feature strip — Figma node 265:1159, originally "The Perfect Liner".
 *
 * Now driven by a real product from Sanity (currently the Lip Scrub, which
 * has this slot instead of a grid tab). Everything shown — name, copy,
 * price, shades, photo — comes from that record, so it is edited in the
 * Studio like any other product.
 *
 * This previously added a hardcoded `perfect-liner-rodo-spice` to the cart.
 * That id exists nowhere in Sanity, and the checkout re-prices every line
 * against the database, so any bag containing it failed with "That product
 * is no longer available" — the whole order, not just this line. Using the
 * real product id is what fixes that.
 *
 * LAYOUT: aspect-ratio locked to Figma's 1440:621 at desktop, so width
 * growth scales height proportionally rather than stretching the columns.
 */

type FeatureProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  images: string[];
  shades?: { name: string; color: string; image?: string }[];
  inStock?: boolean;
};

/** Shown only if no product occupies the slot, so the page never has a hole. */
const FALLBACK = {
  name: "The Perfect Liner",
  description:
    "Rich pigments, glass-like shine, and shades designed to flatter deeper skin tones.",
  image: "/perfect-liner/rodo-spice.webp",
  price: 5000,
};

export default function PerfectLiner({ product }: { product?: FeatureProduct | null }) {
  const [shadeIndex, setShadeIndex] = useState(0);
  const { addItem, openBag } = useCart();

  const shades = product?.shades ?? [];
  const selectedShade = shades[shadeIndex];

  // A shade's own photo wins when it has one, so tapping a swatch changes
  // the picture as well as the colour.
  const image =
    selectedShade?.image ?? product?.images?.[0] ?? FALLBACK.image;

  const name = product?.name ?? FALLBACK.name;
  const description = product?.description ?? FALLBACK.description;
  const price = product?.price ?? FALLBACK.price;
  const soldOut = product ? product.inStock === false : false;

  const handleAddToCart = () => {
    // Without a real record there is nothing the server could price, so the
    // button stays inert rather than poisoning the bag.
    if (!product || soldOut) return;

    addItem(
      {
        id: product._id,
        name: product.name,
        variant: selectedShade?.name ?? "Default",
        image,
        price: product.price,
      },
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
              <h2 className="font-display text-[32px] leading-[1.1] text-black sm:text-[45px]">
                {name}
              </h2>
              <p className="max-w-[532px] font-body text-[16px] leading-[1.45] text-[#797979] sm:text-[18px]">
                {description}
              </p>
            </div>

            <div className="flex w-full max-w-[306px] flex-col items-start gap-5">
              {shades.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-[13px] uppercase tracking-[0.28px] text-[#a79b99]">
                    Shade{selectedShade ? ` — ${selectedShade.name}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shades.map((s, i) => (
                      <button
                        key={s.name}
                        aria-label={s.name}
                        aria-pressed={shadeIndex === i}
                        onClick={() => setShadeIndex(i)}
                        className="h-[25px] w-[25px] rounded-full transition-transform duration-200"
                        style={{
                          backgroundColor: s.color,
                          outline:
                            shadeIndex === i ? "2px solid #262626" : "2px solid transparent",
                          outlineOffset: "2px",
                          transform: shadeIndex === i ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="font-display text-[27px] text-[#262626]">
                ₦{price.toLocaleString()}.00
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product || soldOut}
            className="flex w-full max-w-[306px] items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {soldOut ? "Sold out" : "Add to Cart"}
            {!soldOut && <img src="/icons/cart.svg" alt="" className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative h-[420px] w-full sm:h-[520px] lg:h-auto lg:w-1/2">
          <Image
            key={image}
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
