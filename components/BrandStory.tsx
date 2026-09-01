/**
 * Brand Story — Figma node 265:1178.
 * Padding here matches Figma's own spec exactly (127px), not the nav
 * margin system — this section wasn't part of the margin-override request.
 *
 * These three photos DO show Shaby Wurld's own branding in the Figma
 * reference (bottles labelled "Shaby Wurld" with the SW logo) — unlike
 * Best Sellers / Perfect Liner, no trademark concern here, just need the
 * real exported photos once available.
 */
export default function BrandStory() {
  return (
    <section
      data-figma-node="265:1178"
      className="flex w-full flex-col items-center gap-16 bg-[#fbf7f5] px-6 py-16 sm:px-16 sm:py-20 lg:px-[127px] lg:pb-[70px] lg:pt-[160px]"
    >
      <div className="flex w-full max-w-[1186px] flex-col items-center gap-16">
        <div className="relative flex w-full flex-col items-center gap-6 lg:flex-row lg:items-end lg:justify-center">
          <div className="flex -rotate-6 items-center justify-center border-[10px] border-[#edd8d5] bg-gradient-to-br from-[#d9d9d9] to-[#a8a8a8] sm:h-[280px] sm:w-[280px] h-[220px] w-[220px] lg:h-[361px] lg:w-[367px]" />
          <div className="flex rotate-2 items-center justify-center border-[10px] border-[#edd8d5] bg-gradient-to-br from-[#e9c8c2] to-[#d68073] sm:h-[280px] sm:w-[280px] h-[220px] w-[220px] lg:h-[361px] lg:w-[367px]" />
          <div className="flex -rotate-6 items-center justify-center border-[10px] border-[#edd8d5] bg-gradient-to-br from-[#f2d9cf] to-[#c98f7d] sm:h-[280px] sm:w-[280px] h-[220px] w-[220px] lg:h-[361px] lg:w-[367px]" />
          <p className="mt-6 text-center font-display text-[36px] leading-[0.95] text-black sm:text-[50px] lg:absolute lg:-top-[70px] lg:right-0 lg:mt-0 lg:w-[367px] lg:text-right lg:text-[60px]">
            Beauty made for you.
          </p>
        </div>

        <div className="flex w-full max-w-[496px] flex-col items-center gap-[50px] text-center lg:items-start lg:text-left">
          <p className="font-body text-[16px] leading-[1.35] text-[#707070]">
            Shaby wurld is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish edge elegance soft meets fierce inclusive, expressive, and youthful — feels luxury but not intimidating
          </p>
          <a
            href="#shop"
            className="flex w-full max-w-[334px] items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors hover:bg-[#95402f]"
          >
            Shop products
            <img src="/icons/up-arrow.svg" alt="" className="h-6 w-6 rotate-[270deg] invert-0" />
          </a>
        </div>
      </div>
    </section>
  );
}
