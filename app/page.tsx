import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import PerfectLiner from "@/components/PerfectLiner";
import BrandStory from "@/components/BrandStory";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Benefits />
      <BestSellers />
      <PerfectLiner />
      <BrandStory />
      <Reviews />
      <Footer />
    </main>
  );
}
