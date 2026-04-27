import { supabase } from "../../lib/supabase";

export type PushNotificationType =
  | "chat_message"
  | "rental_request_submitted"
  | "rental_status_updated"
  | "custom_request_submitted"
  | "custom_request_review_updated"
  | "collection_published";

type PushNotificationBody = {
  type: PushNotificationType;
  conversationId?: string;
  senderUserId?: string;
  senderName?: string;
  rentalId?: string;
  dressName?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  rentalStatus?: string;
  sessionId?: string;
  requestStatus?: string;
  collectionId?: string;
  collectionName?: string;
};

type NativePlatform = "ios" | "android" | "web";

export type PushRegistrationResult =
  | "success"
  | "unsupported"
  | "localhost"
  | "missing_public_key"
  | "permission_denied"
  | "already_in_progress"
  | "save_failed"
  | "error";

const WEB_PUSH_PUBLIC_KEY =
  import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY ??
  import.meta.env.REACT_APP_WEB_PUSH_PUBLIC_KEY;

let nativePushRegistrationStarted = false;
let webPushRegistrationStarted = false;

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
}

function isNativeRuntime() {
  return typeof window !== "undefined" && "Capacitor" in window;
}

export function isBrowserPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default";
  }
  return Notification.permission;
}

// ✅ FIX: Allow if "default" (never asked) OR "granted" (asked but maybe not subscribed yet)
// This lets the subscribe flow re-run even after permission is granted, to ensure
// the subscription is actually saved to the DB.
export function canRequestBrowserNotificationPermission() {
  if (!isBrowserPushSupported()) return false;
  const permission = getBrowserNotificationPermission();
  // Only block if explicitly denied — otherwise always allow the flow to proceed
  return permission !== "denied";
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4 || 4)) % 4);
  const base64 = `${value}${padding}`.replaceAll("-", "+").replaceAll("_", "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

async function savePushToken(token: string, platform: NativePlatform) {
  const { error } = await supabase.rpc("register_push_token", {
    p_token: token,
    p_platform: platform,
  });

  if (error) {
    console.error("Failed to save push token:", error);
    return false;
  }

  console.info("Push notification token saved.");
  return true;
}

export async function registerBrowserForPushNotifications(): Promise<PushRegistrationResult> {
  if (isLocalhost()) return "localhost";
  if (!isBrowserPushSupported()) return "unsupported";
  if (!WEB_PUSH_PUBLIC_KEY) {
    console.warn("Web push public key is missing. Skipping browser push registration.");
    return "missing_public_key";
  }
  if (webPushRegistrationStarted) return "already_in_progress";

  webPushRegistrationStarted = true;

  try {
    // ✅ FIX: Request permission first (required to be close to user gesture)
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Browser notification permission was not granted:", permission);
      return "permission_denied";
    }

    // ✅ FIX: Register SW explicitly if not yet registered
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }

    // Wait for the SW to be active
    await navigator.serviceWorker.ready;

    // ✅ FIX: Always try to get or create subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
      });
    }

    // ✅ FIX: Always re-save — covers case where user allowed before but DB save failed
    const saved = await savePushToken(JSON.stringify(subscription.toJSON()), "web");
    return saved ? "success" : "save_failed";
  } catch (error) {
    console.error("Browser push notification registration failed:", error);
    return "error";
  } finally {
    // ✅ FIX: Always reset the flag so user can retry
    webPushRegistrationStarted = false;
  }
}

async function getCapacitorPlatform(): Promise<NativePlatform> {
  const { Capacitor } = await import("@capacitor/core");
  const platform = Capacitor.getPlatform();
  if (platform === "ios" || platform === "android") return platform;
  return "web";
}

export async function registerDeviceForPushNotifications(userId: string) {
  if (!userId) return "error" as const;

  if (!isNativeRuntime()) {
    // ✅ FIX: Don't gate on current permission — let the flow handle it
    return registerBrowserForPushNotifications();
  }

  const platform = await getCapacitorPlatform();

  if (platform === "web") return registerBrowserForPushNotifications();
  if (nativePushRegistrationStarted) return "already_in_progress" as const;

  nativePushRegistrationStarted = true;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== "granted") {
      console.warn("Push notification permission was not granted:", permission);
      return "permission_denied" as const;
    }

    await PushNotifications.addListener("registration", async ({ value }) => {
      console.info("Push notification token received.");
      await savePushToken(value, platform);
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.error("Push notification registration error:", error);
    });

    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      ({ notification }) => {
        const path = notification.data?.path;
        if (typeof path === "string" && path.startsWith("/")) {
          window.location.assign(path);
        }
      },
    );

    await PushNotifications.register();
    return "success" as const;
  } catch (error) {
    console.error("Push notification registration failed:", error);
    return "error" as const;
  } finally {
    nativePushRegistrationStarted = false;
  }
}

export async function enablePushNotifications(userId: string) {
  if (!userId) return "error" as const;
  if (!isNativeRuntime()) return registerBrowserForPushNotifications();
  return registerDeviceForPushNotifications(userId);
}

export async function sendPushNotification(body: PushNotificationBody) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    const { data, error } = await supabase.functions.invoke("send-push-notification", {
      body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "x-supabase-auth": `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Push notification request failed:", error);
    } else {
      console.info("Push notification request result:", data);
    }
  } catch (error) {
    console.error("Push notification request failed:", error);
  }
}