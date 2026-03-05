import { Navigate } from "react-router-dom";
import { isAdmin } from "./auth";
import type { JSX } from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}