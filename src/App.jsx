import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Root, router } from "./routes";
import useCookieConsent from "./hooks/useCookieConsent";
import CookieBanner from "./components/CookieBanner";
import "./index.css";

function loadGoogleAnalytics() {
  if (document.getElementById("ga-script")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX";
  document.head.appendChild(script);

  const inlineScript = document.createElement("script");
  inlineScript.id = "ga-inline";
  inlineScript.innerHTML =
    "window.dataLayer = window.dataLayer || [];" +
    "function gtag(){dataLayer.push(arguments);}" +
    "gtag('js', new Date());" +
    "gtag('config', 'G-XXXXXXXX');";
  document.head.appendChild(inlineScript);
}

export default function App() {
  const { showBanner, acceptAll, rejectAll, savePreferences, hasConsented } = useCookieConsent();

  useEffect(() => {
    if (hasConsented("analytics")) {
      loadGoogleAnalytics();
    }
  }, [hasConsented]);

  return (
    <ThemeProvider>
      <Root>
        <RouterProvider router={router} />
        {showBanner && (
          <CookieBanner
            onAcceptAll={acceptAll}
            onRejectAll={rejectAll}
            onSavePreferences={savePreferences}
            onClose={rejectAll}
          />
        )}
      </Root>
    </ThemeProvider>
  );
}
