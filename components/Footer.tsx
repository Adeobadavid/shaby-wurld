/**
 * Footer — Figma node 265:1220. Uses the same real logo-lockup.svg as
 * the Hero nav (Figma's "Frame 20" node — same asset, different context).
 *
 * The phone/email in the Figma reference (+44 509 333 333,
 * hello.builtbydave@gmail.com) are template placeholder values, not
 * Shaby Wurld's real contact info — swap these before launch.
 */

const SHOP_LINKS = ["All Products", "Lip Gloss", "Lip Liner", "Lip Balm"];
const SOCIAL_LINKS = ["Instagram", "Facebook", "Whatsapp"];
const ABOUT_LINKS = ["Privacy Policy", "Terms of Service", "Return Policy"];

type FooterLink = { label: string; href: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex w-[114px] flex-col items-start gap-[10px] leading-[1.2]">
      <p className="font-body text-[14px] font-semibold text-[#81716e]">{title}</p>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.href.startsWith("http")
            ? // Untrusted outbound links: noopener stops the target page
              // reaching back through window.opener.
              { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="font-body text-[14px] text-[#81716e] transition-colors duration-200 hover:text-[#262626]"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export type FooterProps = {
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  footerNote?: string;
  socialLinks?: { platform: string; url: string }[];
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
};

export default function Footer({
  contactPhone,
  contactEmail,
  contactAddress,
  footerNote,
  socialLinks,
}: FooterProps = {}) {
  // Sanity first, hardcoded defaults second — the footer must still render
  // before Site Settings has been filled in.
  const phone = contactPhone ?? "+44 509 333 333";
  const email = contactEmail ?? "hello.builtbydave@gmail.com";
  const note = footerNote ?? "Copyright @ 2026 Shaby Wurld";

  const social: FooterLink[] =
    socialLinks && socialLinks.length > 0
      ? socialLinks.map((s) => ({
          label: PLATFORM_LABELS[s.platform] ?? s.platform,
          href: s.url,
        }))
      : SOCIAL_LINKS.map((s) => ({ label: s, href: "#" }));

  const shop: FooterLink[] = SHOP_LINKS.map((s) => ({ label: s, href: "#shop" }));
  const about: FooterLink[] = ABOUT_LINKS.map((s) => ({ label: s, href: "#" }));

  return (
    <footer id="contact" data-figma-node="265:1220" className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-start gap-[50px] bg-[#f7eeeb] pt-[35px]">
        <div className="flex w-full flex-col items-start gap-8 px-6 sm:px-10 lg:gap-5 lg:px-[60px]">
          <img src="/icons/logo-text.webp" alt="Shaby Wurld" className="h-[26px] w-auto" />

          <div className="flex w-full flex-col gap-10 text-[14px] text-[#81716e] lg:flex-row lg:justify-between">
            <div className="flex flex-col justify-center gap-[35px] font-body">
              <p className="max-w-[247px] leading-[1.5]">
                Luxury lip essentials crafted for confidence, comfort, and everyday elegance.
              </p>
              <div className="flex flex-col gap-[19px]">
                <p>
                  Call:{" "}
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="transition-colors hover:text-[#262626]"
                  >
                    {phone}
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${email}`} className="transition-colors hover:text-[#262626]">
                    {email}
                  </a>
                </p>
                {contactAddress && <p className="max-w-[247px] leading-[1.5]">{contactAddress}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-10 sm:gap-16 lg:gap-0 lg:justify-between lg:w-[623px]">
              <FooterColumn title="Shop by" links={shop} />
              <FooterColumn title="Social media" links={social} />
              <FooterColumn title="About us" links={about} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2 bg-sw-blush px-6 py-[27px] text-[14px] text-sw-cream sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[60px]">
          <p className="font-body">UK - English</p>
          <p className="font-body">{note}</p>
        </div>
      </div>
    </footer>
  );
}
