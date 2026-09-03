"use client";

import { useEffect, useState } from "react";

/**
 * Reviews — Figma node 322:1682. The thin bar under the stars (322:1704)
 * is a progress track/fill pair, not decoration — it's the auto-advance
 * progress indicator, confirmed from the raw export (bg-[#f2e4d2] track +
 * bg-[#d68073] fill). Rebuilt as a real auto-advancing carousel: review
 * text/name/rating change together with the highlighted gallery photo
 * every few seconds, with a subtle slide-in on the new photo.
 *
 * Array supports up to 10 reviews — only 4 distinct customer photos exist
 * right now so a couple of entries reuse them; add more as real UGC comes in.
 */

const ADVANCE_MS = 5000;

const REVIEWS = [
  { name: "Tinuade", text: "The lip combo is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish.", rating: 5, image: "/brand-story/photo-1.webp", caption: "@tinuade - Lip Balm and Matte brown gloss" },
  { name: "Amara", text: "First time trying a Nigerian lip brand and I'm obsessed. The gloss doesn't feel sticky and it actually lasts through lunch.", rating: 5, image: "/brand-story/photo-2.webp", caption: "@amara - Deep brown gloss" },
  { name: "Chiamaka", text: "Shade range finally makes sense for deeper skin tones. The liner glides on smooth, no tugging at all.", rating: 4, image: "/brand-story/photo-3.webp", caption: "@chiamaka - Rodo Spice liner" },
  { name: "Feyisayo", text: "Delivery was fast and the packaging alone felt luxury. The lip balm has become a permanent bag item for me.", rating: 5, image: "/products/placeholder-2.webp", caption: "@feyisayo - Natural tinted balm" },
];

export default function Reviews() {
  const [index, setIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % REVIEWS.length);
      setProgressKey((k) => k + 1);
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const active = REVIEWS[index];
  const slots = [0, 1, 2].map((offset) => REVIEWS[(index + offset) % REVIEWS.length]);

  return (
    <section
      data-figma-node="322:1682"
      className="flex w-full flex-col items-start gap-12 bg-white px-6 py-20 sm:px-10 sm:py-24 lg:flex-row lg:justify-between lg:px-[130px] lg:py-32"
    >
      <div className="flex flex-col items-start gap-[78px]">
        <div className="flex flex-col items-start gap-[13px]">
          <h2 className="font-display text-[32px] text-black sm:text-[45px]">Reviews</h2>
          <div className="flex flex-col items-start gap-[25px]">
            <div key={index} className="flex animate-review-slide flex-col items-start gap-[10px]">
              <div className="flex items-center gap-[5px]">
                <span className="h-px w-[21px] bg-[#262626]" />
                <p className="font-body text-[16px] text-[#262626]">{active.name}</p>
              </div>
              <p className="max-w-[343px] pl-[25px] font-body text-[16px] text-[#707070]">{active.text}</p>
            </div>
            <div className="pl-[25px]">
              <StarRow rating={active.rating} />
            </div>
          </div>
        </div>
        <div className="w-[50px] overflow-hidden bg-[#f2e4d2] pl-[25px]">
          <div key={progressKey} className="h-[2px] w-full origin-left animate-[progress-fill_5s_linear] bg-sw-blush" />
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-5 lg:w-auto lg:flex-nowrap">
        {slots.map((review, slotIndex) => (
          <div
            key={`${index}-${slotIndex}`}
            className={`relative flex h-[280px] w-full min-w-[200px] flex-1 animate-review-slide items-end overflow-hidden p-[22px] sm:h-[311px] sm:w-[241px] sm:flex-none ${
              slotIndex === 0 ? "border-[1.5px] border-sw-blush" : ""
            }`}
          >
            <img src={review.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <p className="relative font-body text-[14px] leading-[1.316] text-white">{review.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i < rating ? "#d68073" : "none"} stroke="#d68073" strokeWidth="1.2">
          <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}
