import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-auth",
};

type GenerateRequestBody = {
  sessionId?: string;
  prompt?: string | null;
};

type DressImageRow = {
  image_url: string | null;
  is_primary: boolean | null;
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

function decodeBase64Image(input: string) {
  const normalized = input.includes(",") ? input.split(",").pop() ?? input : input;
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function fetchImageAsFile(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch base dress image (${response.status}).`);
  }

  const bytes = await response.arrayBuffer();
  const mimeType = response.headers.get("content-type") || "image/png";
  const extension = mimeType.includes("jpeg")
    ? "jpg"
    : mimeType.includes("webp")
      ? "webp"
      : "png";

  return new File([bytes], `base-dress.${extension}`, { type: mimeType });
}

async function generateImageWithOpenAI(
  prompt: string,
  openAiKey: string,
  baseImageUrl: string | null,
) {
  if (baseImageUrl) {
    const imageFile = await fetchImageAsFile(baseImageUrl);
    const formData = new FormData();
    formData.append("model", "gpt-image-1.5");
    formData.append("prompt", prompt);
    formData.append("quality", "auto");
    formData.append("size", "1024x1536");
    formData.append("image", imageFile);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
      },
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        `OpenAI image edit request failed (${response.status}).`;
      throw new Error(message);
    }

    return payload;
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1.5",
      prompt,
      quality: "auto",
      size: "1024x1536",
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `OpenAI image generation request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload;
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
  const openAiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !openAiKey) {
    return jsonResponse(500, {
      error:
        "Missing required environment variables for Supabase or OpenAI integration.",
    });
  }

  const authHeader =
    request.headers.get("x-supabase-auth") ??
    request.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse(401, { error: "Missing authorization header." });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
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

  if (userError || !user) {
    return jsonResponse(401, { error: "User authentication failed." });
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "designer"].includes(profile.role)) {
    return jsonResponse(403, { error: "Only admins or designers can generate previews." });
  }

  const body = (await request.json()) as GenerateRequestBody;
  const sessionId = body.sessionId?.trim();
  const sessionIdForError: string | null = sessionId ?? null;

  if (!sessionId) {
    return jsonResponse(400, { error: "sessionId is required." });
  }

  try {
    const { data: session, error: sessionError } = await serviceClient
      .from("chatbot_sessions")
      .select("id, dress_id, generated_prompt")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return jsonResponse(404, { error: "Customization request not found." });
    }

    const prompt = body.prompt?.trim() || session.generated_prompt?.trim();

    if (!prompt) {
      return jsonResponse(400, { error: "A prompt is required before generation." });
    }

    let baseImageUrl: string | null = null;

    if (session.dress_id) {
      const { data: dressImages, error: dressImagesError } = await serviceClient
        .from("dress_images")
        .select("image_url, is_primary")
        .eq("dress_id", session.dress_id);

      if (dressImagesError) {
        throw new Error("Failed to load the base dress image.");
      }

      const images = (dressImages ?? []) as DressImageRow[];
      baseImageUrl =
        images.find((image) => image.is_primary)?.image_url ??
        images[0]?.image_url ??
        null;
    }

    const { error: pendingUpdateError } = await serviceClient
      .from("chatbot_sessions")
      .update({
        generated_prompt: prompt,
        status: "image_requested",
        generation_error: null,
      })
      .eq("id", session.id);

    if (pendingUpdateError) {
      throw new Error("Failed to mark the request as generating.");
    }

    const openAiPayload = await generateImageWithOpenAI(prompt, openAiKey, baseImageUrl);
    const imageData = openAiPayload?.data?.[0];

    if (!imageData) {
      throw new Error("OpenAI did not return any image data.");
    }

    let imageBytes: Uint8Array;

    if (imageData.b64_json) {
      imageBytes = decodeBase64Image(imageData.b64_json);
    } else if (imageData.url) {
      const response = await fetch(imageData.url);

      if (!response.ok) {
        throw new Error("OpenAI returned an image URL that could not be fetched.");
      }

      imageBytes = new Uint8Array(await response.arrayBuffer());
    } else {
      throw new Error("OpenAI returned an unsupported image payload.");
    }

    const filePath = `${session.id}/${Date.now()}-${crypto.randomUUID()}.png`;
    const { error: uploadError } = await serviceClient.storage
      .from("generated-previews")
      .upload(filePath, imageBytes, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to store generated preview: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = serviceClient.storage.from("generated-previews").getPublicUrl(filePath);

    const { error: finalUpdateError } = await serviceClient
      .from("chatbot_sessions")
      .update({
        generated_prompt: prompt,
        image_url: publicUrl,
        status: "image_generated",
        generation_error: null,
        generated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (finalUpdateError) {
      throw new Error("Failed to update the request with the generated preview.");
    }

    return jsonResponse(200, {
      status: "image_generated",
      imageUrl: publicUrl,
      generationError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed.";

    if (sessionIdForError) {
      await serviceClient
        .from("chatbot_sessions")
        .update({
          status: "generation_failed",
          generation_error: message,
        })
        .eq("id", sessionIdForError);
    }

    return jsonResponse(500, {
      error: message,
      status: "generation_failed",
    });
  }
});
