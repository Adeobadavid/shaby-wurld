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

export type HeroProps = {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  image?: string;
};

/** Splits copy into lines so each can wipe in separately. */
function toLines(value: string): string[] {
  // An explicit newline wins; otherwise split on the last space so a two-word
  // headline like "Naturally You." still animates as two lines.
  if (value.includes("\n")) return value.split("\n").filter(Boolean);
  const words = value.trim().split(/\s+/);
  if (words.length < 2) return [value];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export default function Hero({ eyebrow, headline, subtext, image }: HeroProps = {}) {
  const { openBag, count } = useCart();

  // Sanity when present, the original copy otherwise.
  const eyebrowLines = toLines(eyebrow ?? "Beauty that\nfeels like you.");
  const headlineLines = toLines(headline ?? "Naturally\nYou.");
  const subtextLines = toLines(subtext ?? "Made for every\nskin tone.");
  const heroImage = image ?? "/hero/hero-photo.webp";

  // Mobile sets these as single flowing lines rather than the desktop's
  // hand-split ones, so any newline in the CMS copy becomes a space.
  const headlineText = (headline ?? "Naturally You").replace(/\s*\n\s*/g, " ");
  const subtextText = (subtext ?? "Made for every skin tone.").replace(/\s*\n\s*/g, " ");

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
          src={heroImage}
          alt="Model applying Shaby Wurld lip gloss"
          fill
          priority
          sizes="100vw"
          // Mobile fills the frame edge to edge. Tablet and desktop keep
          // contain, where the whole composition needs to stay visible.
          className="object-cover object-top sm:object-contain sm:object-bottom"
        />
      </div>

      {/* Scrim, mobile only: the headline sits over her jaw and shoulder,
          which are mid-tone, so white type needs something underneath it to
          stay legible. Only covers the lower portion so the face stays clean. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 38%, transparent 100%)",
        }}
      />

      {/* Nav — full-width hover strip, matching Figma's Variant2 exactly:
          outer pt-50/px-70/pb-5, inner row gets its own extra pb-30. */}
      <nav className="sw-fade-up relative flex w-full flex-col px-6 pb-[5px] pt-6 transition-colors duration-200 hover:bg-[rgba(255,178,166,0.2)] sm:px-10 lg:px-[70px] lg:pb-[5px] lg:pt-[50px]">
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
                className="sw-underline py-[5px] font-body text-[16px] tracking-[-0.32px] text-sw-cream"
              >
                {link.label}
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
          {/* Mobile: bag only. Search was dropped here — there is no search
              UI behind it yet, and the design puts a single clean action in
              the corner. */}
          <div className="flex items-center sm:hidden">
            <button aria-label="Bag" onClick={openBag} className="relative h-[28px] w-[24px]">
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
      {/* pointer-events-none lets taps reach the photo; children re-enable it
          so the scroll cue still works. */}
      <div className="pointer-events-none relative hidden w-full flex-1 flex-col px-6 pb-6 pt-8 sm:flex sm:px-10 sm:pb-10 sm:pt-10 lg:px-[70px] lg:pt-[222px]">
        {/* Between sm and lg this used to be a centred column with a large
            top padding, which dropped the headline straight onto the model's
            face. It is now the same left/right split as desktop, anchored to
            the bottom of the frame, just with proportionate gaps — the huge
            lg gap and side padding cannot fit in a tablet's width. */}
        <div className="flex w-full flex-row items-end justify-between gap-8 px-0 sm:gap-10 lg:items-start lg:gap-[730px] lg:px-[175px]">
          <div className="max-w-[45%] text-left font-body text-[15px] text-white sm:text-[16px] lg:max-w-none lg:pt-[300px] lg:text-[18px]">
            {eyebrowLines.map((line, i) => (
              <span key={i} className="sw-line">
                <span style={{ animationDelay: `${700 + i * 80}ms` }}>{line}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col items-end gap-[9px] text-right text-sw-cream lg:items-start lg:text-left">
            {/* Headline wipes up line by line, then the supporting copy
                follows — the eye lands on "Naturally You." first. */}
            <h1 className="font-display text-[44px] font-light leading-none tracking-[-1.6px] sm:text-[60px] lg:text-[80px]">
              {headlineLines.map((line, i) => (
                <span key={i} className="sw-line">
                  <span style={{ animationDelay: `${150 + i * 140}ms` }}>{line}</span>
                </span>
              ))}
            </h1>
            <p className="font-body text-[16px] sm:text-[18px]">
              {subtextLines.map((line, i) => (
                <span key={i} className="sw-line">
                  <span style={{ animationDelay: `${460 + i * 80}ms` }}>{line}</span>
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* gap-[121px] equivalent before the arrow (scaled down on smaller screens) */}
        <div
          className="sw-fade-up pointer-events-auto flex flex-1 items-end justify-center pb-2 pt-6 sm:pt-10 lg:pt-[121px]"
          style={{ animationDelay: "900ms" }}
        >
          <div className="sw-bob">
            <ScrollIndicator />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          MOBILE hero. A separate block rather than responsive classes on the
          one above: the arrangement genuinely differs — copy anchored bottom
          left instead of centred, no eyebrow, no scroll cue, and a button
          that does not exist on desktop. Forcing one tree to be both would
          need a class on nearly every node.
          ------------------------------------------------------------------ */}
      <div className="relative mt-auto flex w-full flex-col items-start gap-2 px-5 pb-8 sm:hidden">
        <h1 className="font-display text-[52px] font-light leading-[0.95] tracking-[-1.6px] text-white">
          <span className="sw-line">
            <span style={{ animationDelay: "150ms" }}>{headlineText}</span>
          </span>
        </h1>

        <p className="font-body text-[17px] leading-[1.35] text-white/85">
          <span className="sw-line">
            <span style={{ animationDelay: "400ms" }}>{subtextText}</span>
          </span>
        </p>

        <a
          href="#shop"
          className="sw-fade-up mt-5 flex h-[54px] w-full items-center justify-center gap-3 rounded-full border border-white/60 font-body text-[16px] text-white transition-colors duration-300 active:bg-white/15"
          style={{ animationDelay: "650ms" }}
        >
          Shop products
          <svg
            width="22"
            height="14"
            viewBox="0 0 24 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="0" y1="7" x2="22" y2="7" />
            <polyline points="16 1 22 7 16 13" />
          </svg>
        </a>
      </div>
    </section>
  );
}
