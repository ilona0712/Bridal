import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeFooter() {
  return (
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
  );
}
