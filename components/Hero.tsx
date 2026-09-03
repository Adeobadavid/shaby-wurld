"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

/**
 * Hero section — Figma node 265:1105.
 * Vertical rhythm now matches Figma exactly: nav (pt-50/px-70/pb-5 outer +
 * pb-30 inner row) -> gap-[222px] -> headline row -> gap-[121px] -> arrow.
 */

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function ScrollIndicator() {
  return (
    <a
      href="#shop"
      aria-label="Scroll to shop"
      className="group relative flex h-[65px] w-[35px] items-center justify-center"
    >
      {/* Default: plain arrow, scales 1.2x and fades out on hover */}
      <img
        src="/icons/up-arrow.svg"
        alt=""
        className="absolute h-[56px] w-[30px] transition-all duration-200 group-hover:scale-[1.2] group-hover:opacity-0"
      />

      {/* Hover: bordered pill — "Shop" label ABOVE, small arrow BELOW
          (matches the actual Figma render, not the raw export's coordinates) */}
      <div className="absolute inset-0 flex scale-90 flex-col items-center justify-center gap-[10px] rounded-[17px] border border-sw-cream bg-sw-blush/40 px-[7px] py-[15px] opacity-0 transition-all duration-200 group-hover:scale-[1.2] group-hover:opacity-100">
        <span className="whitespace-nowrap font-body text-[16px] leading-none text-sw-cream">
          Shop
        </span>
        <svg width="14" height="24" viewBox="8 16 14 24" fill="none" className="shrink-0">
          <path
            d="M22 32C21.258 32 20.15 32.733 19.22 33.475C18.02 34.429 16.973 35.569 16.174 36.876C15.575 37.856 15 39.044 15 40M15 40C15 39.044 14.425 37.855 13.826 36.876C13.026 35.569 11.979 34.429 10.781 33.475C9.85 32.733 8.74 32 8 32M15 40V16"
            stroke="#F4EFE9"
          />
        </svg>
      </div>
    </a>
  );
}

export default function Hero() {
  const { openBag, count } = useCart();
  return (
    <section
      data-figma-node="265:1105"
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-sw-blush"
    >
      {/* Soft glow ellipse behind the subject — bigger and stronger,
          matching the visible size of the Figma glow rather than the
          subtler version this had before */}
      <div
        className="pointer-events-none absolute left-[-5%] top-[10%] h-[120%] w-[95%] rounded-full opacity-80 blur-3xl"
        style={{ background: "radial-gradient(circle, #f4efe9 0%, transparent 65%)" }}
      />

      {/* Real hero photo — resized to fit (object-contain) rather than
          cropped (object-cover), so the whole shot stays visible on any
          viewport instead of losing the top of her head/face on tall
          screens. The blush background + glow show through around it,
          same as Figma's own background treatment. */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero-photo.webp"
          alt="Model applying Shaby Wurld lip gloss"
          fill
          priority
          sizes="100vw"
          className="object-contain"
          style={{ objectPosition: "center bottom" }}
        />
      </div>

      {/* Nav — full-width hover strip, matching Figma's Variant2 exactly:
          outer pt-50/px-70/pb-5, inner row gets its own extra pb-30. */}
      <nav className="relative flex w-full flex-col px-6 pb-[5px] pt-6 transition-colors duration-200 hover:bg-[rgba(255,178,166,0.2)] sm:px-10 lg:px-[70px] lg:pb-[5px] lg:pt-[50px]">
        <div className="flex w-full items-center justify-between pb-4 lg:pb-[30px]">
          <a href="/" className="block h-[26px] w-[160px] sm:h-[31px] sm:w-[197px]">
            <img
              src="/icons/logo-lockup.svg"
              alt="Shaby Wurld"
              className="h-full w-full mix-blend-plus-lighter"
            />
          </a>
          <div className="hidden items-center gap-[31px] sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative py-[5px] font-body text-[16px] tracking-[-0.32px] text-sw-cream"
              >
                {link.label}
                <span className="absolute -bottom-[2px] left-0 h-px w-0 bg-sw-cream transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
            <button aria-label="Search" className="h-[34px] w-[24px]">
              <img src="/icons/search.svg" alt="" className="h-full w-full" />
            </button>
            <button aria-label="Bag" onClick={openBag} className="relative h-[32px] w-[25px]">
              <img src="/icons/bag.svg" alt="" className="h-full w-full" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sw-cream text-[10px] font-medium text-sw-blush">
                  {count}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-4 sm:hidden">
            <button aria-label="Search" className="h-[28px] w-[20px]">
              <img src="/icons/search.svg" alt="" className="h-full w-full" />
            </button>
            <button aria-label="Bag" onClick={openBag} className="relative h-[26px] w-[20px]">
              <img src="/icons/bag.svg" alt="" className="h-full w-full" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sw-cream text-[10px] font-medium text-sw-blush">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* gap-[222px] equivalent before the headline row (scaled down on smaller screens) */}
      <div className="relative flex w-full flex-1 flex-col px-6 pb-10 pt-16 sm:px-10 sm:pt-24 lg:px-[70px] lg:pt-[222px]">
        <div className="flex w-full flex-col items-center gap-16 px-4 sm:px-14 lg:flex-row lg:items-start lg:justify-between lg:gap-[730px] lg:px-[175px]">
          <div className="text-center font-body text-[16px] text-white sm:text-[18px] lg:pt-[300px] lg:text-left">
            <p>Beauty that</p>
            <p>feels like you.</p>
          </div>

          <div className="flex flex-col items-center gap-[9px] text-center text-sw-cream lg:items-start lg:text-left">
            <h1 className="font-display text-[44px] font-light leading-none tracking-[-1.6px] sm:text-[60px] lg:text-[80px]">
              <span className="block">Naturally</span>
              <span className="block">You.</span>
            </h1>
            <p className="font-body text-[16px] sm:text-[18px]">
              <span className="block">Made for every</span>
              <span className="block">skin tone.</span>
            </p>
          </div>
        </div>

        {/* gap-[121px] equivalent before the arrow (scaled down on smaller screens) */}
        <div className="flex flex-1 items-end justify-center pb-2 pt-10 lg:pt-[121px]">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}
