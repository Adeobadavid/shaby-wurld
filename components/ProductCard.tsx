"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Product card — Figma node 322:1741 (Default/Variant2 hover states).
 *
 * `images` takes an array so multiple angles per product "just work" once
 * real photography lands in the CMS — right now most products only have
 * one image, so the dots render but the slider has nothing to advance
 * through until a second image exists.
 */

export type ProductCardData = {
  id: string;
  images: string[];
  category: string;
  name: string;
  price: string;
  priceValue: number;
  description?: string;
  /** Only enabled shades reach here — disabled ones are filtered out in GROQ. */
  shades?: { name: string; color: string }[];
  inStock?: boolean;
};

const SLIDE_DELAY_MS = 1400;

export default function ProductCard({ product }: { product: ProductCardData }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { openQuickView } = useCart();

  useEffect(() => {
    if (hovered && product.images.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % product.images.length);
      }, SLIDE_DELAY_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIndex(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hovered, product.images.length]);

  const handleOpenQuickView = () => {
    openQuickView({
      id: product.id,
      category: product.category,
      name: product.name,
      description:
        product.description ??
        "Rich pigments, glass-like shine, and shades designed to flatter deeper skin tones.",
      price: product.priceValue,
      image: product.images[0],
      shades: product.shades ?? [],
      inStock: product.inStock !== false,
    });
  };

  return (
    <div
      data-figma-node="322:1741"
      role="button"
      tabIndex={0}
      onClick={handleOpenQuickView}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenQuickView()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex w-full cursor-pointer flex-col items-start gap-[14px] bg-[#f6f3f3] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[6px] active:scale-[0.98]"
    >
      {/* Slide dots — always 3, matching Figma's fixed layout. Only real
          images actually cycle; unused dots stay in the default/inactive
          state until more photos exist for this product. */}
      <div className="flex w-full items-center justify-center gap-[7px] pt-5 sm:pt-[45px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-[2px] w-3 transition-colors ${
              i === index ? "bg-sw-blush" : "border-[0.1px] border-[#ffd6cf] bg-white"
            }`}
          />
        ))}
      </div>

      {/* Image + Quick view affordance. Hover-reveal on desktop (mouse
          devices); always visible on touch screens since there's no
          hover state to reveal it there — the whole card is tappable
          either way, this is just the visual label. */}
      {/* Fixed 486px/350px was fine one-up; at two-up on a phone it made each
          card taller than the viewport. Heights are now fluid below sm. */}
      <div className="relative flex h-[240px] w-full items-center justify-center px-2 sm:h-[486px] sm:px-[15px]">
        <div className="relative flex h-full w-full max-w-[350px] items-center justify-center overflow-hidden sm:h-[425px]">
          <Image
            src={product.images[index]}
            alt={product.name}
            fill
            sizes="350px"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenQuickView();
          }}
          className={`absolute bottom-2 left-3 right-3 flex h-[38px] items-center justify-center bg-sw-blush font-body text-[13px] text-sw-cream transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#95402f] sm:bottom-[15px] sm:left-[25px] sm:right-[25px] sm:h-[50px] sm:translate-y-3 sm:text-[16px] sm:opacity-0 ${
            hovered ? "sm:translate-y-0 sm:opacity-100" : ""
          }`}
        >
          Quick view
        </button>
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-2 px-3 py-3 sm:gap-[10px] sm:px-[25px] sm:py-[15px]">
        <div className="flex flex-col gap-[3px]">
          <p className="font-body text-[12px] tracking-[-0.32px] text-[#a79b99] sm:text-[16px]">
            {product.category}
          </p>
          {/* Two lines max on mobile, so cards in a row stay the same height. */}
          <p className="line-clamp-2 font-body text-[13px] font-medium leading-[1.3] text-[#262626] sm:line-clamp-none sm:text-[16px]">
            {product.name}
          </p>
        </div>
        <p className="mt-auto font-display text-[17px] tracking-[-0.44px] text-[#262626] sm:text-[22px]">
          {product.price}
        </p>
      </div>
    </div>
  );
}
