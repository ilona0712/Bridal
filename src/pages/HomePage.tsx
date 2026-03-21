import Header from "../components/common/Header";
import HomeHeroSection from "../components/home/HomeHeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CollectionSection from "../components/home/CollectionSection";
import HomeCtaSection from "../components/home/HomeCtaSection";
import HomeFooter from "../components/home/HomeFooter";
import CursorTrail from "../components/home/CursorTrail";
import { motion } from "framer-motion";
import ScrollProgressBar from "../components/home/ScrollProgressBar";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    document.documentElement.style.scrollbarWidth = "none";
    const style = document.createElement("style");
    style.id = "hide-scrollbar-home";
    style.textContent = "html::-webkit-scrollbar { display: none; }";
    document.head.appendChild(style);

    return () => {
      document.documentElement.style.scrollbarWidth = "";
      document.getElementById("hide-scrollbar-home")?.remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      <CursorTrail />
      <ScrollProgressBar />
      <Header subtitle="Your Dream dress Awaits" />
      <HomeHeroSection />
      <HowItWorksSection />
      <CollectionSection />
      <HomeCtaSection />
      <HomeFooter />
    </motion.div>
  );
}