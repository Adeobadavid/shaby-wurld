import Image from "next/image";

/**
 * Hero section — Figma node 265:1105, nav states from 321:1124/321:1137
 * (Variant2 hover fills the FULL nav strip, edge-to-edge, not a box
 * hugging the logo/links), and the scroll indicator from 321:1118.
 */

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function ScrollIndicator() {
  return (
    <a
      href="#benefits"
      aria-label="Scroll to shop"
      className="group relative flex h-[65px] w-[35px] items-center justify-center"
    >
      {/* Default: plain arrow, visible at rest, scales 1.2x and fades out on hover */}
      <img
        src="/icons/up-arrow.svg"
        alt=""
        className="absolute h-[56px] w-[30px] transition-all duration-200 group-hover:scale-[1.2] group-hover:opacity-0"
      />

      {/* Hover: bordered pill, small arrow + separate "Shop" label beneath it */}
      <div className="absolute inset-0 flex scale-90 flex-col items-center justify-center gap-[10px] rounded-[17px] border border-sw-cream bg-sw-blush/40 px-[7px] py-[15px] opacity-0 transition-all duration-200 group-hover:scale-[1.2] group-hover:opacity-100">
        <svg width="14" height="24" viewBox="8 16 14 24" fill="none" className="shrink-0">
          <path
            d="M22 32C21.258 32 20.15 32.733 19.22 33.475C18.02 34.429 16.973 35.569 16.174 36.876C15.575 37.856 15 39.044 15 40M15 40C15 39.044 14.425 37.855 13.826 36.876C13.026 35.569 11.979 34.429 10.781 33.475C9.85 32.733 8.74 32 8 32M15 40V16"
            stroke="#F4EFE9"
          />
        </svg>
        <span className="whitespace-nowrap font-body text-[16px] leading-none text-sw-cream">
          Shop
        </span>
      </div>
    </a>
  );
}

export default function Hero() {
  return (
    <section
      data-figma-node="265:1105"
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-sw-blush"
    >
      {/* Soft glow ellipse (Figma "Ellipse 1") behind the subject */}
      <div
        className="pointer-events-none absolute left-[8%] top-[35%] h-[85%] w-[70%] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #f4efe9 0%, transparent 70%)" }}
      />

      {/* Real hero photo, full-bleed, anchored bottom */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero-photo.webp"
          alt="Model applying Shaby Wurld lip gloss"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* Nav — its own full-width strip (321:1137), edge-to-edge, no inset box.
          Hover fills this ENTIRE strip, matching Figma's Variant2 exactly. */}
      <nav className="relative flex w-full items-center justify-between px-6 pb-[5px] pt-6 transition-colors duration-200 hover:bg-[rgba(255,178,166,0.2)] sm:px-10 lg:px-[70px] lg:pb-[5px] lg:pt-[50px]">
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
          <button aria-label="Bag" className="h-[32px] w-[25px]">
            <img src="/icons/bag.svg" alt="" className="h-full w-full" />
          </button>
        </div>
        <div className="flex items-center gap-4 sm:hidden">
          <button aria-label="Search" className="h-[28px] w-[20px]">
            <img src="/icons/search.svg" alt="" className="h-full w-full" />
          </button>
          <button aria-label="Bag" className="h-[26px] w-[20px]">
            <img src="/icons/bag.svg" alt="" className="h-full w-full" />
          </button>
        </div>
      </nav>

      {/* Headline block — 2.5x nav margin (70px -> 175px) */}
      <div className="relative flex w-full flex-1 flex-col px-6 pb-10 sm:px-10 lg:px-[70px]">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-16 px-4 sm:px-14 lg:flex-row lg:items-start lg:justify-between lg:gap-[730px] lg:px-[175px]">
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

        {/* Scroll indicator */}
        <div className="flex justify-center pb-2 pt-6">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}
