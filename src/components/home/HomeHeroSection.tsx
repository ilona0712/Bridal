import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ImageWithFallback } from "../../assets/ImageWithFallback";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import FloatingPetals from "./FloatingPetals";

const SIZES = [32, 34, 36, 38, 40, 42, 44, 46];

const SILHOUETTES = [
  {
    key: "A-Line", desc: "Flares from waist",
    svg: (
      <svg viewBox="0 0 60 90" fill="none" className="w-full h-full">
        <path d="M30 6 C34 6 37 9 37 13 L37 32 C37 32 50 55 56 82 L4 82 C10 55 23 32 23 32 L23 13 C23 9 26 6 30 6 Z" fill="currentColor" opacity="0.15"/>
        <path d="M30 6 C34 6 37 9 37 13 L37 32 C37 32 50 55 56 82 L4 82 C10 55 23 32 23 32 L23 13 C23 9 26 6 30 6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M23 32 C23 32 26 34 30 34 C34 34 37 32 37 32" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="30" cy="6" rx="5" ry="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    key: "Mermaid", desc: "Fitted & dramatic",
    svg: (
      <svg viewBox="0 0 60 90" fill="none" className="w-full h-full">
        <path d="M30 6 C34 6 37 9 37 13 L38 52 C38 52 48 62 52 82 L8 82 C12 62 22 52 22 52 L23 13 C23 9 26 6 30 6 Z" fill="currentColor" opacity="0.15"/>
        <path d="M30 6 C34 6 37 9 37 13 L38 52 C38 52 48 62 52 82 L8 82 C12 62 22 52 22 52 L23 13 C23 9 26 6 30 6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M22 52 C22 52 25 54 30 54 C35 54 38 52 38 52" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="30" cy="6" rx="5" ry="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    key: "Ball Gown", desc: "Full & princess",
    svg: (
      <svg viewBox="0 0 60 90" fill="none" className="w-full h-full">
        <path d="M30 6 C34 6 37 9 37 13 L38 30 C38 30 58 50 58 72 C58 78 45 84 30 84 C15 84 2 78 2 72 C2 50 22 30 22 30 L23 13 C23 9 26 6 30 6 Z" fill="currentColor" opacity="0.15"/>
        <path d="M30 6 C34 6 37 9 37 13 L38 30 C38 30 58 50 58 72 C58 78 45 84 30 84 C15 84 2 78 2 72 C2 50 22 30 22 30 L23 13 C23 9 26 6 30 6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M22 30 C22 30 25 32 30 32 C35 32 38 30 38 30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="30" cy="6" rx="5" ry="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    key: "Sheath", desc: "Sleek & modern",
    svg: (
      <svg viewBox="0 0 60 90" fill="none" className="w-full h-full">
        <path d="M30 6 C34 6 37 9 37 13 L38 74 C38 78 34 82 30 82 C26 82 22 78 22 74 L23 13 C23 9 26 6 30 6 Z" fill="currentColor" opacity="0.15"/>
        <path d="M30 6 C34 6 37 9 37 13 L38 74 C38 78 34 82 30 82 C26 82 22 78 22 74 L23 13 C23 9 26 6 30 6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <ellipse cx="30" cy="6" rx="5" ry="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
];

const STEPS = [
  { key: "silhouette", label: "Silhouette" },
  { key: "neckline",   label: "Neckline"   },
  { key: "fabric",     label: "Fabric"      },
  { key: "sleeve",     label: "Sleeve"      },
  { key: "train",      label: "Train"       },
  { key: "size",       label: "Size"        },
] as const;

type StepKey = typeof STEPS[number]["key"];

const OPTIONS: Record<string, string[]> = {
  neckline: ["Sweetheart", "V-Neck", "Off-Shoulder", "Halter"],
  fabric:   ["Lace", "Satin", "Chiffon", "Crepe", "Tulle"],
  sleeve:   ["Sleeveless", "Cap Sleeve", "Long Sleeve"],
  train:    ["No Train", "Court", "Chapel", "Cathedral"],
};

export default function HomeHeroSection() {
  const { settings, loading } = useSiteSettings();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [open, setOpen]   = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    setOpen(false);
    setStepIdx(0);
    setPicks({});
    setSelectedSize(null);
    navigatingRef.current = false;
  }, [location.pathname]);

  function goTo(gallery: boolean, extraPicks = picks, extraSize = selectedSize) {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    const params = new URLSearchParams();
    if (extraPicks.silhouette) params.set("silhouette", extraPicks.silhouette);
    if (extraPicks.neckline)   params.set("neckline",   extraPicks.neckline);
    if (extraPicks.fabric)     params.set("fabric",     extraPicks.fabric);
    if (extraPicks.sleeve)     params.set("sleeveStyle",extraPicks.sleeve);
    if (extraPicks.train)      params.set("trainLength", extraPicks.train);
    if (extraSize)             params.set("size",       String(extraSize));
    navigate(`/gallery?${params.toString()}`);
  }

  function pick(key: StepKey, value: string) {
    const newPicks = { ...picks, [key]: value };
    setPicks(newPicks);
    const nextIdx = stepIdx + 1;
    if (nextIdx >= STEPS.length) {
      setTimeout(() => goTo(true, newPicks, selectedSize), 320);
    } else {
      setTimeout(() => setStepIdx(nextIdx), 280);
    }
  }

  function pickSize(size: number) {
    setSelectedSize(size);
    setTimeout(() => goTo(true, picks, size), 320);
  }

  function skip() {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= STEPS.length) {
      goTo(true);
    } else {
      setStepIdx(nextIdx);
    }
  }

  function handleReset() {
    setOpen(false);
    setStepIdx(0);
    setPicks({});
    setSelectedSize(null);
    navigatingRef.current = false;
  }

  const currentStep = STEPS[stepIdx];
  const words = (loading ? "Find Your Perfect Dress" : settings.hero_title).split(" ");

  return (
    <section className="container mx-auto px-6 py-20 relative overflow-hidden">
      <FloatingPetals />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto relative z-10">
        <div className="space-y-8 text-center lg:text-left">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block px-4 py-2 bg-stone-100/70 dark:bg-stone-800/70 rounded-full border border-stone-200/50 dark:border-stone-700/50"
          >
            <span className="text-sm text-stone-600 dark:text-stone-300">✨ AI-Powered Bridal Consultant</span>
          </motion.div>

          <h1 className="font-serif text-6xl leading-tight text-stone-800 dark:text-stone-100">
            {words.map((word, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            className="text-lg text-stone-600 dark:text-stone-300"
          >
            {loading ? "Chat with our intelligent consultant to design and customize your dream wedding dress." : settings.hero_subtitle}
          </motion.p>

          {/* Morphing button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
            className="flex justify-center lg:justify-start"
          >
            <motion.div
              key={open ? "open" : "closed"}
              layout
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              onClick={!open ? () => setOpen(true) : undefined}
              className={`relative overflow-hidden border transition-colors duration-300
                ${open
                  ? "rounded-2xl bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border-stone-200/60 dark:border-stone-700/50 w-full shadow-lg cursor-default"
                  : "rounded-full bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-transparent hover:shadow-xl cursor-pointer"
                }`}
            >
              <AnimatePresence mode="wait">
                {!open ? (
                  <motion.div key="trigger"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="px-8 py-4 text-stone-700 font-medium whitespace-nowrap select-none"
                  >
                    Find My Dress ✦
                  </motion.div>
                ) : (
                  <motion.div key="panel"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="p-5"
                  >
                    {/* Header + progress */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {stepIdx > 0 && (
                          <button type="button" onClick={() => setStepIdx(s => s - 1)}
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm"
                          >←</button>
                        )}
                        <AnimatePresence mode="wait">
                          <motion.p key={currentStep.key}
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="font-serif text-base text-stone-600 dark:text-stone-300"
                          >
                            {currentStep.label}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={skip}
                          className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors underline underline-offset-2"
                        >
                          {stepIdx === STEPS.length - 1 ? "Show all →" : "Skip"}
                        </button>
                        <button type="button" onClick={handleReset}
                          className="text-stone-300 hover:text-stone-500 dark:hover:text-stone-300 transition-colors text-sm"
                        >✕</button>
                      </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-1.5 mb-5">
                      {STEPS.map((s, i) => (
                        <div key={s.key}
                          className={`h-1 rounded-full flex-1 transition-all duration-300
                            ${i < stepIdx ? "bg-pink-300/60" : i === stepIdx ? "bg-stone-400 dark:bg-stone-400" : "bg-stone-200 dark:bg-stone-600"}`}
                        />
                      ))}
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                      <motion.div key={currentStep.key}
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentStep.key === "silhouette" && (
                          <div className="grid grid-cols-4 gap-3">
                            {SILHOUETTES.map((s, i) => (
                              <motion.button key={s.key} type="button"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                onClick={() => pick("silhouette", s.key)}
                                className={`group flex flex-col items-center gap-2 pt-4 pb-3 px-2 rounded-xl border-2 transition-all duration-200
                                  ${picks.silhouette === s.key
                                    ? "border-pink-300/70 bg-gradient-to-b from-stone-50 to-pink-50/40 dark:from-stone-700 dark:to-stone-700 shadow-md scale-[1.04]"
                                    : "border-stone-200/70 dark:border-stone-600/70 bg-white/40 dark:bg-stone-700/40 hover:border-stone-300 hover:bg-white/70 hover:scale-[1.02]"
                                  }`}
                              >
                                <div className={`h-16 w-10 transition-colors duration-200
                                  ${picks.silhouette === s.key ? "text-pink-400" : "text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"}`}>
                                  {s.svg}
                                </div>
                                <div className="text-center">
                                  <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 leading-tight">{s.key}</p>
                                  <p className="text-[9px] text-stone-400 dark:text-stone-500 leading-tight mt-0.5">{s.desc}</p>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}

                        {currentStep.key === "size" && (
                          <div className="flex flex-wrap gap-2">
                            {SIZES.map((size, i) => (
                              <motion.button key={size} type="button"
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.18, delay: i * 0.03 }}
                                onClick={() => pickSize(size)}
                                className={`w-11 h-11 rounded-full text-sm font-medium border-2 transition-all duration-200
                                  ${selectedSize === size
                                    ? "border-pink-300/60 bg-gradient-to-br from-stone-200 via-pink-100/60 to-stone-200 text-stone-700 scale-110 shadow-md"
                                    : "border-stone-200 dark:border-stone-600 bg-white/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400 hover:border-stone-300 hover:text-stone-700"
                                  }`}
                              >
                                {size}
                              </motion.button>
                            ))}
                          </div>
                        )}

                        {OPTIONS[currentStep.key] && (
                          <div className="flex flex-wrap gap-2">
                            {OPTIONS[currentStep.key].map((opt, i) => (
                              <motion.button key={opt} type="button"
                                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.18, delay: i * 0.04 }}
                                onClick={() => pick(currentStep.key, opt)}
                                className={`px-4 py-2 rounded-full text-sm border-2 transition-all duration-200
                                  ${picks[currentStep.key] === opt
                                    ? "border-pink-300/60 bg-gradient-to-r from-stone-200 via-pink-100/60 to-stone-200 text-stone-700 shadow-md"
                                    : "border-stone-200 dark:border-stone-600 bg-white/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400 hover:border-stone-300 hover:text-stone-700"
                                  }`}
                              >
                                {opt}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-transparent rounded-3xl" />
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-stone-100 dark:bg-stone-800">
            {!loading && (
              <ImageWithFallback
                src={settings.hero_image_url}
                alt="Happy Bride"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
