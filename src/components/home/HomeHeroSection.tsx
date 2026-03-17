import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../assets/ImageWithFallback";

export default function HomeHeroSection() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-stone-100/70 rounded-full border border-stone-200/50">
              <span className="text-sm text-stone-600">
                ✨ AI-Powered Bridal Consultant
              </span>
            </div>

            <h1 className="font-serif text-6xl leading-tight text-stone-800">
              Find Your Perfect Dress
            </h1>

            <p className="text-lg text-stone-600">
              Chat with our intelligent consultant to design and customize your
              dream wedding dress. Every detail, every wish, brought to life.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              to="/consultation"
              className="px-8 py-4 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all"
            >
              Start Consultation
            </Link>
            <Link
              to="#features"
              className="px-8 py-4 bg-white/80 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50/50 transition-all"
            >
              Learn More
            </Link>
          </div>

          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-serif text-stone-800">10,000+</div>
              <div className="text-sm text-stone-500">Happy Brides</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-stone-800">500+</div>
              <div className="text-sm text-stone-500">Unique Designs</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-stone-800">24/7</div>
              <div className="text-sm text-stone-500">AI Support</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-transparent rounded-3xl" />

          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?auto=format&fit=crop&w=1080&q=80"
              alt="Happy Bride"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-stone-200/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-stone-600" />
              </div>
              <div>
                <div className="text-sm text-stone-800">Sarah M.</div>
                <div className="text-xs text-stone-500">
                  Found her dream dress in 20 min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
