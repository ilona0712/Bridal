import { MessageCircle, Palette, Star } from "lucide-react";
import FeatureCard from "./FeatureCard";
import { useInView } from "../../hooks/useInView";

export default function HowItWorksSection() {
  const { ref: titleRef, inView: titleInView } = useInView();
  const { ref: cardsRef, inView: cardsInView } = useInView();

  const cards = [
    {
      icon: <MessageCircle className="w-8 h-8 text-stone-600" />,
      title: "Choose a Dress",
      description:
        "Start in the gallery and pick the gown you want to personalize before opening the MAI customization flow.",
    },
    {
      icon: <Palette className="w-8 h-8 text-stone-600" />,
      title: "Customize Everything",
      description:
        "Refine the selected dress with MAI by changing necklines, sleeves, trains, fabrics, and embellishments to match your vision.",
    },
    {
      icon: <Star className="w-8 h-8 text-stone-600" />,
      title: "Get Your Dress",
      description: `Once you've found "the one", we'll connect you with expert seamstresses who bring your custom design to life.`,
    },
  ];

  return (
    <section id="features" className="container mx-auto px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div
          ref={titleRef}
          className={`text-center mb-16 space-y-3 opacity-0 ${titleInView ? "animate-fade-slide-up" : ""}`}
        >
          <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-100">How It Works</h2>
          <p className="text-stone-600 dark:text-stone-300">Three simple steps to your perfect dress</p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`opacity-0 ${cardsInView ? "animate-fade-slide-up" : ""}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <FeatureCard
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
