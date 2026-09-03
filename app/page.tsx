import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import PerfectLiner from "@/components/PerfectLiner";
import BrandStory from "@/components/BrandStory";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import QuickView from "@/components/QuickView";
import BagDrawer from "@/components/BagDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Benefits />
      <BestSellers />
      <PerfectLiner />
      <BrandStory />
      <Reviews />
      <Footer />

      <QuickView />
      <BagDrawer />
      <CheckoutDrawer />
    </main>
  );
}
