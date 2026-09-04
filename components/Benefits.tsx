/**
 * Benefits strip — Figma node 265:1122.
 * Icons pulled exactly from the same icon sets Figma used:
 * material-symbols-light, iconoir, la (Line Awesome), ri (Remix Icon).
 *
 * Horizontal padding set to 6x the nav's 70px margin per direction
 * (Figma's own value here is 169px — overridden per explicit request).
 */

const BENEFITS = [
  {
    label: "Cruelty-Free",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M9.52 21q-1.453 0-2.486-1.005T6 17.577q0-.721.339-1.343q.338-.623 1.084-1.273q.458-.38.788-.802t.708-.832q-1.121-1.72-1.703-3.568q-.582-1.85-.582-3.663q0-1.104.275-1.638q.275-.535.822-.535q.828 0 1.733 1.039Q10.367 6 11 7.38q.417.923.663 1.926q.245 1.003.337 1.995q.092-.992.347-1.995t.659-1.926q.607-1.38 1.521-2.42t1.742-1.038q.547 0 .822.535q.274.534.274 1.638q0 1.814-.581 3.663q-.582 1.849-1.703 3.568q.378.41.708.832t.788.803q.746.65 1.084 1.272T18 17.577q0 1.414-1.034 2.418Q15.933 21 14.481 21q-.933 0-1.707-.308L12 20.385l-.774.307Q10.452 21 9.519 21m.077-1q.517 0 1.092-.147t1.075-.422q-.236-.125-.432-.377q-.197-.252-.197-.438q0-.2.25-.322q.249-.121.616-.121q.348 0 .588.13t.239.313q0 .186-.196.438t-.433.377q.5.275 1.075.422t1.093.147q1.088 0 1.842-.706q.753-.706.753-1.717q0-.527-.278-.971q-.28-.445-.856-.927q-.312-.262-.479-.448q-.167-.187-.417-.504q-.86-1.125-1.392-1.426T11.98 13t-1.56.301q-.537.301-1.39 1.426q-.25.317-.418.504t-.478.448q-.577.483-.856.927T7 17.577q0 1.012.754 1.717T9.596 20m.904-3.25q-.2 0-.35-.225T10 16t.15-.525t.35-.225t.35.225T11 16t-.15.525t-.35.225m3 0q-.2 0-.35-.225T13 16t.15-.525t.35-.225t.35.225T14 16t-.15.525t-.35.225m-3.848-4.148q.314-.238.673-.37t.785-.178q-.05-1.085-.324-2.195q-.274-1.111-.73-2.124q-.494-1.116-1.108-1.851q-.613-.736-1.188-.936q-.05.189-.088.455t-.038.636q0 1.603.528 3.315t1.49 3.248m4.696 0q.961-1.536 1.49-3.248q.527-1.712.527-3.315q0-.37-.037-.636q-.038-.266-.088-.455q-.575.2-1.188.936q-.614.735-1.108 1.85q-.45 1.014-.724 2.125t-.33 2.195q.414.042.773.176t.685.372" />
      </svg>
    ),
  },
  {
    label: "Vegan Friendly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <path d="M15 11.063C12.53 13.65 10.059 20 10.059 20S6.529 11.063 3 9" />
        <path d="m20.496 5.577l.426 4.424c.276 2.87-1.875 5.425-4.745 5.702c-2.816.27-5.367-1.788-5.638-4.604a5.12 5.12 0 0 1 4.608-5.59l4.716-.454a.58.58 0 0 1 .633.522" />
      </svg>
    ),
  },
  {
    label: "Fast Shipping",
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8">
        <path d="M0 6v2h19v15h-6.156c-.446-1.719-1.992-3-3.844-3s-3.398 1.281-3.844 3H4v-5H2v7h3.156c.446 1.719 1.992 3 3.844 3s3.398-1.281 3.844-3h8.312c.446 1.719 1.992 3 3.844 3s3.398-1.281 3.844-3H32v-8.156l-.063-.157l-2-6L29.72 10H21V6zm1 4v2h9v-2zm20 2h7.281L30 17.125V23h-1.156c-.446-1.719-1.992-3-3.844-3s-3.398 1.281-3.844 3H21zM2 14v2h6v-2zm7 8c1.117 0 2 .883 2 2s-.883 2-2 2s-2-.883-2-2s.883-2 2-2m16 0c1.117 0 2 .883 2 2s-.883 2-2 2s-2-.883-2-2s.883-2 2-2" />
      </svg>
    ),
  },
  {
    label: "Secure Checkout",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="m11.005 2l7.298 2.28a1 1 0 0 1 .702.955V7h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1l-3.22.001c-.387.51-.857.96-1.4 1.33L11.005 22l-5.38-3.668a6 6 0 0 1-2.62-4.958V5.235a1 1 0 0 1 .702-.954zm0 2.094l-6 1.876v7.404a4 4 0 0 0 1.558 3.169l.189.136l4.253 2.9L14.787 17h-4.782a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h7V5.97zm0 7.906v3h9v-3zm0-2h9V9h-9z" />
      </svg>
    ),
  },
];

/**
 * Content comes from Sanity (Site Settings -> Benefits). The built-in list
 * above is the fallback, so the strip still renders correctly before any
 * content has been entered — an empty CMS should never produce an empty page.
 *
 * Icons stay in code: they're inline SVG paths from the same icon sets the
 * design used, and they inherit `currentColor`. A Sanity-uploaded icon image
 * overrides them when one is provided.
 */
export type BenefitItem = { title: string; description?: string; icon?: string };

export default function Benefits({ benefits }: { benefits?: BenefitItem[] }) {
  const items =
    benefits && benefits.length > 0
      ? benefits.map((b) => ({
          label: b.title,
          iconUrl: b.icon,
          // Reuse the matching built-in icon when the titles line up.
          icon: BENEFITS.find(
            (d) => d.label.toLowerCase() === b.title.trim().toLowerCase()
          )?.icon,
        }))
      : BENEFITS.map((b) => ({ label: b.label, icon: b.icon, iconUrl: undefined }));

  return (
    <div
      data-figma-node="265:1122"
      className="flex w-full flex-nowrap items-center justify-between gap-2 bg-[#f7eeeb] px-3 py-4 sm:flex-wrap sm:justify-center sm:gap-10 sm:px-[210px] sm:py-8 lg:gap-[50px] lg:px-[420px] lg:py-[35px]"
    >
      {items.map((benefit, i) => (
        <div
          key={benefit.label}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:flex-none sm:gap-10 lg:gap-[50px]"
        >
          {/* Mobile: icon above label, small type, so all four fit one row.
              The old 210px side padding left almost no room and forced a wrap. */}
          <div className="group flex min-w-0 flex-col items-center gap-1 text-[#d68073] sm:flex-row sm:gap-[10px]">
            <span className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[3px] [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-8 sm:[&>svg]:w-8">
              {benefit.iconUrl ? (
                <img src={benefit.iconUrl} alt="" className="h-5 w-5 sm:h-8 sm:w-8" />
              ) : (
                benefit.icon
              )}
            </span>
            <span className="text-center font-body text-[10px] font-medium leading-tight sm:whitespace-nowrap sm:text-[16px]">
              {benefit.label}
            </span>
          </div>
          {i < items.length - 1 && (
            <span className="hidden h-[27px] w-px bg-[#d68073]/30 sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}
