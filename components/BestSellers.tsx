import ProductCard, { ProductCardData } from "./ProductCard";

/**
 * Best Sellers — Figma node 265:1145.
 * Horizontal padding matches the nav's 70px per explicit request
 * (Figma's own value here is 60px).
 *
 * PLACEHOLDER PRODUCT DATA — the photos here are stand-ins only, not
 * Shaby Wurld's own product photography (two are real Fenty Beauty
 * product shots, one is a real "Essentials" lip balm tin). Fine for
 * proving out the layout and the hover slider, but these need to be
 * swapped for the client's own photos before this goes live — shipping
 * a competitor's branded packaging as if it's Shaby Wurld's own product
 * is a real trademark problem, not just a visual placeholder issue.
 *
 * `images` is an array per product on purpose: once real photography
 * (multiple angles) lands in Sanity, the hover-slide just starts working
 * with zero code changes — swap this hardcoded array for a CMS query.
 */
const PRODUCTS: ProductCardData[] = [
  {
    id: "1",
    images: ["/products/placeholder-1.webp"],
    category: "Rodo Spice",
    name: "Deep brown glossy shine matte lip gloss",
    price: "\u20a65,000.00",
  },
  {
    id: "2",
    images: ["/products/placeholder-3.webp"],
    category: "Rodo Spice",
    name: "Deep brown glossy shine matte lip gloss",
    price: "\u20a65,000.00",
  },
  {
    id: "3",
    images: ["/products/placeholder-2.webp"],
    category: "Essentials",
    name: "Natural tinted lip balm",
    price: "\u20a63,500.00",
  },
];

const FILTERS = ["Best Seller", "All Products", "Lip Gloss", "Lip Liner", "Lip Balm"];

export default function BestSellers() {
  return (
    <section
      data-figma-node="265:1145"
      className="w-full bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-[70px] lg:py-24"
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <h2 className="font-display text-[32px] font-light text-[#262626] sm:text-[40px]">
          Best Seller
        </h2>
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {FILTERS.map((filter, i) => (
            <button
              key={filter}
              className={`group relative pb-[5px] font-body text-[16px] transition-colors ${
                i === 0 ? "text-[#262626]" : "text-[#a79b99] hover:text-[#262626]"
              }`}
            >
              {filter}
              <span
                className={`absolute -bottom-0 left-0 h-px bg-[#262626] transition-all duration-200 ${
                  i === 0 ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
