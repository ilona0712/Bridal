import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import App from "./App.jsx"

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
  })
} else if ("serviceWorker" in navigator) {
  // Prevent stale PWA caches from blanking the local dev app.
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister()
    })
  })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
