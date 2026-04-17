import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Sparkles } from "lucide-react";

export default function AdminPageHeader() {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
        <Link
          to="/admin/requests"
          className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white/70 px-4 py-2 text-sm text-stone-700 shadow-sm transition hover:border-pink-200 hover:bg-white dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-200 dark:hover:border-pink-900/40 dark:hover:bg-stone-800"
        >
          <ClipboardList className="w-4 h-4" />
          Review Requests
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-stone-600 dark:text-stone-300" />
        </div>

        <div>
          <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 dark:text-stone-400">Manage your dress collection</p>
        </div>
      </div>
    </>
  );
}
