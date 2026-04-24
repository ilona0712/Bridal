import { useCallback, useEffect, useMemo, useState } from "react";

const CONSENT_STORAGE_KEY = "cookie_consent";
const SESSION_DISMISSED_KEY = "cookie_banner_dismissed";
const CONSENT_VERSION = "1.0";
const DEFAULT_PREFERENCES = {
  necessary: true,
  analytics: false,
};

function parseStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    if (parsed.version !== CONSENT_VERSION) return "invalid_version";

    const preferences = parsed.preferences ?? {};
    if (preferences.necessary !== true || typeof preferences.analytics !== "boolean") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function deleteCookie(cookieName) {
  const host = window.location.hostname;
  const domainParts = host.split(".");
  const domains = ["", host];

  if (domainParts.length > 2) {
    domains.push(`.${domainParts.slice(-2).join(".")}`);
  }

  domains.forEach((domain) => {
    const domainPart = domain ? `;domain=${domain}` : "";
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}`;
  });
}

function clearAnalyticsCookies() {
  document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))
    .forEach(deleteCookie);
}

function buildConsent(preferences) {
  return {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    preferences: {
      necessary: true,
      analytics: Boolean(preferences.analytics),
    },
  };
}

export default function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = parseStoredConsent();

    if (stored === "invalid_version") {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      setConsent(null);
      setShowBanner(true);
      return;
    }

    if (!stored) {
      setConsent(null);
      setShowBanner(sessionStorage.getItem(SESSION_DISMISSED_KEY) !== "1");
      return;
    }

    setConsent(stored);
    setShowBanner(false);
  }, []);

  const persistConsent = useCallback((nextConsent, previousConsent = consent) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(nextConsent));

    if (previousConsent?.preferences?.analytics && !nextConsent.preferences.analytics) {
      clearAnalyticsCookies();
    }

    setConsent(nextConsent);
    setShowBanner(false);
  }, [consent]);

  const acceptAll = useCallback(() => {
    persistConsent(buildConsent({ necessary: true, analytics: true }));
  }, [persistConsent]);

  const rejectAll = useCallback(() => {
    persistConsent(buildConsent({ necessary: true, analytics: false }));
  }, [persistConsent]);

  const savePreferences = useCallback((prefs = {}) => {
    const nextPreferences = {
      ...DEFAULT_PREFERENCES,
      ...prefs,
      necessary: true,
    };

    persistConsent(buildConsent(nextPreferences));
  }, [persistConsent]);

  const dismissForSession = useCallback(() => {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
    setShowBanner(false);
  }, []);

  const hasConsented = useCallback((type) => {
    if (type === "necessary") return true;
    return Boolean(consent?.preferences?.[type]);
  }, [consent]);

  return useMemo(() => ({
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    savePreferences,
    hasConsented,
    dismissForSession,
  }), [consent, showBanner, acceptAll, rejectAll, savePreferences, hasConsented, dismissForSession]);
}
