import { Bell, Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "../../routes";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import {
  canRequestBrowserNotificationPermission,
  enablePushNotifications,
  getBrowserNotificationPermission,
  isBrowserPushSupported,
} from "../../services/pushNotificationService";

const NOTIFICATION_PROMPT_DISMISSED_KEY = "mb_web_push_prompt_dismissed";

function hasDismissedNotificationPrompt() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY) === "true";
}

export default function PwaPrompt() {
  const session = useSession();
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [notificationPromptDismissed, setNotificationPromptDismissed] = useState(() =>
    hasDismissedNotificationPrompt(),
  );
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [installBusy, setInstallBusy] = useState(false);

  useEffect(() => {
    if (getBrowserNotificationPermission() === "granted") {
      setNotificationPromptDismissed(true);
    }
  }, [session?.user?.id]);

  const showNotificationPrompt =
    Boolean(session?.user?.id) &&
    isBrowserPushSupported() &&
    canRequestBrowserNotificationPermission() &&
    !notificationPromptDismissed;

  const showInstallPrompt = canInstall && !isInstalled;
  const showPrompt = showNotificationPrompt || showInstallPrompt;

  if (!showPrompt) {
    return null;
  }

  async function handleEnableNotifications() {
    if (!session?.user?.id) return;

    setIsEnablingNotifications(true);

    try {
      await enablePushNotifications(session.user.id);
      if (getBrowserNotificationPermission() !== "default") {
        setNotificationPromptDismissed(true);
      }
    } finally {
      setIsEnablingNotifications(false);
    }
  }

  function dismissNotificationPrompt() {
    window.localStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, "true");
    setNotificationPromptDismissed(true);
  }

  async function handleInstall() {
    setInstallBusy(true);

    try {
      await promptInstall();
    } finally {
      setInstallBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-stone-200/70 bg-white/95 p-4 shadow-2xl shadow-stone-900/10 backdrop-blur dark:border-stone-700/70 dark:bg-stone-900/95">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            {showNotificationPrompt ? (
              <Bell className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {showNotificationPrompt
                ? "Turn on notifications"
                : "Install Maria Badari"}
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {showNotificationPrompt
                ? "Allow notifications to keep receiving chat and request updates even when the site is closed."
                : "Install the site on your desktop for one-click access and a native app feel."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {showNotificationPrompt && (
                <button
                  onClick={handleEnableNotifications}
                  disabled={isEnablingNotifications}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  <Bell className="h-4 w-4" />
                  {isEnablingNotifications ? "Enabling..." : "Allow notifications"}
                </button>
              )}
              {showInstallPrompt && (
                <button
                  onClick={handleInstall}
                  disabled={installBusy}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                >
                  <Download className="h-4 w-4" />
                  {installBusy ? "Opening..." : "Install app"}
                </button>
              )}
            </div>
          </div>
          {showNotificationPrompt && (
            <button
              onClick={dismissNotificationPrompt}
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
