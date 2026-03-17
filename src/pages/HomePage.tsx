import Header from "../components/common/Header";
import HomeHeroSection from "../components/home/HomeHeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CollectionSection from "../components/home/CollectionSection";
import HomeCtaSection from "../components/home/HomeCtaSection";
import HomeFooter from "../components/home/HomeFooter";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function HomePage() {
  const [, setCollections] = useState<string[]>([]);
  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("name")
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      const names = data.map((c) => c.name);
      setCollections(names);
    };

    fetchCollections();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Your Dream dress Awaits" />
      <HomeHeroSection />
      <HowItWorksSection />
      <CollectionSection />
      <HomeCtaSection />
      <HomeFooter />
    </div>
  );
}
