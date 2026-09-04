import Image from "next/image";

/**
 * Brand Story — Figma node 265:1178.
 *
 * Replaced the hand-built 3-photo/logo layout with the client's own
 * Figma export, rasterized as ONE flat image (composite.webp) — this
 * guarantees pixel-exact overlap/rotation/logo placement straight from
 * the source file instead of my earlier percentage-based approximation.
 * "Beauty made for you." stays as real HTML text (not baked into the
 * image) positioned over it, for editability/accessibility/SEO.
 *
 * DB note: swap /public/brand-story/composite.webp for a CMS image field
 * later — same pattern as the Perfect Liner note above.
 *
 * One of the three photos in this composite (leftmost) is a real
 * "Belor Design" product shot — same placeholder caveat as elsewhere;
 * the other two are genuine Shaby Wurld branding.
 */
export type BrandStoryProps = {
  heading?: string;
  body?: string;
  images?: string[];
};

const DEFAULT_HEADING = "Beauty made for you.";
const DEFAULT_BODY =
  "Shaby wurld is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish edge elegance soft meets fierce inclusive, expressive, and youthful — feels luxury but not intimidating";

export default function BrandStory({ heading, body, images }: BrandStoryProps = {}) {
  // The composite is a single flat export from Figma; a Sanity upload
  // replaces it wholesale when one is provided.
  const composite = images?.[0] ?? "/brand-story/composite.webp";

  return (
    <section
      id="about"
      data-figma-node="265:1178"
      className="mt-8 flex w-full flex-col items-center gap-16 bg-[#fbf7f5] px-6 pb-16 pt-16 sm:mt-10 sm:px-16 sm:pb-20 sm:pt-20 lg:mt-[50px] lg:px-[127px] lg:pb-[70px] lg:pt-[160px]"
    >
      <div className="flex w-full max-w-[1186px] flex-col items-center gap-16">
        <div className="relative w-full" style={{ aspectRatio: "1600/733" }}>
          <Image
            src={composite}
            alt="Shaby Wurld product photography"
            fill
            sizes="1186px"
            className="object-contain"
          />
          <p
            className="absolute text-right font-display text-[24px] leading-[0.95] text-black sm:text-[36px] lg:text-[50px]"
            style={{ left: "59%", top: "-14%", width: "31%" }}
          >
            {heading ?? DEFAULT_HEADING}
          </p>
        </div>

        <div className="-mt-10 flex w-full max-w-[496px] flex-col items-center gap-[50px] text-center lg:-mt-[81px] lg:items-start lg:text-left">
          <p className="whitespace-pre-line font-body text-[16px] leading-[1.35] text-[#707070]">
            {body ?? DEFAULT_BODY}
          </p>
          <a
            href="#shop"
            className="flex w-full max-w-[334px] items-center justify-center gap-[15px] bg-sw-blush py-[15px] font-body text-[16px] text-sw-cream transition-colors hover:bg-[#95402f]"
          >
            Shop products
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
