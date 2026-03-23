import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";

export default function HomeCtaSection() {
  const { ref, inView } = useInView();

  return (
    <section className="container mx-auto px-6 py-20">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto rounded-3xl p-12 text-center space-y-6 overflow-hidden dark:bg-stone-800/80"
      >
        {/* Animated gradient background (light mode only) */}
        <motion.div
          className="absolute inset-0 rounded-3xl -z-10 dark:hidden"
          animate={{
            background: [
              "linear-gradient(135deg, #d6cfc9 0%, #f9e8e8 50%, #d6cfc9 100%)",
              "linear-gradient(135deg, #f9e8e8 0%, #d6cfc9 50%, #f0d4d4 100%)",
              "linear-gradient(135deg, #d6cfc9 0%, #f9e8e8 50%, #d6cfc9 100%)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
          Ready to Find Your Dream Gown?
        </h2>

        <p className="text-lg text-stone-700 dark:text-stone-200">
          Start your journey today with our AI consultant. Your perfect dress is
          just a conversation away.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/isabella"
            className="px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl hover:shadow-lg transition-all"
          >
            Start Now
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-stone-800/10 dark:bg-stone-100/10 text-stone-800 dark:text-stone-200 rounded-xl hover:bg-stone-800/20 dark:hover:bg-stone-100/20 transition-all"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  );
}