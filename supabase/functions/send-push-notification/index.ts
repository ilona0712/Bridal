import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-auth",
};

type PushType =
  | "chat_message"
  | "rental_request_submitted"
  | "rental_status_updated"
  | "custom_request_submitted"
  | "custom_request_review_updated"
  | "collection_published";

type RequestBody = {
  type?: PushType;
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

type Recipient = {
  id: string;
  role: string;
  full_name: string | null;
};

type NotificationPayload = {
  userIds: string[];
  title: string;
  body: string;
  type: PushType;
  path: string;
};

type PushTokenRow = {
  token: string;
  platform: "ios" | "android" | "web";
};

type FirebaseServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value: string | undefined) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function getAdmins(serviceClient: ReturnType<typeof createClient>) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, role, full_name")
    .in("role", ["admin", "designer"]);

  if (error) throw new Error(error.message);
  return (data ?? []) as Recipient[];
}

async function getCustomers(serviceClient: ReturnType<typeof createClient>) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("id, role, full_name")
    .eq("role", "customer");

  if (error) throw new Error(error.message);
  return (data ?? []) as Recipient[];
}

async function buildPayload(
  serviceClient: ReturnType<typeof createClient>,
  body: RequestBody,
): Promise<NotificationPayload> {
  const type = body.type;

  if (!type) {
    throw new Error("type is required.");
  }

  if (type === "chat_message") {
    const conversationId = clean(body.conversationId);
    const senderUserId = clean(body.senderUserId);

    if (!conversationId || !senderUserId) {
      throw new Error("conversationId and senderUserId are required.");
    }

    const { data: conversation, error } = await serviceClient
      .from("conversations")
      .select("id, customer_id, designer_id")
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      throw new Error(error?.message || "Conversation not found.");
    }

    const admins = await getAdmins(serviceClient);
    const adminIds = admins.map((admin) => admin.id);
    const senderName = clean(body.senderName) || "Someone";
    const isCustomer = conversation.customer_id === senderUserId;
    const userIds = isCustomer
      ? adminIds
      : [conversation.customer_id].filter(Boolean);

    return {
      userIds,
      title: isCustomer ? "New client message" : "New message from Maria Badari",
      body: isCustomer
        ? `${senderName} sent you a message.`
        : "Your designer replied to your conversation.",
      type,
      path: isCustomer ? "/clients-chats" : "/chat",
    };
  }

  if (type === "rental_request_submitted") {
    const admins = await getAdmins(serviceClient);
    const dressName = clean(body.dressName) || "a dress";
    const customerName = clean(body.customerName) || "A customer";
    const start = formatDate(body.startDate);
    const end = formatDate(body.endDate);

    return {
      userIds: admins.map((admin) => admin.id),
      title: "New rental request",
      body:
        start && end
          ? `${customerName} requested ${dressName} for ${start} to ${end}.`
          : `${customerName} requested ${dressName}.`,
      type,
      path: "/clients-chats",
    };
  }

  if (type === "rental_status_updated") {
    const rentalId = clean(body.rentalId);
    let customerId = "";
    let dressName = clean(body.dressName) || "your dress";
    let status = clean(body.rentalStatus);

    if (rentalId) {
      const { data: rental, error } = await serviceClient
        .from("rentals")
        .select("customer_id, status, dresses(name)")
        .eq("id", rentalId)
        .single();

      if (error || !rental) {
        throw new Error(error?.message || "Rental not found.");
      }

      customerId = rental.customer_id;
      status = status || rental.status;
      dressName = rental.dresses?.name || dressName;
    }

    customerId = customerId || clean(body.senderUserId);
    if (!customerId) throw new Error("rentalId or customer user id is required.");

    const labels: Record<string, string> = {
      pending: "Rental request received",
      reviewed: "Rental request reviewed",
      confirmed: "Rental confirmed",
      rejected: "Rental unavailable",
      returned: "Dress returned",
    };

    return {
      userIds: [customerId],
      title: labels[status] || "Rental status updated",
      body:
        status === "confirmed"
          ? `Your rental request for ${dressName} has been confirmed.`
          : `Your rental request for ${dressName} is now ${status || "updated"}.`,
      type,
      path: "/chat",
    };
  }

  if (type === "custom_request_submitted") {
    const admins = await getAdmins(serviceClient);
    const customerName = clean(body.customerName) || "A customer";

    return {
      userIds: admins.map((admin) => admin.id),
      title: "New customization request",
      body: `${customerName} submitted a MAI custom dress request.`,
      type,
      path: "/admin/requests",
    };
  }

  if (type === "custom_request_review_updated") {
    const sessionId = clean(body.sessionId);
    let customerId = clean(body.senderUserId);
    let status = clean(body.requestStatus);

    if (sessionId) {
      const { data: requestRow, error } = await serviceClient
        .from("chatbot_sessions")
        .select("customer_id, status")
        .eq("id", sessionId)
        .single();

      if (error || !requestRow) {
        throw new Error(error?.message || "Customization request not found.");
      }

      customerId = requestRow.customer_id;
      status = status || requestRow.status;
    }

    if (!customerId) {
      throw new Error("sessionId or customer user id is required.");
    }

    const variants: Record<string, { title: string; body: string }> = {
      pending_review: {
        title: "Your dress request is being reviewed",
        body: "Our designer is reviewing your custom dress preferences.",
      },
      rejected: {
        title: "Custom dress request update",
        body: "Your designer needs changes before creating the preview.",
      },
      image_requested: {
        title: "Preview in progress",
        body: "Your custom dress preview is being generated.",
      },
      generation_failed: {
        title: "Preview needs attention",
        body: "We could not generate the preview. Your designer will review it.",
      },
      image_generated: {
        title: "Your custom dress preview is ready",
        body: "Open Maria Badari to view your generated dress preview.",
      },
      completed: {
        title: "Your custom dress preview is ready",
        body: "Open Maria Badari to view your generated dress preview.",
      },
    };

    const variant = variants[status] ?? {
      title: "Custom dress request updated",
      body: "Your custom dress request has a new update.",
    };

    return {
      userIds: [customerId],
      title: variant.title,
      body: variant.body,
      type,
      path: "/chat",
    };
  }

  if (type === "collection_published") {
    const customers = await getCustomers(serviceClient);
    const collectionName = clean(body.collectionName) || "A new collection";

    return {
      userIds: customers.map((customer) => customer.id),
      title: `${collectionName} is now live`,
      body: "New bridal looks are available in the gallery.",
      type,
      path: "/gallery",
    };
  }

  throw new Error("Unsupported notification type.");
}

function base64UrlEncode(input: ArrayBuffer | string) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function importRsaPrivateKey(privateKeyPem: string) {
  const normalizedPem = privateKeyPem.replaceAll("\\n", "\n");
  const base64 = normalizedPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function getFirebaseAccessToken(serviceAccount: FirebaseServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const key = await importRsaPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${base64UrlEncode(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data?.error_description || "Failed to authorize Firebase.");
  }

  return data.access_token as string;
}

async function sendFcmMessages(tokens: string[], payload: NotificationPayload) {
  const rawServiceAccount =
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64") ??
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");

  if (!rawServiceAccount || tokens.length === 0) {
    return { sent: 0, skipped: tokens.length };
  }

  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64")
    ? new TextDecoder().decode(
        Uint8Array.from(atob(rawServiceAccount), (char) => char.charCodeAt(0)),
      )
    : rawServiceAccount;
  const serviceAccount = JSON.parse(serviceAccountJson) as FirebaseServiceAccount;
  const accessToken = await getFirebaseAccessToken(serviceAccount);
  const endpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

  const results = await Promise.all(
    tokens.map(async (token) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              type: payload.type,
              path: payload.path,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("FCM delivery failed:", {
          status: response.status,
          body: errorText,
        });
      }

      return response.ok;
    }),
  );

  return {
    sent: results.filter(Boolean).length,
    skipped: results.filter((ok) => !ok).length,
  };
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function createApnsJwt() {
  const keyId = Deno.env.get("APNS_KEY_ID");
  const teamId = Deno.env.get("APNS_TEAM_ID");
  const privateKey = Deno.env.get("APNS_PRIVATE_KEY");

  if (!keyId || !teamId || !privateKey) return null;

  const header = base64UrlEncode(
    JSON.stringify({
      alg: "ES256",
      kid: keyId,
    }),
  );
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const signingInput = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey.replaceAll("\\n", "\n")),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function sendApnsMessages(tokens: string[], payload: NotificationPayload) {
  const bundleId = Deno.env.get("APNS_BUNDLE_ID");
  const jwt = await createApnsJwt();

  if (!bundleId || !jwt || tokens.length === 0) {
    return { sent: 0, skipped: tokens.length };
  }

  const isProduction = Deno.env.get("APNS_PRODUCTION") === "true";
  const host = isProduction
    ? "https://api.push.apple.com"
    : "https://api.sandbox.push.apple.com";

  const results = await Promise.all(
    tokens.map(async (token) => {
      const response = await fetch(`${host}/3/device/${token}`, {
        method: "POST",
        headers: {
          authorization: `bearer ${jwt}`,
          "apns-topic": bundleId,
          "apns-push-type": "alert",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
          },
          type: payload.type,
          path: payload.path,
        }),
      });

      return response.ok;
    }),
  );

  return {
    sent: results.filter(Boolean).length,
    skipped: results.filter((ok) => !ok).length,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, {
      error: "Missing Supabase environment variables.",
    });
  }

  const authHeader =
    request.headers.get("x-supabase-auth") ??
    request.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse(401, { error: "Missing authorization header." });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  const gatewayUserId = request.headers.get("sb-auth-user-id");
  const callerUserId = user?.id ?? gatewayUserId;

  if (!callerUserId) {
    console.error("send-push-notification auth failed:", {
      message: userError?.message ?? "No user id available.",
      hasAuthorizationHeader: Boolean(request.headers.get("Authorization")),
      hasCustomAuthHeader: Boolean(request.headers.get("x-supabase-auth")),
      hasGatewayUserId: Boolean(gatewayUserId),
    });
    return jsonResponse(401, { error: "User authentication failed." });
  }

  try {
    const body = (await request.json()) as RequestBody;

    const { data: callerProfile, error: callerProfileError } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", callerUserId)
      .single();

    if (callerProfileError || !callerProfile) {
      return jsonResponse(403, { error: "Caller profile was not found." });
    }

    const isPrivilegedCaller = ["admin", "designer"].includes(callerProfile.role);
    const privilegedTypes: PushType[] = [
      "rental_status_updated",
      "custom_request_review_updated",
      "collection_published",
    ];

    if (body.type === "chat_message" && body.senderUserId !== callerUserId) {
      return jsonResponse(403, { error: "Chat sender does not match caller." });
    }

    if (body.type && privilegedTypes.includes(body.type) && !isPrivilegedCaller) {
      return jsonResponse(403, { error: "This notification type requires admin access." });
    }

    const payload = await buildPayload(serviceClient, body);
    const userIds = [...new Set(payload.userIds)].filter((id) => id !== callerUserId);

    if (userIds.length === 0) {
      return jsonResponse(200, { sent: 0, recipients: 0 });
    }

    const notificationRows = userIds.map((userId) => ({
      user_id: userId,
      type: payload.type,
      message: payload.body,
    }));

    await serviceClient.from("notifications").insert(notificationRows);

    const { data: tokenRows, error: tokenError } = await serviceClient
      .from("push_tokens")
      .select("token, platform")
      .in("user_id", userIds);

    if (tokenError) {
      throw new Error(tokenError.message);
    }

    const tokens = (tokenRows ?? []) as PushTokenRow[];
    const androidTokens = [
      ...new Set(
        tokens
          .filter((row) => row.platform === "android" || row.platform === "web")
          .map((row) => row.token),
      ),
    ];
    const iosTokens = [
      ...new Set(tokens.filter((row) => row.platform === "ios").map((row) => row.token)),
    ];
    const [fcmDelivery, apnsDelivery] = await Promise.all([
      sendFcmMessages(androidTokens, payload),
      sendApnsMessages(iosTokens, payload),
    ]);

    return jsonResponse(200, {
      recipients: userIds.length,
      tokens: androidTokens.length + iosTokens.length,
      sent: fcmDelivery.sent + apnsDelivery.sent,
      skipped: fcmDelivery.skipped + apnsDelivery.skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Push delivery failed.";
    console.error("send-push-notification failed:", message);
    return jsonResponse(400, { error: message });
  }
});
