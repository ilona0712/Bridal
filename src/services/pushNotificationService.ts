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

function isNativeRuntime() {
  return typeof window !== "undefined" && "Capacitor" in window;
}

async function getCapacitorPlatform(): Promise<NativePlatform> {
  const { Capacitor } = await import("@capacitor/core");
  const platform = Capacitor.getPlatform();

  if (platform === "ios" || platform === "android") {
    return platform;
  }

  return "web";
}

export async function registerDeviceForPushNotifications(userId: string) {
  if (!userId || !isNativeRuntime()) return;

  const platform = await getCapacitorPlatform();

  if (platform === "web") return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== "granted") {
      console.warn("Push notification permission was not granted:", permission);
      return;
    }

    await PushNotifications.addListener("registration", async ({ value }) => {
      console.info("Push notification token received.");

      const { error } = await supabase.rpc("register_push_token", {
        p_token: value,
        p_platform: platform,
      });

      if (error) {
        console.error("Failed to save push token:", error);
      } else {
        console.info("Push notification token saved.");
      }
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
  } catch (error) {
    console.error("Push notification registration failed:", error);
  }
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
