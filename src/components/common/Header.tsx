import { Sparkles, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { isAdmin } from "../../auth";

interface HeaderProps {
  subtitle?: string;
  fixed?: boolean;
}

export default function Header({
  subtitle = "Your Dream Gown Awaits",
  fixed = false,
}: HeaderProps) {
  return (
    <header
      className={`border-b border-stone-200/50 bg-white/60 backdrop-blur-sm ${
        fixed ? "fixed" : "sticky"
      } top-0 z-40 w-full`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-stone-800">Bride Me Up</h1>
            <p className="text-xs text-stone-500">{subtitle}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="text-sm text-stone-600 hover:text-stone-800">
              Admin
            </Link>
          )}
          <Link
            to="/"
            className="text-sm text-stone-600 hover:text-stone-800 hidden sm:block"
          >
            Home
          </Link>

          <Link
            to="/gallery"
            className="text-sm text-stone-600 hover:text-stone-800"
          >
            Gallery
          </Link>

          <Link
            to="/isabella"
            className="text-sm text-stone-600 hover:text-stone-800"
          >
            Consultant
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 text-stone-700 rounded-full text-sm hover:shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat with Owner</span>
          </Link>

          <Link
            to="/login"
            className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
