import { createBrowserRouter, Navigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { ensureProfile } from "./auth"
import { useEffect, useState, createContext, useContext } from "react"
import type { Session } from "@supabase/supabase-js"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import CheckEmailPage from "./pages/CheckEmailPage"
import IsabellaPage from "./pages/IsabellaPage"
import ChatWithOwnerPage from "./pages/ChatWithOwnerPage"
import AdminPage from "./pages/AdminPage"
import GalleryPage from "./pages/GalleryPage"
import ProfilePage from "./pages/ProfilePage"
import ClientsChatPage from "./pages/ClientsChatPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"

export const SessionContext = createContext<Session | null>(null)
export const RoleContext = createContext<string | null>(null)
export const RoleLoadingContext = createContext<boolean>(false)

export const useSession = () => useContext(SessionContext)
export const useRole = () => useContext(RoleContext)
export const useRoleLoading = () => useContext(RoleLoadingContext)

export function Root({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [role, setRole] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [roleLoading, setRoleLoading] = useState(false)

  async function fetchRole(userId: string | undefined | null) {
    if (!userId) {
      setRole(null)
      return
    }

    setRoleLoading(true)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        console.error("Failed to load role from profiles:", error)
        setRole(null)
        return
      }

      setRole(data?.role ?? "customer")
    } catch (error) {
      console.error("Role lookup failed:", error)
      setRole(null)
    } finally {
      setRoleLoading(false)
    }
  }

  useEffect(() => {
    let alive = true

    const applySession = (nextSession: Session | null) => {
      if (!alive) return
      setSession(nextSession)
      setCheckingSession(false)
      void fetchRole(nextSession?.user?.id)
    }

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch((error) => {
        console.error("getSession failed:", error)
        setSession(null)
        setRole(null)
        setCheckingSession(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_IN" && nextSession?.user) {
        ensureProfile(nextSession.user).catch(console.error)
      }
      applySession(nextSession)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading…
      </div>
    )
  }

  return (
    <SessionContext.Provider value={session ?? null}>
      <RoleContext.Provider value={role}>
        <RoleLoadingContext.Provider value={roleLoading}>
          {children}
        </RoleLoadingContext.Provider>
      </RoleContext.Provider>
    </SessionContext.Provider>
  )
}

function CustomerRoute({
  children,
  allowAdmin = false,
}: {
  children: React.ReactNode
  allowAdmin?: boolean
}) {
  const session = useSession()
  const role = useRole()

  if (!session) return <Navigate to="/login" replace />
  if (role === "admin" && !allowAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const role = useRole()
  const roleLoading = useRoleLoading()

  if (!session) return <Navigate to="/login" replace />
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading…
      </div>
    )
  }
  if (role !== "admin") return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/check-email", element: <CheckEmailPage /> },
  { path: "/", element: <HomePage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/gallery", element: <GalleryPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  { path: "/isabella", element: <CustomerRoute allowAdmin><IsabellaPage /></CustomerRoute> },
  { path: "/chat", element: <CustomerRoute allowAdmin><ChatWithOwnerPage /></CustomerRoute> },
  { path: "/profile", element: <CustomerRoute allowAdmin><ProfilePage /></CustomerRoute> },

  { path: "/admin", element: <AdminRoute><AdminPage /></AdminRoute> },
  { path: "/clients-chats", element: <AdminRoute><ClientsChatPage /></AdminRoute> },
])