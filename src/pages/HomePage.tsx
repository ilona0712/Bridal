
import Header from "../components/common/Header";
import HomeHeroSection from "../components/home/HomeHeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CollectionSection from "../components/home/CollectionSection";
import HomeCtaSection from "../components/home/HomeCtaSection";
import HomeFooter from "../components/home/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Your Dream Gown Awaits" />
      <HomeHeroSection />
      <HowItWorksSection />
      <CollectionSection />
      <HomeCtaSection />
      <HomeFooter />
    </div>
  );
}
