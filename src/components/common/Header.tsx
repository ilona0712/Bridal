import { Sparkles, MessageCircle, User, LogOut } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "../../routes"
import { signOut } from "../../auth"

interface HeaderProps {
  subtitle?: string
  fixed?: boolean
}

export default function Header({ subtitle = "Your Dream Gown Awaits", fixed = false }: HeaderProps) {
  const session  = useSession()
  const navigate = useNavigate()
  const unreadCount = 3

  const isAdmin = session?.user?.user_metadata?.role === "admin"

  const displayName = session?.user?.user_metadata?.full_name
    || session?.user?.user_metadata?.first_name
    || session?.user?.email?.split("@")[0]
    || null

  async function handleSignOut() {
    await signOut()
    navigate("/login")
  }

  return (
    <header
      className={`border-b border-stone-200/50 bg-white/60 backdrop-blur-sm ${
        fixed ? "fixed" : "sticky"
      } top-0 z-40 w-full`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-stone-800">Bride Me Up</h1>
            <p className="text-xs text-stone-500">{subtitle}</p>
          </div>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-4">

          {isAdmin && (
            <Link to="/admin" className="text-sm text-stone-600 hover:text-stone-800">
              Admin
            </Link>
          )}

          <Link to="/" className="text-sm text-stone-600 hover:text-stone-800 hidden sm:block">
            Home
          </Link>

          <Link to="/gallery" className="text-sm text-stone-600 hover:text-stone-800">
            Gallery
          </Link>

          <Link to="/isabella" className="text-sm text-stone-600 hover:text-stone-800">
            Consultant
          </Link>

          {/* Chat button */}
          {isAdmin ? (
            <Link to="/chat"
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border border-stone-200/50 text-stone-700 rounded-full text-sm hover:shadow-md transition-all">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Client Chats</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-pink-500 text-white text-xs font-medium shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>
          ) : (
            <Link to="/chat"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 text-stone-700 rounded-full text-sm hover:shadow-md transition-all">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat with Owner</span>
            </Link>
          )}

          {/* Auth section */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-stone-600">
                Hello, <span className="font-medium text-stone-800">{displayName}</span>
              </span>

              <Link to="/profile"
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-stone-300/50 hover:border-pink-300/50 transition-all hover:shadow-md flex items-center justify-center bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300"
                title="View Profile">
                <User className="w-5 h-5 text-stone-600" />
              </Link>

              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-600 rounded-full text-sm hover:bg-stone-50 hover:text-stone-800 transition-all"
                title="Sign out">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all">
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  )
}