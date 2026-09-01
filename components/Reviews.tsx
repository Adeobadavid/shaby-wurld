/**
 * Reviews — Figma node 322:1682. Replaces the old placeholder PNG with
 * real structured content (reviewer name, review text, star rating, and
 * a gallery of UGC-style customer photos).
 *
 * Photos are generic placeholders — these are customer-style shots in
 * the Figma reference (not competitor branding), just need real UGC
 * once you have it.
 */

const REVIEW = {
  name: "Tinuade",
  text: "The lip combo is a bold, all gender inclusive, and modern cosmetic brand which is Global and unapologetically stylish.",
  rating: 5,
};

const GALLERY_CAPTION = ["@tinuade - Lip Balm and", "Matte brown gloss"];

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

export default function Reviews() {
  return (
    <section
      data-figma-node="322:1682"
      className="flex w-full flex-col items-start gap-12 bg-white px-6 py-16 sm:px-10 sm:py-16 lg:flex-row lg:justify-between lg:px-[130px] lg:py-[60px]"
    >
      <div className="flex flex-col items-start gap-[78px]">
        <div className="flex flex-col items-start gap-[13px]">
          <h2 className="font-display text-[32px] text-black sm:text-[45px]">Reviews</h2>
          <div className="flex flex-col items-start gap-[25px]">
            <div className="flex flex-col items-start gap-[10px]">
              <div className="flex items-center gap-[5px]">
                <span className="h-px w-[21px] bg-[#262626]" />
                <p className="font-body text-[16px] text-[#262626]">{REVIEW.name}</p>
              </div>
              <p className="max-w-[343px] pl-[25px] font-body text-[16px] text-[#707070]">{REVIEW.text}</p>
            </div>
            <div className="pl-[25px]">
              <StarRow rating={REVIEW.rating} />
            </div>
          </div>
        </div>
        <div className="h-[2px] w-[37px] bg-sw-blush pl-[25px]" />
      </div>

      <div className="flex w-full flex-wrap items-center gap-5 lg:w-auto lg:flex-nowrap">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`relative flex h-[280px] w-full min-w-[200px] flex-1 items-end overflow-hidden bg-gradient-to-br from-[#c9a89f] to-[#7a5148] p-[22px] sm:h-[311px] sm:w-[241px] sm:flex-none ${
              i === 0 ? "border-[1.5px] border-sw-blush" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <p className="relative font-body text-[14px] leading-[1.316] text-white">
              {GALLERY_CAPTION[0]}
              <br />
              {GALLERY_CAPTION[1]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
