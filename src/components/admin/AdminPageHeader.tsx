import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSiteSettings } from "../../hooks/useSiteSettings";

export default function AdminPageHeader() {
  const { settings } = useSiteSettings();
  return (
    <>
      <Link
        to="/gallery"
        className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center overflow-hidden">
          {settings.logo_image_url ? (
            <img src={settings.logo_image_url} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <Sparkles className="w-7 h-7 text-stone-600 dark:text-stone-300" />
          )}
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
