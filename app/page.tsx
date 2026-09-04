import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import PerfectLiner from "@/components/PerfectLiner";
import BrandStory from "@/components/BrandStory";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

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

  return (
    <main className="relative">
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
        <BestSellers products={products} />
      </Reveal>
      <Reveal>
        <PerfectLiner />
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
