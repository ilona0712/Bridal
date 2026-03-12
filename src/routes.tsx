import { createBrowserRouter, Navigate } from "react-router-dom"
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
import ProfilePage       from "./pages/ProfilePage"

// ── Session context ──────────────────────────────────────────
export const SessionContext = createContext<Session | null>(null)
export const useSession = () => useContext(SessionContext)

// ── Role helpers ─────────────────────────────────────────────
export function useRole() {
  const session = useSession()
  return session?.user?.user_metadata?.role ?? null
}

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

// ── Route guards ─────────────────────────────────────────────

// Must be logged in as customer
function CustomerRoute({ children, allowAdmin = false }: { children: React.ReactNode, allowAdmin?: boolean }) {
  const session = useSession()
  const role    = useRole()
  if (!session)                        return <Navigate to="/login" replace />
  if (role === "admin" && !allowAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

// Must be logged in as admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const role    = useRole()
  if (!session)          return <Navigate to="/login" replace />
  if (role !== "admin")  return <Navigate to="/" replace />
  return <>{children}</>
}

// ── Router ───────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public — anyone can visit
  { path: "/login",       element: <LoginPage /> },
  { path: "/signup",      element: <SignupPage /> },
  { path: "/check-email", element: <CheckEmailPage /> },
  { path: "/",            element: <HomePage /> },
  { path: "/home",        element: <HomePage /> },
  { path: "/gallery",     element: <GalleryPage /> },

  // Customer only
  { path: "/isabella", element: <CustomerRoute><IsabellaPage /></CustomerRoute> },
  { path: "/chat",     element: <CustomerRoute allowAdmin><ChatWithOwnerPage /></CustomerRoute> },
  { path: "/profile",  element: <CustomerRoute allowAdmin><ProfilePage /></CustomerRoute> },

  // Admin only
  { path: "/admin",    element: <AdminRoute><AdminPage /></AdminRoute> },
])