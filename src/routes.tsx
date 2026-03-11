import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { ensureProfile } from "./auth"
import { useEffect, useState, createContext, useContext } from "react"
import type { Session } from "@supabase/supabase-js"
import LoginPage         from "./pages/LoginPage"
import HomePage          from "./pages/HomePage"
import SignupPage        from "./pages/SignupPage"
import CheckEmailPage    from "./pages/CheckEmailPage"
import IsabellaPage      from "./pages/IsabellaPage"
import ChatWithOwnerPage from "./pages/ChatWithOwnerPage"
import AdminPage         from "./pages/AdminPage"
import GalleryPage       from "./pages/GalleryPage"
import AdminRoute        from "./AdminRoute"
import ProfilePage       from "./pages/ProfilePage"

// ── Session context — accessible anywhere in the app ────────
export const SessionContext = createContext<Session | null>(null)
export const useSession = () => useContext(SessionContext)

// ── Root — manages session at top level ─────────────────────
export function Root({ children }: { children: React.ReactNode }) {
  const [session,  setSession]  = useState<Session | null | undefined>(undefined)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setChecking(false)
      if (event === "SIGNED_IN" && session?.user) {
        ensureProfile(session.user).catch(console.error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400">
      Loading…
    </div>
  )

  return (
    <SessionContext.Provider value={session ?? null}>
      {children}
    </SessionContext.Provider>
  )
}

// ── Protected route — redirects to /login if not logged in ──
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession()
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Router ───────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public
  { path: "/login",       element: <LoginPage /> },
  { path: "/signup",      element: <SignupPage /> },
  { path: "/check-email", element: <CheckEmailPage /> },
  { path: "/",            element: <HomePage /> },
  { path: "/home",        element: <HomePage /> },
  { path: "/gallery",     element: <GalleryPage /> },

  // Protected
  { path: "/isabella", element: <ProtectedRoute><IsabellaPage /></ProtectedRoute> },
  { path: "/chat",     element: <ProtectedRoute><ChatWithOwnerPage /></ProtectedRoute> },
  { path: "/profile",  element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },

  // Admin only
  { path: "/admin", element: <AdminRoute><AdminPage /></AdminRoute> },
])