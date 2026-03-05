import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const isAdmin = true; // temporary (later from database or login)

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}