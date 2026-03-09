import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import IsabellaPage from "./pages/IsabellaPage";
import ChatWithOwnerPage from "./pages/ChatWithOwnerPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import AdminRoute from "./AdminRoute";
import ProfilePage from "./pages/ProfilePage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/gallery", element: <GalleryPage /> },
  { path: "/isabella", element: <IsabellaPage /> },
  { path: "/chat", element: <ChatWithOwnerPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/home", element: <HomePage /> },
  { 
    path: "/admin", 
    element: (
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
    )
  }
]);
