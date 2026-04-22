import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeFooter() {
  return (
    <footer className="border-t border-stone-200/50 dark:border-stone-700/50 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-stone-600" />
            </div>
            <span className="font-serif text-stone-800 dark:text-stone-100">Maria Badari</span>
          </div>

          <div className="flex gap-6 text-sm text-stone-600 dark:text-stone-300">
            <Link to="#" className="hover:text-stone-800 dark:hover:text-stone-100">
              Privacy
            </Link>
            <Link to="#" className="hover:text-stone-800 dark:hover:text-stone-100">
              Terms
            </Link>
            <Link to="#" className="hover:text-stone-800 dark:hover:text-stone-100">
              Contact
            </Link>
          </div>

          <div className="text-sm text-stone-500 dark:text-stone-400">
            © 2026 Maria Badari. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
