import { Sparkles, Heart, MessageCircle, Palette, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { isAdmin } from "../auth";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      {/* Header */}
      <header className="border-b border-stone-200/50 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-stone-800">Bride Me Up</h1>
              <p className="text-xs text-stone-500">Your Dream Gown Awaits</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
  <Link to="#" className="text-sm text-stone-600 hover:text-stone-800">
    About
  </Link>

  <Link to="/gallery" className="text-sm text-stone-600 hover:text-stone-800">
    Gallery
  </Link>

  {isAdmin && (
    <Link
      to="/admin"
      className="px-6 py-2 bg-white/70 border border-stone-200/50 text-stone-700 rounded-full text-sm hover:bg-white/90 hover:shadow-lg transition-all"
    >
      Admin
    </Link>
  )}

  <Link
    to="/login"
    className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all"
  >
    Sign In
  </Link>
</div>
        </div>
      </header>

      {/* Hero Section */}
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
                Find Your Perfect Gown
              </h1>

              <p className="text-lg text-stone-600">
                Chat with our intelligent consultant to design and customize
                your dream wedding dress. Every detail, every wish, brought to
                life.
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
                <div className="text-3xl font-serif text-stone-800">
                  10,000+
                </div>
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

            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-stone-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-stone-600" />
                </div>
                <div>
                  <div className="text-sm text-stone-800">Sarah M.</div>
                  <div className="text-xs text-stone-500">
                    Found her dream gown in 20 min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-serif text-4xl text-stone-800">How It Works</h2>
            <p className="text-stone-600">
              Three simple steps to your perfect gown
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-stone-600" />
              </div>

              <h3 className="font-serif text-xl text-stone-800">
                Chat with Isabella
              </h3>

              <p className="text-stone-600">
                Tell our AI consultant about your vision, style preferences, and
                wedding theme. Isabella understands your unique story.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8 text-stone-600" />
              </div>

              <h3 className="font-serif text-xl text-stone-800">
                Customize Everything
              </h3>

              <p className="text-stone-600">
                Modify necklines, sleeves, trains, and embellishments. See your
                changes in real-time as you design your perfect dress.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-stone-600" />
              </div>

              <h3 className="font-serif text-xl text-stone-800">
                Get Your Gown
              </h3>

              <p className="text-stone-600">
                Once you've found "the one", we'll connect you with expert
                seamstresses who bring your custom design to life.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Gallery Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="font-serif text-4xl text-stone-800">
              Our Collection
            </h2>
            <p className="text-stone-600">
              Explore stunning gowns designed by brides like you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item 1 */}
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"
                  alt="Gown 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-stone-800">Ethereal Grace</div>
                <div className="text-sm text-stone-500">Classic A-Line</div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1735712954543-67a25a6998c8?auto=format&fit=crop&w=1080&q=80"
                  alt="Gown 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-stone-800">Modern Romance</div>
                <div className="text-sm text-stone-500">Mermaid Silhouette</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1681490395226-36e00f9bbd2b?auto=format&fit=crop&w=1080&q=80"
                  alt="Gown 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-stone-800">Timeless Beauty</div>
                <div className="text-sm text-stone-500">Ball Gown</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-3xl p-12 text-center space-y-6">
          <h2 className="font-serif text-4xl text-stone-800">
            Ready to Find Your Dream Gown?
          </h2>

          <p className="text-lg text-stone-700">
            Start your journey today with our AI consultant. Your perfect dress
            is just a conversation away.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/consultation"
              className="px-8 py-4 bg-white text-stone-700 rounded-xl hover:shadow-lg transition-all"
            >
              Start Now
            </Link>

            <Link
              to="/login"
              className="px-8 py-4 bg-stone-800/10 text-stone-800 rounded-xl hover:bg-stone-800/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-stone-200/50 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-stone-600" />
              </div>
              <span className="font-serif text-stone-800">Bride Me Up</span>
            </div>

            <div className="flex gap-6 text-sm text-stone-600">
              <Link to="#" className="hover:text-stone-800">
                Privacy
              </Link>
              <Link to="#" className="hover:text-stone-800">
                Terms
              </Link>
              <Link to="#" className="hover:text-stone-800">
                Contact
              </Link>
            </div>

            <div className="text-sm text-stone-500">
              © 2026 Bride Me Up. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
