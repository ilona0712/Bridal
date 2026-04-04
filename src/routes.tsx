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
import ClientsChatPage from "./pages/ClientsChatPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage  from "./pages/ResetPasswordPage"

// ── Session context ──────────────────────────────────────────
export const SessionContext = createContext<Session | null>(null)
export const RoleContext    = createContext<string | null>(null)
export const useSession = () => useContext(SessionContext)

// ── Role helpers ─────────────────────────────────────────────
export function useRole() {
  return useContext(RoleContext)
}

// ── Root — manages session at top level ─────────────────────
export function Root({ children }: { children: React.ReactNode }) {
  const [session,  setSession]  = useState<Session | null | undefined>(undefined)
  const [role,     setRole]     = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  async function fetchRole(userId: string | undefined | null) {
    if (!userId) { setRole(null); return }
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
    if (error) {
      console.error("Failed to load role from profiles:", error)
      setRole("customer")
      return
    }
    setRole(data?.role ?? "customer")
  }

  useEffect(() => {
    let alive = true
    const failSafe = setTimeout(() => {
      if (alive) setChecking(false)
    }, 2000)

    const applySession = async (nextSession: Session | null) => {
      if (!alive) return
      setSession(nextSession)
      setChecking(true)
      try {
        await fetchRole(nextSession?.user?.id)
      } catch (error) {
        console.error("Role lookup failed:", error)
        setRole("customer")
      } finally {
        if (alive) setChecking(false)
      }
    }

    supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .catch((error) => {
        console.error("getSession failed:", error)
        setSession(null)
        setRole(null)
        setChecking(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        ensureProfile(session.user).catch(console.error)
      }
      await applySession(session)
    })

    // If user didn't check Remember Me → sign out when browser closes
    if (sessionStorage.getItem("rememberMe") === "false") {
    window.addEventListener("beforeunload", () => {
    supabase.auth.signOut()
  })
}

    return () => { alive = false; clearTimeout(failSafe); subscription.unsubscribe() }
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400">
      Loading…
    </div>
  )

  return (
    <SessionContext.Provider value={session ?? null}>
      <RoleContext.Provider value={role}>
        {children}
      </RoleContext.Provider>
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
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password",  element: <ResetPasswordPage /> },

  // Customer only
  { path: "/isabella", element: <CustomerRoute allowAdmin><IsabellaPage /></CustomerRoute> },
  { path: "/chat",     element: <CustomerRoute allowAdmin><ChatWithOwnerPage /></CustomerRoute> },
  { path: "/profile",  element: <CustomerRoute allowAdmin><ProfilePage /></CustomerRoute> },

  // Admin only
  { path: "/admin",    element: <AdminRoute><AdminPage /></AdminRoute> },
  { path: "/clients-chats", element: <AdminRoute><ClientsChatPage /></AdminRoute> },
])
