"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

/**
 * Reviews — laid out to the supplied reference.
 *
 * Reading left to right: a raised white card for the previous review sitting
 * low in the band, the active reviewer's portrait with their attribution
 * BELOW it, their quote to the right, and the next review as a dark card with
 * its name and rating over the image. The prev arrow floats high on the left,
 * the next arrow low on the right — the asymmetry is from the reference and
 * is what stops the row reading as a plain filmstrip.
 *
 * Square corners and the site's own type, per the brief; the reference's
 * rounded cards and grotesque are not used.
 *
 * The reference puts each reviewer's EMAIL under their name. That slot here
 * holds the product they reviewed instead — publishing a customer's email
 * address is a privacy problem however good it looks, and the product is
 * more use to a shopper anyway.
 */

const ADVANCE_MS = 6000;

export type ReviewItem = {
  _id: string;
  name: string;
  text: string;
  rating: number;
  photo?: string;
  productName?: string;
};

const FALLBACK_PHOTO = "/brand-story/photo-1.webp";

export default function Reviews({ reviews }: { reviews?: ReviewItem[] }) {
  const list = reviews ?? [];
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (list.length < 2) return;
      setIndex((i) => (i + direction + list.length) % list.length);
      setCycle((c) => c + 1);
    },
    [list.length]
  );

  useEffect(() => {
    if (list.length < 2) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % list.length);
      setCycle((c) => c + 1);
    }, ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [list.length, cycle, index]);

  // Invented testimonials on a real storefront are a legal problem, not just
  // a design one, so an empty list renders nothing.
  if (list.length === 0) return null;

  const active = list[index];
  const prev = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];

  return (
    <section
      id="reviews"
      className="w-full overflow-hidden bg-[#f7f4f2] px-6 py-20 sm:px-10 sm:py-24 lg:px-[70px]"
    >
      {/* Header */}
      <div className="flex max-w-[560px] flex-col gap-4">
        <p className="font-body text-[13px] text-[#8b8280]">What they say about us</p>
        <h2 className="font-display text-[36px] leading-[1.05] text-[#262626] sm:text-[52px] lg:text-[60px]">
          Reviews from our users
        </h2>
        <p className="font-body text-[14px] leading-[1.65] text-[#8b8280] sm:text-[15px]">
          Real words from people wearing Shaby Wurld — on shade range, on how it
          feels after six hours, and on whether it actually flatters deeper skin.
        </p>
      </div>

      {/* ------------------------------------------------------------------
          Carousel band. A 4-column grid on desktop so each piece can sit at
          its own vertical position, which a flex row cannot do without
          fighting alignment on every child.
          ------------------------------------------------------------------ */}
      <div className="relative mt-14 hidden lg:grid lg:grid-cols-[300px_280px_1fr_230px] lg:items-end lg:gap-8">
        {/* Prev arrow — floats high on the left, over the gap. */}
        <button
          onClick={() => go(-1)}
          disabled={list.length < 2}
          aria-label="Previous review"
          className="absolute left-[92px] top-[10px] z-20 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#262626] text-white transition-colors duration-300 hover:bg-sw-blush disabled:opacity-30"
        >
          <Arrow direction="prev" />
        </button>

        {/* Previous review — raised white card, sitting low. */}
        <button
          key={`card-${prev._id}`}
          onClick={() => go(-1)}
          aria-label={`Show ${prev.name}'s review`}
          className="sw-shade-fade mb-[-28px] flex items-center gap-4 bg-white p-5 text-left shadow-[0_18px_44px_-26px_rgba(38,25,22,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
        >
          <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full">
            <Image src={prev.photo ?? FALLBACK_PHOTO} alt="" fill sizes="52px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <p className="truncate font-body text-[15px] font-medium text-[#262626]">{prev.name}</p>
            <p className="truncate font-body text-[12px] text-[#a79b99]">
              {prev.productName ?? "Verified customer"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-body text-[11px] text-[#a79b99]">Grade</span>
            <div className="flex items-center gap-1.5">
              <span className="font-body text-[15px] font-medium text-[#262626]">
                {prev.rating.toFixed(1)}
              </span>
              <StarRow rating={prev.rating} size={11} />
            </div>
          </div>
        </button>

        {/* Active portrait, with its attribution underneath. */}
        <div className="flex flex-col gap-5">
          <div
            key={`photo-${active._id}`}
            className="sw-shade-fade relative h-[300px] w-full overflow-hidden"
          >
            <Image
              src={active.photo ?? FALLBACK_PHOTO}
              alt={`${active.name}, verified customer`}
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <p className="truncate font-body text-[15px] font-medium text-[#262626]">
                {active.name}
              </p>
              <p className="truncate font-body text-[12px] text-[#a79b99]">
                {active.productName ?? "Verified customer"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-body text-[11px] text-[#a79b99]">Grade</span>
              <div className="flex items-center gap-1.5">
                <span className="font-body text-[15px] font-medium text-[#262626]">
                  {active.rating.toFixed(1)}
                </span>
                <StarRow rating={active.rating} size={11} />
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div key={`quote-${active._id}`} className="sw-shade-fade flex flex-col gap-5 pb-16">
          <p className="font-body text-[14px] leading-[1.85] text-[#a09795]">
            &ldquo;{active.text}&rdquo;
          </p>
          <div className="h-[2px] w-[80px] overflow-hidden bg-[#e6ded9]">
            <div
              key={cycle}
              className="h-full w-full origin-left animate-[progress-fill_6s_linear] bg-sw-blush"
            />
          </div>
        </div>

        {/* Next review — dark card with the name and rating over the photo. */}
        <button
          key={`next-${next._id}`}
          onClick={() => go(1)}
          aria-label={`Show ${next.name}'s review`}
          className="sw-shade-fade group relative mb-16 h-[190px] w-full overflow-hidden text-left"
        >
          <Image
            src={next.photo ?? FALLBACK_PHOTO}
            alt=""
            fill
            sizes="230px"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
            <p className="truncate font-body text-[14px] font-medium text-white">{next.name}</p>
            <div className="flex shrink-0 items-center gap-1">
              <span className="font-body text-[12px] text-white">{next.rating.toFixed(1)}</span>
              <StarRow rating={next.rating} size={9} light />
            </div>
          </div>
        </button>

        {/* Next arrow — low on the right, mirroring the prev arrow's offset. */}
        <button
          onClick={() => go(1)}
          disabled={list.length < 2}
          aria-label="Next review"
          className="absolute bottom-[6px] right-[254px] z-20 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#262626] text-white transition-colors duration-300 hover:bg-sw-blush disabled:opacity-30"
        >
          <Arrow direction="next" />
        </button>
      </div>

      {/* ------------------------------------------------------------------
          Below lg the four-across arrangement has nowhere to go, so it
          collapses to the active review plus arrows.
          ------------------------------------------------------------------ */}
      <div className="mt-12 flex flex-col gap-6 lg:hidden">
        <div key={`m-photo-${active._id}`} className="sw-shade-fade relative h-[320px] w-full overflow-hidden">
          <Image
            src={active.photo ?? FALLBACK_PHOTO}
            alt={`${active.name}, verified customer`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div key={`m-quote-${active._id}`} className="sw-shade-fade flex flex-col gap-4">
          <p className="font-body text-[15px] leading-[1.7] text-[#3d3d3d]">
            &ldquo;{active.text}&rdquo;
          </p>
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <p className="truncate font-body text-[15px] font-medium text-[#262626]">
                {active.name}
              </p>
              <p className="truncate font-body text-[12px] text-[#a79b99]">
                {active.productName ?? "Verified customer"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="font-body text-[15px] font-medium text-[#262626]">
                {active.rating.toFixed(1)}
              </span>
              <StarRow rating={active.rating} size={11} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="h-[2px] w-[80px] overflow-hidden bg-[#e6ded9]">
            <div
              key={`m-${cycle}`}
              className="h-full w-full origin-left animate-[progress-fill_6s_linear] bg-sw-blush"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              disabled={list.length < 2}
              aria-label="Previous review"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#262626] text-white transition-colors duration-300 disabled:opacity-30"
            >
              <Arrow direction="prev" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={list.length < 2}
              aria-label="Next review"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#262626] text-white transition-colors duration-300 disabled:opacity-30"
            >
              <Arrow direction="next" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={direction === "prev" ? "rotate-180" : ""}
    >
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

function StarRow({
  rating,
  size = 12,
  light = false,
}: {
  rating: number;
  size?: number;
  light?: boolean;
}) {
  const colour = light ? "#ffffff" : "#e0a33f";

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? colour : "none"}
          stroke={colour}
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path
            d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7z"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
