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

/** Swatches shown inline before collapsing the rest into a "+N" count. */
const MAX_SWATCHES = 3;

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

  /**
   * Two photos, two jobs. images[0] is the wide banner that spans the whole
   * band on desktop; images[1] is the upright crop used on mobile and as the
   * bag thumbnail, where the wide one would be an unreadable sliver.
   * A shade's own photo wins over both when it has one.
   */
  const wideImage = selectedShade?.image ?? product?.images?.[0] ?? FALLBACK.image;
  const uprightImage = product?.images?.[1] ?? wideImage;

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
        // The bag renders a 92x112 portrait tile, so the upright crop is the
        // only one that reads at that size.
        image: uprightImage,
        price: product.price,
      },
      1
    );
    openBag();
  };

  return (
    <section
      data-figma-node="265:1159"
      className="flex w-full flex-col items-center bg-[#fbf7f5] py-16 sm:py-0"
    >
      {/* ------------------------------------------------------------------
          TABLET / DESKTOP — the banner is a background layer spanning the
          full width, with the copy floated over its right-hand side. It is
          not a column, so nothing about the photo is cropped horizontally:
          the granules run the whole width and pass underneath the text.
          ------------------------------------------------------------------ */}
      <div className="relative hidden h-[700px] w-full overflow-hidden sm:block">
        <Image
          key={wideImage}
          src={wideImage}
          alt={name}
          fill
          priority={false}
          sizes="100vw"
          // cover fills the 700px band; the source is wider than it is tall,
          // so this scales it up — which is the "zoom in" wanted here. Anchored
          // left so the jar stays put as the viewport widens.
          className="scale-[1.12] object-cover object-left"
        />

        <div className="relative flex h-full w-full items-center justify-end">
          {/* As the viewport narrows the granules run further under the copy,
              and dark red on grey type is unreadable. A panel in the section's
              own cream sits between them — 88% opacity plus a light blur, so
              the photo still reads through it rather than being boxed off.
              Dropped at 2xl, where the composition has room and the text sits
              clear of the jar. */}
          <div className="relative flex w-[46%] max-w-[560px] flex-col items-end gap-[26px] rounded-[4px] bg-[#fbf7f5]/[0.88] p-[30px] pr-10 text-right backdrop-blur-[3px] lg:pr-[150px] 2xl:bg-transparent 2xl:p-0 2xl:pr-[150px] 2xl:backdrop-blur-none">
            <h2 className="font-display text-[40px] leading-[1.05] text-black lg:text-[52px]">
              {name}
            </h2>

            <p className="font-body text-[17px] leading-[1.45] text-[#797979] lg:text-[18px]">
              {description}
            </p>

            {/* Swatches and price share a row, split by a hairline — the
                design pairs them rather than stacking. */}
            <div className="flex items-center gap-4">
              {shades.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    {shades.slice(0, MAX_SWATCHES).map((s, i) => (
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
                    {shades.length > MAX_SWATCHES && (
                      <span className="ml-1 font-body text-[15px] text-[#a79b99]">
                        +{shades.length - MAX_SWATCHES}
                      </span>
                    )}
                  </div>
                  <span className="h-[26px] w-px bg-[#ddd5d4]" />
                </>
              )}

              <p className="font-display text-[28px] text-[#262626] lg:text-[32px]">
                ₦{price.toLocaleString()}.00
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product || soldOut}
              className="flex w-full items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {soldOut ? "Sold out" : "Add to Cart"}
              {!soldOut && <img src="/icons/cart.svg" alt="" className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          MOBILE — centred copy stacked above the upright crop. The wide
          banner is unusable at this width, so images[1] is used instead.
          ------------------------------------------------------------------ */}
      <div className="flex w-full flex-col items-center gap-5 px-6 sm:hidden">
        <h2 className="text-center font-display text-[38px] leading-[1.05] text-black">
          {name}
        </h2>

        <p className="text-center font-body text-[16px] leading-[1.45] text-[#797979]">
          {description}
        </p>

        <div className="flex items-center gap-3">
          {shades.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                {shades.slice(0, MAX_SWATCHES).map((s, i) => (
                  <button
                    key={s.name}
                    aria-label={s.name}
                    aria-pressed={shadeIndex === i}
                    onClick={() => setShadeIndex(i)}
                    className="h-[25px] w-[25px] rounded-full transition-transform duration-200"
                    style={{
                      backgroundColor: s.color,
                      outline: shadeIndex === i ? "2px solid #262626" : "2px solid transparent",
                      outlineOffset: "2px",
                      transform: shadeIndex === i ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
                {shades.length > MAX_SWATCHES && (
                  <span className="ml-1 font-body text-[15px] text-[#a79b99]">
                    +{shades.length - MAX_SWATCHES}
                  </span>
                )}
              </div>
              <span className="h-[24px] w-px bg-[#ddd5d4]" />
            </>
          )}

          <p className="font-display text-[28px] text-[#262626]">
            ₦{price.toLocaleString()}.00
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product || soldOut}
          className="mt-1 flex w-full items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors duration-300 hover:bg-[#95402f] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {soldOut ? "Sold out" : "Add to Cart"}
          {!soldOut && <img src="/icons/cart.svg" alt="" className="h-5 w-5" />}
        </button>

        <div className="relative mt-2 h-[330px] w-full overflow-hidden bg-white">
          <Image
            key={uprightImage}
            src={uprightImage}
            alt={name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
