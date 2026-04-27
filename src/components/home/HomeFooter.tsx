import { Link } from "react-router-dom";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { useSession, useRole } from "../../routes";
import { useCustomerChatUnreadCount } from "../../hooks/useCustomerChatUnreadCount";

export default function HomeFooter() {
  const { settings } = useSiteSettings();
  const session = useSession();
  const role = useRole();
  const customerUnreadCount = useCustomerChatUnreadCount();
  const brandName = settings.logo_text || "Bride Me Up";

  return (
    <footer className="border-t border-stone-200/50 dark:border-stone-700/50 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logoMB.png" alt="logo" className="w-8 h-8 object-contain" />
            <span className="font-serif text-stone-800 dark:text-stone-100">{brandName}</span>
          </div>

          <div className="flex gap-6 text-sm text-stone-600 dark:text-stone-300">
            <Link to="/privacy-policy" className="hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
              Terms
            </Link>
            <Link
              to="/chat"
              className={`relative transition-colors ${
                session && role !== "admin" && customerUnreadCount > 0
                  ? "font-medium text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200"
                  : "hover:text-stone-800 dark:hover:text-stone-100"
              }`}
            >
              {session && role !== "admin" && customerUnreadCount > 0 ? "New Reply" : "Contact"}
              {session && role !== "admin" && customerUnreadCount > 0 && (
                <span className="absolute -right-4 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-0.5 text-[10px] font-medium text-white shadow-sm">
                  {customerUnreadCount}
                </span>
              )}
            </Link>
          </div>

          <div className="text-sm text-stone-500 dark:text-stone-400">
            © 2026 {brandName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
