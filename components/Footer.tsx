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

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex w-[114px] flex-col items-start gap-[10px] leading-[1.2]">
      <p className="font-body text-[14px] font-semibold text-[#81716e]">{title}</p>
      {links.map((link) => (
        <a key={link} href="#" className="font-body text-[14px] text-[#81716e] hover:text-[#262626]">
          {link}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
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
                <p>Call: +44 509 333 333</p>
                <p>Email: hello.builtbydave@gmail.com</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-10 sm:gap-16 lg:gap-0 lg:justify-between lg:w-[623px]">
              <FooterColumn title="Shop by" links={SHOP_LINKS} />
              <FooterColumn title="Social media" links={SOCIAL_LINKS} />
              <FooterColumn title="About us" links={ABOUT_LINKS} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2 bg-sw-blush px-6 py-[27px] text-[14px] text-sw-cream sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[60px]">
          <p className="font-body">UK - English</p>
          <p className="font-body">Copyright @ 2026 Shaby Wurld</p>
        </div>
      </div>
    </footer>
  );
}
