import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { getSiteSettings } from "@/sanity/queries";
import QuickView from "@/components/QuickView";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const FALLBACK_TITLE = "Shaby Wurld — Lip gloss, liner and balm for every skin tone";
const FALLBACK_DESCRIPTION =
  "Bold, inclusive lip colour made for deeper skin tones. Glosses, twist-up liners, tinted balms and lip scrub, delivered across Nigeria.";

/**
 * Built at request time so the search title and description are editable in
 * the Studio (Site Settings -> Search & Sharing) rather than hardcoded.
 *
 * metadataBase matters more than it looks: without it, Open Graph and Twitter
 * image paths stay relative, and neither WhatsApp nor X will resolve them —
 * shared links show no preview at all.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);

  const title = settings?.seoTitle?.trim() || FALLBACK_TITLE;
  const description = settings?.seoDescription?.trim() || FALLBACK_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Sub-pages set only their own name and get the brand appended.
      template: "%s | Shaby Wurld",
    },
    description,
    applicationName: "Shaby Wurld",
    keywords: [
      "lip gloss Nigeria",
      "lip liner for dark skin",
      "tinted lip balm",
      "lip scrub",
      "inclusive makeup Nigeria",
      "Shaby Wurld",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: "Shaby Wurld",
      title,
      description,
      url: SITE_URL,
      locale: "en_NG",
      ...(settings?.seoImage ? { images: [{ url: settings.seoImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(settings?.seoImage ? { images: [settings.seoImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Lets Google show full-size image previews, which matters a lot for
        // a product site in image search.
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
      <html lang="en" className={instrumentSans.variable}>
        <body className="font-body antialiased">
          <CartProvider>
            {children}
            {/* Overlays live here, above the provider, so they mount once
                for the whole app rather than per page. */}
            <QuickView />
            <CartDrawer />
          </CartProvider>
        </body>
    </html>
  )
}
