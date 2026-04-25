import { Sparkles, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

type ProfilePageHeaderProps = {
  onLogout: () => void;
};

export default function ProfilePageHeader({
  onLogout,
}: ProfilePageHeaderProps) {
  return (
    <header className="border-b border-stone-200/50 dark:border-stone-700/50 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm sticky top-0 z-40 w-full">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-stone-800 dark:text-stone-100">
              Maria Badari
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your Dream Dress Awaits
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 hidden sm:block"
          >
            Home
          </Link>
          <Link
            to="/gallery"
            className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
          >
            Gallery
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-stone-200/50 dark:bg-stone-700/50 hover:bg-stone-300/50 dark:hover:bg-stone-600/50 text-stone-700 dark:text-stone-200 rounded-full text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
