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
      className="flex w-full cursor-pointer flex-col items-start gap-[14px] bg-[#f6f3f3] transition-transform active:scale-[0.98]"
    >
      {/* Slide dots — always 3, matching Figma's fixed layout. Only real
          images actually cycle; unused dots stay in the default/inactive
          state until more photos exist for this product. */}
      <div className="flex w-full items-center justify-center gap-[7px] pt-[45px]">
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
      <div className="relative flex h-[486px] w-full items-center justify-center px-[15px]">
        <div className="relative flex h-[425px] w-[350px] items-center justify-center overflow-hidden">
          <Image
            src={product.images[index]}
            alt={product.name}
            fill
            sizes="350px"
            className="object-cover transition-opacity duration-300"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenQuickView();
          }}
          className={`absolute bottom-[15px] left-[25px] right-[25px] flex h-[50px] items-center justify-center bg-sw-blush font-body text-[16px] text-sw-cream transition-opacity duration-200 hover:bg-[#95402f] sm:opacity-0 ${
            hovered ? "sm:opacity-100" : ""
          }`}
        >
          Quick view
        </button>
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-[10px] px-[25px] py-[15px]">
        <div className="flex flex-col gap-[3px]">
          <p className="font-body text-[16px] tracking-[-0.32px] text-[#a79b99]">
            {product.category}
          </p>
          <p className="font-body text-[16px] font-medium text-[#262626]">{product.name}</p>
        </div>
        <p className="font-display text-[22px] tracking-[-0.44px] text-[#262626]">
          {product.price}
        </p>
      </div>
    </div>
  );
}
