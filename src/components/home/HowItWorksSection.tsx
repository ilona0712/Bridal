import { MessageCircle, Palette, Star } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function HowItWorksSection() {
  return (
    <section id="features" className="container mx-auto px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-serif text-4xl text-stone-800">How It Works</h2>
          <p className="text-stone-600">
            Three simple steps to your perfect gown
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8 text-stone-600" />}
            title="Chat with Isabella"
            description="Tell our AI consultant about your vision, style preferences, and wedding theme. Isabella understands your unique story."
          />

          <FeatureCard
            icon={<Palette className="w-8 h-8 text-stone-600" />}
            title="Customize Everything"
            description="Modify necklines, sleeves, trains, and embellishments. See your changes in real-time as you design your perfect dress."
          />

          <FeatureCard
            icon={<Star className="w-8 h-8 text-stone-600" />}
            title="Get Your Gown"
            description={`Once you've found "the one", we'll connect you with expert seamstresses who bring your custom design to life.`}
          />
        </div>
      </div>
    </section>
  );
}
