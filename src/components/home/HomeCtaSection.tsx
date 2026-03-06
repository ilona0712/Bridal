import { Link } from "react-router-dom";

export default function HomeCtaSection() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-3xl p-12 text-center space-y-6">
        <h2 className="font-serif text-4xl text-stone-800">
          Ready to Find Your Dream Gown?
        </h2>

        <p className="text-lg text-stone-700">
          Start your journey today with our AI consultant. Your perfect dress is
          just a conversation away.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/isabella"
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
  );
}
