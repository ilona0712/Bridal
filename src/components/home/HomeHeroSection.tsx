import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../assets/ImageWithFallback";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import FloatingPetals from "./FloatingPetals";

export default function HomeHeroSection() {
  const { settings, loading } = useSiteSettings();

  const words = (loading ? "Find Your Perfect Dress" : settings.hero_title).split(" ");

  return (
    <section className="container mx-auto px-6 py-20 relative overflow-hidden">
      <FloatingPetals />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto relative z-10">

        {/* Text side */}
        <div className="space-y-8">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block px-4 py-2 bg-stone-100/70 dark:bg-stone-800/70 rounded-full border border-stone-200/50 dark:border-stone-700/50"
          >
            <span className="text-sm text-stone-600 dark:text-stone-300">✨ AI-Powered Bridal Consultant</span>
          </motion.div>

          {/* Title word by word */}
          <h1 className="font-serif text-6xl leading-tight text-stone-800 dark:text-stone-100">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + i * 0.12,
                  ease: "easeOut",
                }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            className="text-lg text-stone-600 dark:text-stone-300"
          >
            {loading
              ? "Chat with our intelligent consultant to design and customize your dream wedding dress."
              : settings.hero_subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
            className="flex gap-4"
          >
            <Link
              to="/isabella"
              className="px-8 py-4 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all"
            >
              {loading ? "Start Consultation" : settings.hero_cta_text}
            </Link>
            <Link
              to="#features"
              className="px-8 py-4 bg-white/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 rounded-xl hover:bg-stone-50/50 dark:hover:bg-stone-700/50 transition-all"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-transparent rounded-3xl" />
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src={
                loading
                  ? "https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?auto=format&fit=crop&w=1080&q=80"
                  : settings.hero_image_url
              }
              alt="Happy Bride"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}