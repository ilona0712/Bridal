import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/gallery", element: <GalleryPage /> },
  { path: "/Admin", element: <AdminPage /> },
  { path: "/admin", element: <AdminPage /> },
]);