import { Navigate } from "react-router-dom"
import { useSession, useRole } from "./routes"
import type { JSX } from "react"

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const session = useSession()
  const role    = useRole()
  if (!session)         return <Navigate to="/login" replace />
  if (role !== "admin") return <Navigate to="/" replace />
  return children
}