import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import PerfectLiner from "@/components/PerfectLiner";
import BrandStory from "@/components/BrandStory";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import StructuredData from "@/components/StructuredData";

import { getProducts, getReviews, getSiteSettings } from "@/sanity/queries";

/**
 * Server component: content is fetched here and passed down as props, so no
 * Sanity credentials or query logic ever reach the browser.
 *
 * Revalidates every 60s (see sanity/queries.ts), which is what makes Studio
 * edits appear without a redeploy.
 */
export const revalidate = 60;

export default async function Home() {
  // One round of fetches in parallel rather than a waterfall.
  const [settings, products, reviews] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getReviews(),
  ]);

  /**
   * The Lip Scrub gets the feature strip rather than a grid tab, so it is
   * pulled out here and excluded from the grid below — otherwise it would
   * appear twice on the page.
   */
  const featured = products.find((p) => p.category === "Lip Scrub") ?? null;
  const gridProducts = products.filter((p) => p.category !== "Lip Scrub");

  return (
    <main className="relative">
      <StructuredData
        settings={settings}
        products={products}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}
      />
      {/* Hero animates on load, so it isn't wrapped — everything below it
          reveals as you scroll to it. */}
      <Hero
        eyebrow={settings?.heroEyebrow}
        headline={settings?.heroHeadline}
        subtext={settings?.heroSubtext}
        image={settings?.heroImage}
      />
      <Reveal>
        <Benefits benefits={settings?.benefits} />
      </Reveal>
      <Reveal>
        <BestSellers products={gridProducts} />
      </Reveal>
      <Reveal>
        <PerfectLiner product={featured} />
      </Reveal>
      <Reveal>
        <BrandStory
          heading={settings?.storyHeading}
          body={settings?.storyBody}
          images={settings?.storyImages}
        />
      </Reveal>
      <Reveal>
        <Reviews reviews={reviews} />
      </Reveal>
      <Footer
        contactPhone={settings?.contactPhone}
        contactEmail={settings?.contactEmail}
        contactAddress={settings?.contactAddress}
        footerNote={settings?.footerNote}
        socialLinks={settings?.socialLinks}
      />
    </main>
  );
}
