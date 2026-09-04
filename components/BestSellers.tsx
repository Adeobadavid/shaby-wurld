"use client";

import { useState } from "react";
import ProductCard, { ProductCardData } from "./ProductCard";

/**
 * Best Sellers — Figma nodes 265:1145 (layout) and 265:1146 (header/filter
 * interaction: clicking a filter swaps the header text to match it, and
 * bumps that filter's weight to semibold).
 *
 * ALL 9 PRODUCTS reuse the same 3 placeholder photos (still not Shaby
 * Wurld's own photography — see prior notes on Fenty/Essentials) since
 * there isn't real inventory for 9 distinct SKUs yet. Categories are real
 * so filtering actually works; swap in real product data once it exists.
 */
type Category = "Best Seller" | "All Products" | "Lip Gloss" | "Lip Liner" | "Lip Balm";

const ALL_PRODUCTS: (ProductCardData & { category: Category; featured?: boolean })[] = [
  { id: "1", images: ["/products/placeholder-1.webp"], category: "Lip Gloss", name: "Deep brown glossy shine matte lip gloss", price: "\u20a65,000.00", priceValue: 5000, featured: true, },
  { id: "2", images: ["/products/placeholder-3.webp"], category: "Lip Gloss", name: "Deep brown glossy shine matte lip gloss", price: "\u20a65,000.00", priceValue: 5000, featured: true },
  { id: "3", images: ["/products/placeholder-2.webp"], category: "Lip Balm", name: "Natural tinted lip balm", price: "\u20a63,500.00", priceValue: 3500, featured: true },
  { id: "4", images: ["/products/placeholder-1.webp"], category: "Lip Gloss", name: "Rose shimmer glaze lip gloss", price: "\u20a65,000.00", priceValue: 5000 },
  { id: "5", images: ["/products/placeholder-3.webp"], category: "Lip Gloss", name: "Copper glow lip gloss", price: "\u20a65,000.00", priceValue: 5000 },
  { id: "6", images: ["/products/placeholder-2.webp"], category: "Lip Balm", name: "Berry tint hydrating lip balm", price: "\u20a63,500.00", priceValue: 3500 },
  { id: "7", images: ["/products/placeholder-1.webp"], category: "Lip Liner", name: "Deep brown glossy lip liner", price: "\u20a64,200.00", priceValue: 4200 },
  { id: "8", images: ["/products/placeholder-3.webp"], category: "Lip Liner", name: "Rose nude lip liner", price: "\u20a64,200.00", priceValue: 4200 },
  { id: "9", images: ["/products/placeholder-2.webp"], category: "Lip Balm", name: "Vanilla glow lip balm", price: "\u20a63,500.00", priceValue: 3500 },
];

const FILTERS: Category[] = ["Best Seller", "All Products", "Lip Gloss", "Lip Liner", "Lip Balm"];

/** The Sanity shape, kept loose so this file doesn't import server code. */
export type SanityProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  images: string[];
  shades?: { name: string; color: string }[];
  inStock?: boolean;
  featured?: boolean;
};

const naira = (n: number) => `₦${n.toLocaleString()}.00`;

export default function BestSellers({ products }: { products?: SanityProduct[] }) {
  const [active, setActive] = useState<Category>("Best Seller");

  // Sanity when it has content; the placeholder list otherwise, so the grid
  // is never empty before products have been added.
  const all =
    products && products.length > 0
      ? products.map((p) => ({
          id: p._id,
          images: p.images?.length ? p.images : ["/products/placeholder-1.webp"],
          category: p.category as Category,
          name: p.name,
          price: naira(p.price),
          priceValue: p.price,
          description: p.description,
          shades: p.shades,
          inStock: p.inStock !== false,
          featured: p.featured === true,
        }))
      : ALL_PRODUCTS;

  const visibleProducts =
    active === "Best Seller"
      ? all.filter((p) => p.featured)
      : active === "All Products"
      ? all
      : all.filter((p) => p.category === active);

  return (
    <section
      id="shop"
      data-figma-node="265:1145"
      className="w-full bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-[70px] lg:py-24"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center sm:gap-6">
        <h2 className="font-display text-[28px] font-light text-[#262626] sm:text-[40px]">
          {active}
        </h2>
        {/* One line on mobile: the filters used to wrap onto a second row and
            push the grid down. Scrolls horizontally rather than wrapping, with
            the scrollbar hidden so it reads as a strip. */}
        <div className="-mx-6 flex w-[calc(100%+48px)] items-center gap-4 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:w-auto sm:flex-wrap sm:gap-8 sm:overflow-visible sm:px-0">
          {FILTERS.map((filter) => {
            const isActive = filter === active;
            return (
              <button
                key={filter}
                onClick={() => setActive(filter)}
                className={`group relative shrink-0 whitespace-nowrap pb-[5px] font-body text-[13px] transition-colors sm:text-[16px] ${
                  isActive ? "font-semibold text-sw-blush" : "text-[#828282] hover:text-sw-blush"
                }`}
              >
                {filter}
                <span
                  className={`absolute -bottom-0 left-0 h-px bg-sw-blush transition-all duration-200 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Two per row on mobile: one-up made every product a full scroll
          screen and buried the range. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-[25px] lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
