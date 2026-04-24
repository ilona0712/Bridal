import { useEffect, useState } from "react";
import {
  Sparkles,
  MessageCircle,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSession, useRole } from "../../routes";
import { signOut } from "../../auth";
import { supabase } from "../../../lib/supabase";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  subtitle?: string;
  fixed?: boolean;
}

export default function Header({ subtitle, fixed = false }: HeaderProps) {
  const session = useSession();
  const role = useRole();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const { theme, toggleTheme } = useTheme();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  const isAdmin = role === "admin";
  const displayName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.first_name ||
    session?.user?.email?.split("@")[0] ||
    null;

  const tagline = subtitle ?? "";
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!session?.user) {
        setProfileImageUrl(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image_url")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) {
        setProfileImageUrl(null);
        return;
      }
      setProfileImageUrl(data?.profile_image_url || null);
    };
    loadProfileImage();
  }, [session]);

  useEffect(() => {
    if (!isAdmin || !session?.user) return;

    const fetchUnreadConvCount = async () => {
      const { data: convs } = await supabase.from("conversations").select("id");
      if (!convs?.length) {
        setUnreadCount(0);
        return;
      }

      const { data: reads } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", session.user.id);

      const readMap = new Map(
        (reads ?? []).map((r) => [r.conversation_id, r.last_read_at]),
      );

      const results = await Promise.all(
        convs.map(async (conv) => {
          const lastReadAt = readMap.get(conv.id) ?? null;
          const base = supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("sender_type", "customer");
          const { count } = lastReadAt
            ? await base.gt("created_at", lastReadAt)
            : await base;
          return (count ?? 0) > 0 ? 1 : 0;
        }),
      );

      setUnreadCount(results.reduce((a, b) => a + b, 0 as number));
    };

    fetchUnreadConvCount();

    const channel = supabase
      .channel("header-unread-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        fetchUnreadConvCount,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_reads" },
        fetchUnreadConvCount,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, session?.user?.id]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPendingReviewCount = async () => {
      const { count, error } = await supabase
        .from("chatbot_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_review");

      if (error) {
        setPendingReviewCount(0);
        return;
      }

      setPendingReviewCount(count ?? 0);
    };

    fetchPendingReviewCount();

    const channel = supabase
      .channel("header-pending-review-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chatbot_sessions" },
        fetchPendingReviewCount,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
    setMenuOpen(false);
  }

  return (
    <header
      className={`safe-area-top border-b border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm ${fixed ? "fixed" : "sticky"} top-0 z-40 w-full`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between w-full relative">
          {/* Mobile: hamburger left + logo */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70"
            >
              {menuOpen ? (
                <X className="h-4 w-4 text-stone-600 dark:text-stone-300" />
              ) : (
                <Menu className="h-4 w-4 text-stone-600 dark:text-stone-300" />
              )}
            </button>

            <Link to="/" className="flex items-center gap-2 min-w-0">
              {settings.logo_image_url ? (
                <img src={settings.logo_image_url} alt="Logo" className="h-9 w-auto flex-shrink-0" />
              ) : (
                <>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300">
                    <Sparkles className="h-4 w-4 text-stone-600" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate font-serif text-base text-stone-800 dark:text-stone-100">
                      {settings.logo_text}
                    </h1>
                  </div>
                </>
              )}
            </Link>
          </div>

          {/* Desktop: logo left */}
          <Link
            to="/"
            className="hidden md:flex items-center gap-3 min-w-0 flex-shrink-0"
          >
            {settings.logo_image_url ? (
              <img src={settings.logo_image_url} alt="Logo" className="h-10 w-auto flex-shrink-0" />
            ) : (
              <>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300">
                  <Sparkles className="h-5 w-5 text-stone-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate font-serif text-xl text-stone-800 dark:text-stone-100">
                    {settings.logo_text}
                  </h1>
                  {tagline && (
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                      {tagline}
                    </p>
                  )}
                </div>
              </>
            )}
          </Link>

          {/* Desktop: nav centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              to="/"
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/gallery"
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
            >
              Gallery
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/clients-chats"
                  className="relative inline-flex items-center gap-2 rounded-full border border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 dark:from-stone-700 dark:via-pink-900/20 dark:to-stone-700 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  Client Chats
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-medium text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/requests"
                  className="relative inline-flex items-center gap-2 rounded-full border border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-800/80 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:shadow-md"
                >
                  <ClipboardList className="h-4 w-4" />
                  Requests
                  {pendingReviewCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-400 px-1 text-xs font-medium text-white shadow-sm">
                      {pendingReviewCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 dark:from-amber-900/30 dark:via-amber-800/20 dark:to-amber-900/30 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with Owner
              </Link>
            )}
          </nav>

          {/* Desktop: account right */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-stone-300" />
              ) : (
                <Moon className="h-4 w-4 text-stone-600" />
              )}
            </button>

            {session ? (
              <>
                <div className="rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 px-4 py-2 shadow-sm">
                  <span className="text-sm text-stone-700 dark:text-stone-200">
                    Welcome,{" "}
                    <span className="font-semibold">
                      {isAdmin ? "Admin" : displayName || "Customer"}
                    </span>
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 hover:bg-stone-50 dark:hover:bg-stone-700 overflow-hidden"
                  title="Profile"
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 hover:bg-stone-50 dark:hover:bg-stone-700"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 dark:from-stone-700 dark:via-pink-900/20 dark:to-stone-700 px-6 py-2 text-sm text-stone-700 dark:text-stone-200 hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile: right side actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-stone-300" />
              ) : (
                <Moon className="h-4 w-4 text-stone-600" />
              )}
            </button>
            {isAdmin ? (
              <>
                <Link
                  to="/clients-chats"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 dark:from-stone-700 dark:via-pink-900/20 dark:to-stone-700"
                  title="Client Chats"
                >
                  <MessageCircle className="h-4 w-4 text-stone-700 dark:text-stone-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-0.5 text-[10px] font-medium text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/requests"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-800/80"
                  title="Requests"
                >
                  <ClipboardList className="h-4 w-4 text-stone-700 dark:text-stone-200" />
                  {pendingReviewCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-400 px-0.5 text-[10px] font-medium text-white shadow-sm">
                      {pendingReviewCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/chat"
                className="inline-flex items-center gap-1 rounded-full border border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 dark:from-amber-900/30 dark:via-amber-800/20 dark:to-amber-900/30 px-3 py-2 text-xs text-stone-700 dark:text-stone-200"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            )}
            {session && (
              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 overflow-hidden"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-stone-200/50 dark:border-stone-700/50 pt-3 flex flex-col gap-3">
            {session && (
              <div className="text-sm text-stone-700 dark:text-stone-200 px-1">
                Welcome,{" "}
                <span className="font-semibold">
                  {isAdmin ? "Admin" : displayName || "Customer"}
                </span>
              </div>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1"
              >
                Admin
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/requests"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1"
              >
                Requests
              </Link>
            )}
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1"
            >
              Home
            </Link>
            <Link
              to="/gallery"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1"
            >
              Gallery
            </Link>
            {!session && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1"
              >
                Sign In
              </Link>
            )}
            {session && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 px-1 text-left"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
