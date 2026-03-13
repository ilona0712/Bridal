import { Sparkles, MessageCircle, User, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "../../routes"
import { signOut } from "../../auth"

interface HeaderProps {
  subtitle?: string
  fixed?: boolean
}

export default function Header({
  subtitle = "Your Dream Gown Awaits",
  fixed = false,
}: HeaderProps) {
  const session = useSession()
  const navigate = useNavigate()
  const unreadCount = 3

  const isAdmin = session?.user?.user_metadata?.role === "admin"

  const displayName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.first_name ||
    session?.user?.email?.split("@")[0] ||
    null

  async function handleSignOut() {
    await signOut()
    navigate("/login")
  }

  return (
    <header
      className={`border-b border-stone-200/50 bg-white/80 backdrop-blur-sm ${
        fixed ? "fixed" : "sticky"
      } top-0 z-40 w-full`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-stone-600" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate font-serif text-base sm:text-lg md:text-xl text-stone-800">
                  Bride Me Up
                </h1>
                <p className="hidden sm:block truncate text-xs text-stone-500">
                  {subtitle}
                </p>
              </div>
            </Link>

            {/* DESKTOP USER SECTION */}
{/* DESKTOP USER SECTION */}
{session ? (
  <div className="hidden lg:flex items-center gap-4 ml-auto">

    <div className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 shadow-sm">
      <span className="text-sm text-stone-700">
        Welcome, <span className="font-semibold">
          {isAdmin ? "Admin" : displayName || "Customer"}
        </span>
      </span>
    </div>

    <Link
      to="/profile"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/70 hover:bg-stone-50"
      title="Profile"
    >
      <User className="h-5 w-5 text-stone-600" />
    </Link>

    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>

  </div>
) : (
  <Link
    to="/login"
    className="hidden lg:inline-flex ml-auto rounded-full bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-6 py-2 text-sm text-stone-700 hover:shadow-md"
  >
    Sign In
  </Link>
)}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs sm:text-sm text-stone-600 hover:text-stone-800"
              >
                Admin
              </Link>
            )}

            <Link
              to="/"
              className="text-xs sm:text-sm text-stone-600 hover:text-stone-800"
            >
              Home
            </Link>

            <Link
              to="/gallery"
              className="text-xs sm:text-sm text-stone-600 hover:text-stone-800"
            >
              Gallery
            </Link>

            <Link
              to="/isabella"
              className="text-xs sm:text-sm text-stone-600 hover:text-stone-800"
            >
              Consultant
            </Link>

            {isAdmin ? (
              <Link
                to="/clients-chats"
                className="relative ml-0 sm:ml-1 inline-flex items-center gap-2 rounded-full border border-stone-200/50 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-stone-700 transition-all hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Client Chats</span>
                <span className="sm:hidden">Chats</span>

                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-medium text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 px-3 sm:px-4 py-2 text-xs sm:text-sm text-stone-700 transition-all hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden md:inline">Chat with Owner</span>
                <span className="md:hidden">Chat</span>
              </Link>
            )}

            {/* MOBILE USER SECTION */}
{session ? (
  <div className="flex items-center gap-2 lg:hidden">
    <Link
      to="/profile"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70 shadow-sm hover:bg-stone-50"
      title="Profile"
    >
      <User className="h-4 w-4 text-stone-600" />
    </Link>

    <button
      onClick={handleSignOut}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/70 shadow-sm hover:bg-stone-50"
      title="Sign out"
    >
      <LogOut className="h-4 w-4 text-stone-600" />
    </button>
  </div>
) : (
  <Link
    to="/login"
    className="lg:hidden rounded-full bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 px-4 py-2 text-sm text-stone-700 hover:shadow-md"
  >
    Sign In
  </Link>
)}
          </div>
        </div>
      </div>
    </header>
  )
}