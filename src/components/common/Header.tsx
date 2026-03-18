import { useEffect, useState } from "react"
import { Sparkles, MessageCircle, User, LogOut, Menu, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "../../routes"
import { signOut } from "../../auth"
import { supabase } from "../../../lib/supabase"
import { useSiteSettings } from "../../hooks/useSiteSettings"

interface HeaderProps {
  subtitle?: string
  fixed?: boolean
}

export default function Header({ subtitle, fixed = false }: HeaderProps) {
  const session = useSession()
  const navigate = useNavigate()
  const { settings } = useSiteSettings()
  const unreadCount = 3

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = session?.user?.user_metadata?.role === "admin"
  const displayName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.first_name ||
    session?.user?.email?.split("@")[0] ||
    null

  const tagline = subtitle ?? settings.logo_tagline

  useEffect(() => {
    const loadProfileImage = async () => {
      if (!session?.user) { setProfileImageUrl(null); return }
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_image_url")
        .eq("id", session.user.id)
        .maybeSingle()
      if (error) { setProfileImageUrl(null); return }
      setProfileImageUrl(data?.profile_image_url || null)
    }
    loadProfileImage()
  }, [session])

  async function handleSignOut() {
    await signOut()
    navigate("/login")
    setMenuOpen(false)
  }

  return (
    <header className={`border-b border-stone-200/50 bg-white/80 backdrop-blur-sm ${fixed ? "fixed" : "sticky"} top-0 z-40 w-full`}>
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between w-full relative">

          {/* Mobile: hamburger left + logo */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70"
            >
              {menuOpen
                ? <X className="h-4 w-4 text-stone-600" />
                : <Menu className="h-4 w-4 text-stone-600" />}
            </button>

            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 overflow-hidden">
                {settings.logo_image_url ? (
                  <img src={settings.logo_image_url} alt="Logo" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <Sparkles className="h-4 w-4 text-stone-600" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-serif text-base text-stone-800">{settings.logo_text}</h1>
              </div>
            </Link>
          </div>

          {/* Desktop: logo left */}
          <Link to="/" className="hidden md:flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 overflow-hidden">
              {settings.logo_image_url ? (
                <img src={settings.logo_image_url} alt="Logo" className="h-full w-full object-cover rounded-full" />
              ) : (
                <Sparkles className="h-5 w-5 text-stone-600" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-xl text-stone-800">{settings.logo_text}</h1>
              {tagline && <p className="truncate text-xs text-stone-500">{tagline}</p>}
            </div>
          </Link>

          {/* Desktop: nav centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {isAdmin && (
              <Link to="/admin" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Admin</Link>
            )}
            <Link to="/" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Home</Link>
            <Link to="/gallery" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Gallery</Link>
            <Link to="/isabella" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Consultant</Link>
            {isAdmin ? (
              <Link to="/clients-chats"
                className="relative inline-flex items-center gap-2 rounded-full border border-stone-200/50 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-4 py-2 text-sm text-stone-700 hover:shadow-md">
                <MessageCircle className="h-4 w-4" />
                Client Chats
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-medium text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 px-4 py-2 text-sm text-stone-700 hover:shadow-md">
                <MessageCircle className="h-4 w-4" />
                Chat with Owner
              </Link>
            )}
          </nav>

          {/* Desktop: account right */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {session ? (
              <>
                <div className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 shadow-sm">
                  <span className="text-sm text-stone-700">
                    Welcome, <span className="font-semibold">{isAdmin ? "Admin" : displayName || "Customer"}</span>
                  </span>
                </div>
                <Link to="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70 hover:bg-stone-50 overflow-hidden"
                  title="Profile">
                  {profileImageUrl
                    ? <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                    : <User className="h-4 w-4 text-stone-600" />}
                </Link>
                <button onClick={handleSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70 hover:bg-stone-50"
                  title="Sign out">
                  <LogOut className="h-4 w-4 text-stone-600" />
                </button>
              </>
            ) : (
              <Link to="/login"
                className="rounded-full bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-6 py-2 text-sm text-stone-700 hover:shadow-md">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile: right side actions */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin ? (
              <Link to="/clients-chats"
                className="relative inline-flex items-center gap-1 rounded-full border border-stone-200/50 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-3 py-2 text-xs text-stone-700">
                <MessageCircle className="h-4 w-4" />
                Chats
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-medium text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/chat"
                className="inline-flex items-center gap-1 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 px-3 py-2 text-xs text-stone-700">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            )}
            {session && (
              <Link to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70 overflow-hidden">
                {profileImageUrl
                  ? <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                  : <User className="h-4 w-4 text-stone-600" />}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-stone-200/50 pt-3 flex flex-col gap-3">
            {session && (
              <div className="text-sm text-stone-700 px-1">
                Welcome, <span className="font-semibold">{isAdmin ? "Admin" : displayName || "Customer"}</span>
              </div>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-stone-600 hover:text-stone-800 px-1">Admin</Link>
            )}
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm text-stone-600 hover:text-stone-800 px-1">Home</Link>
            <Link to="/gallery" onClick={() => setMenuOpen(false)} className="text-sm text-stone-600 hover:text-stone-800 px-1">Gallery</Link>
            <Link to="/isabella" onClick={() => setMenuOpen(false)} className="text-sm text-stone-600 hover:text-stone-800 px-1">Consultant</Link>
            {!session && (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-stone-600 hover:text-stone-800 px-1">Sign In</Link>
            )}
            {session && (
              <button onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 px-1 text-left">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}