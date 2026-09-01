import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";

export default function Home() {
  return (
    <main>
      <Hero />
      <Benefits />
      <BestSellers />
      {/* Perfect Liner feature, Brand Story, Reviews, and Footer come next. */}
    </main>
  );
}
