import ProductCard, { ProductCardData } from "./ProductCard";

/**
 * Best Sellers — Figma node 265:1145.
 * Section padding matches nav (70px) per explicit request (Figma's own
 * value here is 60px). Grid gap is 25px (Figma: 448.667 - 422.667 = 26px)
 * to actually separate the cards.
 *
 * PLACEHOLDER PRODUCT DATA — see prior note: two photos are real Fenty
 * Beauty shots, one is a real Essentials tin. Swap for Shaby Wurld's own
 * photography before launch.
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
                i === 0 ? "text-sw-blush" : "text-[#828282] hover:text-sw-blush"
              }`}
            >
              {filter}
              <span
                className={`absolute -bottom-0 left-0 h-px bg-sw-blush transition-all duration-200 ${
                  i === 0 ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
