/**
 * "The Perfect Liner" feature — Figma node 265:1159.
 * Base horizontal inset (70px) applied to the text column to match the
 * nav-margin system; the image bleeds to the right edge as in the design.
 *
 * PLACEHOLDER IMAGES: the Figma reference here shows a real MAC Cosmetics
 * lip liner in the product shot — same issue as the Best Sellers photos.
 * Both images below are generic placeholders until real Shaby Wurld
 * photography is supplied.
 */
export default function PerfectLiner() {
  return (
    <section
      data-figma-node="265:1159"
      className="flex w-full flex-col items-center gap-10 bg-[#fbf7f5] py-16 lg:flex-row lg:items-center lg:justify-end lg:gap-10 lg:py-0"
    >
      <div className="flex w-full flex-col items-start gap-[30px] px-6 sm:px-10 lg:flex-1 lg:px-[70px]">
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
              <div className="flex -space-x-2">
                <span className="h-[25px] w-[25px] rounded-full border-2 border-[#fbf7f5] bg-[#4a1f16]" />
                <span className="h-[25px] w-[25px] rounded-full border-2 border-[#fbf7f5] bg-[#7a3226]" />
                <span className="h-[25px] w-[25px] rounded-full border-2 border-[#fbf7f5] bg-sw-blush" />
              </div>
              <span className="font-body text-[20px] text-sw-blush">+3</span>
            </div>
            <p className="font-display text-[27px] text-[#262626]">₦5000.00</p>
          </div>
        </div>
        <button className="flex w-full max-w-[306px] items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors hover:bg-[#95402f]">
          Add to Cart
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8Z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="relative flex h-[420px] w-full items-end overflow-hidden bg-gradient-to-br from-[#c9b6b0] to-[#8a6f68] pb-10 pl-8 sm:h-[520px] lg:h-[621px] lg:w-[686px] lg:pb-[41px] lg:pl-[117px] lg:pr-[254px] lg:pt-[238px]">
        <div className="absolute inset-0 bg-[rgba(190,172,168,0.25)]" />
        <div className="relative flex flex-col items-start gap-[15px]">
          <div className="flex flex-col gap-[3px] text-[16px]">
            <p className="font-body tracking-[-0.32px] text-sw-cream">Rodo Spice</p>
            <p className="font-body font-medium text-white">Deep brown glossy Lip liner</p>
          </div>
          <div className="h-[180px] w-[180px] border border-dashed border-sw-cream bg-white/10 sm:h-[240px] sm:w-[240px] lg:h-[305px] lg:w-[305px]" />
        </div>
      </div>
    </section>
  );
}
