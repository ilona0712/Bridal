import { useState } from "react";
import { Sparkles } from "lucide-react";
import GoogleLogo from "../assets/google.svg";
import FacebookLogo from "../assets/facebook.svg";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent rounded-3xl" />
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"
                alt="Bridal Gown"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
                <Sparkles className="w-8 h-8 text-stone-600" />
              </div>
              <h1 className="font-serif text-4xl text-stone-800">
                Bride Me Up
              </h1>
              <p className="text-stone-500">
                Your journey to the perfect gown begins here
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-stone-700">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="bride@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
               text-stone-800 placeholder:text-stone-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-stone-700">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
               text-stone-800 placeholder:text-stone-400"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label
                htmlFor="remember"
                className="flex items-center gap-2 text-stone-600 cursor-pointer"
              >
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-pink-300"
                />
                <span>Remember me</span>
              </label>

              <Link to="#" className="text-stone-600 hover:text-stone-800">
                Forgot password
              </Link>
            </div>
            <button
              type="button"
              className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Sign In
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 text-stone-500">
                  or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 px-4 bg-stone-50/50 border border-stone-200 rounded-xl hover:bg-stone-100/50 transition-colors text-stone-700 flex items-center justify-center gap-2"
              >
                <img src={GoogleLogo} alt="Google" className="h-5 w-5" />
                Google
              </button>

              <button
                type="button"
                className="py-3 px-4 bg-stone-50/50 border border-stone-200 rounded-xl hover:bg-stone-100/50 transition-colors text-stone-700 flex items-center justify-center gap-2"
              >
                <img src={FacebookLogo} alt="Facebook" className="h-5 w-5" />
                Facebook
              </button>
            </div>
            <div className="text-center text-sm text-stone-600">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-stone-700 hover:text-stone-900">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
