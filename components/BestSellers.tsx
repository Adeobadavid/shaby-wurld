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
type Category =
  | "Best Seller"
  | "All Products"
  | "Lip Gloss"
  | "Lip Liner"
  | "Lip Balm"
  | "Lip Scrub";

/**
 * Shown when Sanity has no products at all. Previously this was a list of
 * nine placeholder products with stock photos, which meant an empty CMS
 * rendered a fake catalogue customers could click into.
 */
const EMPTY_STATE = [] as (ProductCardData & { category: Category; featured?: boolean })[];

/**
 * Display order for the category tabs. A tab only renders if something in the
 * catalogue actually uses it, so adding a category in Sanity never leaves an
 * empty tab on the site, and removing the last product of a kind cleans its
 * tab up on its own.
 */
const CATEGORY_ORDER: Category[] = ["Lip Gloss", "Lip Liner", "Lip Balm"];

/** The Sanity shape, kept loose so this file doesn't import server code. */
export type SanityProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  shortDescription?: string;
  description?: string;
  images: string[];
  shades?: { name: string; color: string; image?: string }[];
  inStock?: boolean;
  featured?: boolean;
};

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
          priceValue: p.price,
          shortDescription: p.shortDescription,
          description: p.description,
          shades: p.shades,
          inStock: p.inStock !== false,
          featured: p.featured === true,
        }))
      : EMPTY_STATE;

  const filters: Category[] = [
    "Best Seller",
    "All Products",
    ...CATEGORY_ORDER.filter((c) => all.some((p) => p.category === c)),
  ];

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
      {/* Sticks to the top while the grid scrolls past, so switching category
          never means scrolling back up. `top-0` with the section's own white
          background behind it, and a hairline that only appears once stuck.
          It releases naturally at the end of the section because a sticky
          element cannot leave its parent. */}
      <div className="sticky top-0 z-30 -mx-6 mb-8 flex flex-col items-start justify-between gap-4 border-b border-transparent bg-white px-6 pb-3 pt-4 sm:-mx-10 sm:mb-10 sm:flex-row sm:items-center sm:gap-6 sm:px-10 lg:-mx-[70px] lg:px-[70px]">
        <h2 className="font-display text-[28px] font-light text-[#262626] sm:text-[40px]">
          {active}
        </h2>
        {/* One line on mobile: the filters used to wrap onto a second row and
            push the grid down. Scrolls horizontally rather than wrapping, with
            the scrollbar hidden so it reads as a strip. */}
        <div className="flex w-full items-center gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:flex-wrap sm:gap-8 sm:overflow-visible">
          {filters.map((filter) => {
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
