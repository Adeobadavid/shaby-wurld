/**
 * Footer.
 *
 * Restructured to the supplied reference: logo left, two link columns,
 * circular social buttons right, a hairline, then a legal row underneath.
 *
 * The reference is a dark warm brown, and the palette already has one —
 * #4a1c13, used for the receipt's printer slot. Reusing it keeps the footer
 * inside the system rather than introducing a second near-black, and the
 * cream-on-brown pairing is the same one the printer housing uses.
 *
 * Everything here still comes from Site Settings; only the arrangement
 * changed.
 */
import CurrencySwitcher from "./CurrencySwitcher";

const SHOP_LINKS: FooterLink[] = [
  { label: "All Products", href: "#shop" },
  { label: "Lip Gloss", href: "#shop" },
  { label: "Lip Liner", href: "#shop" },
  { label: "Lip Balm", href: "#shop" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "#about" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

type FooterLink = { label: string; href: string };

export type FooterProps = {
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  footerNote?: string;
  socialLinks?: { platform: string; url: string }[];
};

/* ------------------------------------------------------------------ *
 * Social icons.
 *
 * Inline SVG rather than an icon package: six small paths weigh nothing
 * next to a dependency, and they inherit currentColor so the circles
 * recolour with the footer.
 * ------------------------------------------------------------------ */
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14 8.5h2V5.5h-2c-2 0-3.2 1.2-3.2 3.2V11H9v3h1.8v6h3v-6H16l.5-3h-2.7V9.2c0-.5.2-.7.7-.7Z" />
  ),
  twitter: <path d="M4 4l7.5 9.5L4.5 20h2l5.6-5.2L16.5 20H20l-7.8-9.9L19.4 4h-2l-5.1 4.8L8.2 4H4Z" />,
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm4.3 12.3c-.2.5-1 1-1.5 1.1-.4 0-.9.2-3-.6-2.5-1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.2.3 0 .5l.9 1.4c.6.6 1.1.9 1.4 1 .2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1l1.9.9c.2.1.4.2.4.3v.6Z" />
  ),
  tiktok: (
    <path d="M16 3c.4 2 1.7 3.4 3.7 3.6v2.7c-1.3.1-2.6-.3-3.7-1v5.9a5.6 5.6 0 1 1-4.8-5.5v2.9a2.7 2.7 0 1 0 1.9 2.6V3H16Z" />
  ),
  youtube: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" stroke="none" />
    </>
  ),
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
};

function SocialButton({ platform, url }: { platform: string; url: string }) {
  const icon = ICONS[platform];
  const label = PLATFORM_LABELS[platform] ?? platform;

  return (
    <a
      href={url}
      target="_blank"
      // noopener stops the target page reaching back through window.opener.
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-sw-cream/35 text-sw-cream transition-colors duration-300 hover:border-sw-cream hover:bg-sw-cream hover:text-[#4a1c13]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon ?? <circle cx="12" cy="12" r="9" />}
      </svg>
    </a>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex min-w-[120px] flex-col items-start gap-[14px]">
      <p className="font-body text-[13px] font-medium text-sw-cream/55">{title}</p>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="font-body text-[14px] uppercase tracking-[0.04em] text-sw-cream underline decoration-sw-cream/35 underline-offset-[5px] transition-colors duration-200 hover:decoration-sw-cream"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function Footer({
  contactPhone,
  contactEmail,
  contactAddress,
  footerNote,
  socialLinks,
}: FooterProps = {}) {
  // Sanity first, defaults second — the footer must still render before Site
  // Settings has been filled in.
  const phone = contactPhone ?? "";
  const email = contactEmail ?? "";
  const note = footerNote ?? `© Shaby Wurld ${new Date().getFullYear()}`;

  const social = socialLinks?.filter((s) => s.url) ?? [];

  return (
    <footer id="contact" className="w-full bg-[#4a1c13]">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col px-6 pb-8 pt-14 sm:px-10 sm:pt-16 lg:px-[60px]">
        {/* Top: identity, links, social */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex max-w-[300px] flex-col gap-5">
            {/* The lockup is cream artwork, so it sits on the brown as-is. */}
            <img
              src="/icons/logo-lockup.svg"
              alt="Shaby Wurld"
              className="h-[30px] w-auto self-start"
            />

            <p className="font-body text-[14px] leading-[1.55] text-sw-cream/70">
              Luxury lip essentials crafted for confidence, comfort and everyday
              elegance.
            </p>

            <div className="flex flex-col gap-2 font-body text-[14px] text-sw-cream/70">
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="transition-colors duration-200 hover:text-sw-cream"
                >
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="transition-colors duration-200 hover:text-sw-cream"
                >
                  {email}
                </a>
              )}
              {contactAddress && (
                <p className="leading-[1.5]">{contactAddress}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-16">
            <FooterColumn title="Menu" links={SHOP_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>

          {social.length > 0 && (
            <div className="flex items-center gap-3 lg:pt-1">
              {social.map((s) => (
                <SocialButton key={s.platform} platform={s.platform} url={s.url} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 h-px w-full bg-sw-cream/20" />

        {/* Bottom: legal + currency */}
        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-[13px] text-sw-cream/70">{note}</p>

          <div className="flex flex-wrap items-center gap-6 text-sw-cream/70">
            <a
              href="#"
              className="font-body text-[13px] transition-colors duration-200 hover:text-sw-cream"
            >
              Terms of Use
            </a>
            <a
              href="#"
              className="font-body text-[13px] transition-colors duration-200 hover:text-sw-cream"
            >
              Privacy Policy
            </a>
            <CurrencySwitcher className="text-sw-cream/70" />
          </div>
        </div>
      </div>
    </footer>
  );
}
