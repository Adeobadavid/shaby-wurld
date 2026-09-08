"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

/**
 * Reviews carousel, built to the supplied reference: a header block, then a
 * row where the active review's photo is large and centred, its quote sits
 * alongside, and the neighbouring reviews peek in at reduced size.
 *
 * Deliberately NOT copied from the reference: it showed each reviewer's email
 * address. Publishing a customer's email is a privacy problem regardless of
 * how the design looks, so the attribution here is a first name and a rating.
 *
 * Auto-advances, but any manual navigation resets the timer — otherwise the
 * slide someone just chose gets pulled away mid-read.
 */

const ADVANCE_MS = 6000;

export type ReviewItem = {
  _id: string;
  name: string;
  text: string;
  rating: number;
  photo?: string;
};

const FALLBACK_PHOTO = "/brand-story/photo-1.webp";

export default function Reviews({ reviews }: { reviews?: ReviewItem[] }) {
  const list = reviews ?? [];
  const [index, setIndex] = useState(0);
  // Bumping this restarts both the auto-advance timer and the progress bar.
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

  // Nothing to show rather than invented testimonials: fake reviews on a real
  // storefront are a legal problem, not just a design one.
  if (list.length === 0) return null;

  const active = list[index];
  const prev = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];

  return (
    <section
      id="reviews"
      className="w-full overflow-hidden bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-[70px]"
    >
      {/* Header */}
      <div className="flex max-w-[620px] flex-col gap-4">
        <p className="font-body text-[13px] uppercase tracking-[0.18em] text-sw-blush">
          What they say about us
        </p>
        <h2 className="font-display text-[34px] leading-[1.05] text-[#262626] sm:text-[48px] lg:text-[56px]">
          Reviews from our customers
        </h2>
        <p className="font-body text-[15px] leading-[1.6] text-[#797979] sm:text-[16px]">
          Real words from people wearing Shaby Wurld — on shade range, on how it
          feels after six hours, and on whether it actually flatters deeper skin.
        </p>
      </div>

      {/* Carousel */}
      <div className="mt-12 flex items-center gap-4 sm:mt-16 sm:gap-6">
        <ArrowButton
          direction="prev"
          onClick={() => go(-1)}
          disabled={list.length < 2}
        />

        <div className="flex min-w-0 flex-1 items-stretch gap-5 sm:gap-8">
          {/* Peeking previous — hidden below lg, where there is no room and it
              would squeeze the active photo to a sliver. */}
          {list.length > 2 && (
            <PeekCard review={prev} onClick={() => go(-1)} className="hidden lg:flex" />
          )}

          {/* Active photo */}
          <div
            key={`photo-${active._id}`}
            className="sw-shade-fade relative h-[320px] w-[190px] shrink-0 overflow-hidden sm:h-[420px] sm:w-[280px]"
          >
            <Image
              src={active.photo ?? FALLBACK_PHOTO}
              alt={`${active.name}, verified customer`}
              fill
              sizes="(min-width: 640px) 280px, 190px"
              className="object-cover"
            />
          </div>

          {/* Quote */}
          <div
            key={`quote-${active._id}`}
            className="sw-shade-fade flex min-w-0 flex-1 flex-col justify-center gap-6"
          >
            <p className="font-body text-[15px] leading-[1.7] text-[#3d3d3d] sm:text-[17px] lg:text-[18px]">
              &ldquo;{active.text}&rdquo;
            </p>

            <div className="flex flex-col gap-2">
              <p className="font-body text-[15px] font-medium text-[#262626]">
                {active.name}
              </p>
              <div className="flex items-center gap-3">
                <StarRow rating={active.rating} />
                <span className="font-body text-[14px] text-[#a79b99]">
                  {active.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Progress — restarts with the cycle, so it always reflects the
                time remaining on the slide actually showing. */}
            <div className="h-[2px] w-[90px] overflow-hidden bg-[#f2e4d2]">
              <div
                key={cycle}
                className="h-full w-full origin-left animate-[progress-fill_6s_linear] bg-sw-blush"
              />
            </div>
          </div>

          {list.length > 1 && (
            <PeekCard review={next} onClick={() => go(1)} className="hidden lg:flex" />
          )}
        </div>

        <ArrowButton
          direction="next"
          onClick={() => go(1)}
          disabled={list.length < 2}
        />
      </div>
    </section>
  );
}

/** A neighbouring review: photo with the name and rating over a scrim. */
function PeekCard({
  review,
  onClick,
  className = "",
}: {
  review: ReviewItem;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Show ${review.name}'s review`}
      className={`group relative h-[420px] w-[190px] shrink-0 items-end overflow-hidden opacity-70 transition-opacity duration-500 hover:opacity-100 ${className}`}
    >
      <Image
        src={review.photo ?? FALLBACK_PHOTO}
        alt=""
        fill
        sizes="190px"
        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="relative flex w-full flex-col items-start gap-1 p-4 text-left">
        <p className="font-body text-[14px] font-medium text-white">{review.name}</p>
        <div className="flex items-center gap-1.5">
          <StarRow rating={review.rating} size={13} light />
          <span className="font-body text-[12px] text-white/80">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous review" : "Next review"}
      className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-[#ddd5d4] text-[#262626] transition-colors duration-300 hover:border-sw-blush hover:bg-sw-blush hover:text-sw-cream disabled:cursor-not-allowed disabled:opacity-35 sm:h-[52px] sm:w-[52px]"
    >
      <svg
        width="18"
        height="18"
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
    </button>
  );
}

function StarRow({
  rating,
  size = 18,
  light = false,
}: {
  rating: number;
  size?: number;
  light?: boolean;
}) {
  const colour = light ? "#ffffff" : "#d68073";

  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? colour : "none"}
          stroke={colour}
          strokeWidth="1.2"
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
