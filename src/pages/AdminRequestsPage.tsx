import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Expand,
  LoaderCircle,
  RefreshCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Header from "../components/common/Header";
import { supabase } from "../../lib/supabase";
import type {
  AdminCustomizationRequest,
  ChatbotRequestStatus,
} from "../types/admin";

type ChatbotSessionRow = {
  id: string;
  customer_id: string;
  conversation_id: string | null;
  dress_id: string | null;
  request_summary: string | null;
  generated_prompt: string | null;
  image_url: string | null;
  generation_error: string | null;
  status: ChatbotRequestStatus;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type DressLookupRow = {
  id: string;
  name: string | null;
  dress_images:
    | {
        image_url: string | null;
        is_primary: boolean | null;
      }[]
    | null;
};

const REVIEWABLE_STATUSES: ChatbotRequestStatus[] = [
  "pending_review",
  "approved",
  "rejected",
  "image_requested",
  "image_generated",
  "generation_failed",
  "completed",
];

const STATUS_LABELS: Record<ChatbotRequestStatus, string> = {
  in_progress: "In Progress",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  image_requested: "Image Requested",
  image_generated: "Image Generated",
  generation_failed: "Generation Failed",
  completed: "Completed",
};

const STATUS_CLASSES: Record<ChatbotRequestStatus, string> = {
  in_progress:
    "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  rejected:
    "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  image_requested:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  image_generated:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  generation_failed:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function formatRequestTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function pickPrimaryImage(dress: DressLookupRow | undefined) {
  if (!dress?.dress_images?.length) return null;

  return (
    dress.dress_images.find((image) => image.is_primary)?.image_url ??
    dress.dress_images[0]?.image_url ??
    null
  );
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminCustomizationRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [editablePrompt, setEditablePrompt] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!fullscreenImageUrl) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenImageUrl(null);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [fullscreenImageUrl]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  const handleSelectRequest = (request: AdminCustomizationRequest | null) => {
    setSelectedRequestId(request?.id ?? null);
    setEditablePrompt(request?.generatedPrompt ?? "");
    setImageUrlInput(request?.imageUrl ?? "");
  };

  const fetchRequests = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setError(null);

    const { data: sessionRows, error: sessionError } = await supabase
      .from("chatbot_sessions")
      .select(
        "id, customer_id, conversation_id, dress_id, request_summary, generated_prompt, image_url, generation_error, status, created_at, updated_at",
      )
      .in("status", REVIEWABLE_STATUSES)
      .order("created_at", { ascending: false });

    if (sessionError) {
      console.error("Failed to load chatbot requests:", sessionError);
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    const sessions = (sessionRows ?? []) as ChatbotSessionRow[];
    const customerIds = Array.from(
      new Set(sessions.map((session) => session.customer_id)),
    );
    const dressIds = Array.from(
      new Set(
        sessions
          .map((session) => session.dress_id)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const [{ data: profiles }, { data: dresses }] = await Promise.all([
      customerIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", customerIds)
        : Promise.resolve({ data: [] as ProfileRow[], error: null }),
      dressIds.length > 0
        ? supabase
            .from("dresses")
            .select("id, name, dress_images(image_url, is_primary)")
            .in("id", dressIds)
        : Promise.resolve({ data: [] as DressLookupRow[], error: null }),
    ]);

    const profileMap = new Map(
      ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
    );
    const dressMap = new Map(
      ((dresses ?? []) as DressLookupRow[]).map((dress) => [dress.id, dress]),
    );

    const nextRequests: AdminCustomizationRequest[] = sessions.map((session) => {
      const customer = profileMap.get(session.customer_id);
      const dress = session.dress_id ? dressMap.get(session.dress_id) : undefined;

      return {
        id: session.id,
        customerId: session.customer_id,
        customerName: customer?.full_name?.trim() || "Unknown customer",
        conversationId: session.conversation_id,
        dressId: session.dress_id,
        dressName: dress?.name ?? null,
        dressImage: pickPrimaryImage(dress),
        requestSummary: session.request_summary,
        generatedPrompt: session.generated_prompt,
        imageUrl: session.image_url,
        generationError: session.generation_error,
        status: session.status,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      };
    });

    const nextSelectedRequest =
      (selectedRequestId
        ? nextRequests.find((request) => request.id === selectedRequestId)
        : null) ??
      nextRequests[0] ??
      null;

    setRequests(nextRequests);
    handleSelectRequest(nextSelectedRequest);
    setLoading(false);
  }, [selectedRequestId]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRequests(false);
    });
  }, [fetchRequests]);

  const applyLocalUpdate = (
    requestId: string,
    patch: Partial<AdminCustomizationRequest>,
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, ...patch } : request,
      ),
    );
  };

  const updateRequest = async (
    patch: Partial<{
      generated_prompt: string | null;
      image_url: string | null;
      generation_error: string | null;
      status: ChatbotRequestStatus;
    }>,
  ) => {
    if (!selectedRequest) return false;

    setSaving(true);
    const { error: updateError } = await supabase
      .from("chatbot_sessions")
      .update(patch)
      .eq("id", selectedRequest.id);

    if (updateError) {
      console.error("Failed to update request:", updateError);
      alert(updateError.message);
      setSaving(false);
      return false;
    }

    applyLocalUpdate(selectedRequest.id, {
      generatedPrompt:
        patch.generated_prompt !== undefined
          ? patch.generated_prompt
          : selectedRequest.generatedPrompt,
      imageUrl:
        patch.image_url !== undefined ? patch.image_url : selectedRequest.imageUrl,
      generationError:
        patch.generation_error !== undefined
          ? patch.generation_error
          : selectedRequest.generationError,
      status: patch.status ?? selectedRequest.status,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    return true;
  };

  const handleApproveRequest = async () => {
    await updateRequest({
      generated_prompt: editablePrompt.trim() || null,
      status: "approved",
    });
  };

  const handleRejectRequest = async () => {
    await updateRequest({
      generated_prompt: editablePrompt.trim() || null,
      status: "rejected",
    });
  };

  const handleRequestGeneration = async () => {
    if (!selectedRequest) return;

    const nextPrompt = editablePrompt.trim();

    if (!nextPrompt) {
      alert("The prompt cannot be empty before generation.");
      return;
    }

    setGenerating(true);
    applyLocalUpdate(selectedRequest.id, {
      generatedPrompt: nextPrompt,
      generationError: null,
      status: "image_requested",
      updatedAt: new Date().toISOString(),
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      applyLocalUpdate(selectedRequest.id, {
        generationError: "You must be signed in to generate a preview.",
        status: "generation_failed",
        updatedAt: new Date().toISOString(),
      });
      alert("You must be signed in to generate a preview.");
      setGenerating(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-custom-dress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "x-supabase-auth": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            sessionId: selectedRequest.id,
            prompt: nextPrompt,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.error ||
          data?.message ||
          `Generation request failed with status ${response.status}.`;
        console.error("Failed to invoke generation function:", errorMessage, data);
        applyLocalUpdate(selectedRequest.id, {
          generatedPrompt: nextPrompt,
          generationError: errorMessage,
          status: "generation_failed",
          updatedAt: new Date().toISOString(),
        });
        alert(errorMessage);
        setGenerating(false);
        return;
      }

      if (!data?.imageUrl) {
        const fallbackError =
          data?.error || "Image generation completed without returning an image URL.";
        applyLocalUpdate(selectedRequest.id, {
          generatedPrompt: nextPrompt,
          generationError: fallbackError,
          status: "generation_failed",
          updatedAt: new Date().toISOString(),
        });
        alert(fallbackError);
        setGenerating(false);
        return;
      }

      setImageUrlInput(data.imageUrl);
      applyLocalUpdate(selectedRequest.id, {
        generatedPrompt: nextPrompt,
        imageUrl: data.imageUrl,
        generationError: data.generationError ?? null,
        status: (data.status as ChatbotRequestStatus) ?? "image_generated",
        updatedAt: new Date().toISOString(),
      });
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : "Failed to reach the generation service.";
      console.error("Generation request failed:", generationError);
      applyLocalUpdate(selectedRequest.id, {
        generatedPrompt: nextPrompt,
        generationError: message,
        status: "generation_failed",
        updatedAt: new Date().toISOString(),
      });
      alert(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRejectGeneratedImage = async () => {
    await updateRequest({
      generated_prompt: editablePrompt.trim() || null,
      image_url: imageUrlInput.trim() || null,
      generation_error: null,
      status: "rejected",
    });
  };

  const handleApproveGeneratedImage = async () => {
    if (!selectedRequest) return;

    const nextImageUrl = imageUrlInput.trim() || selectedRequest.imageUrl;

    if (!nextImageUrl) {
      alert("An image URL is required before approving the generated image.");
      return;
    }

    if (!selectedRequest.conversationId) {
      alert("This request is not linked to a customer conversation.");
      return;
    }

    const requestUpdated = await updateRequest({
      generated_prompt: editablePrompt.trim() || null,
      image_url: nextImageUrl,
      generation_error: null,
      status: "completed",
    });

    if (!requestUpdated) return;

    const textMessage =
      "Your custom dress preview has been approved by our designer. Take a look below and reply here if you'd like any final refinements.";

    const { error: textError } = await supabase.from("messages").insert({
      conversation_id: selectedRequest.conversationId,
      sender_type: "designer",
      content: textMessage,
    });

    if (textError) {
      console.error("Failed to send customer update:", textError);
      alert("The request was updated, but the customer message could not be sent.");
      return;
    }

    const { error: imageError } = await supabase.from("messages").insert({
      conversation_id: selectedRequest.conversationId,
      sender_type: "designer",
      content: nextImageUrl,
      attachment_url: nextImageUrl,
      attachment_type: "image",
    });

    if (imageError) {
      console.error("Failed to send generated image:", imageError);
      alert("The request was updated, but the image could not be sent to chat.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Header subtitle="Customization Requests" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300">
                <ClipboardList className="h-7 w-7 text-stone-600 dark:text-stone-300" />
              </div>
              <div>
                <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
                  Request Review
                </h1>
                <p className="text-stone-500 dark:text-stone-400">
                  Review customer customizations before image generation and final delivery.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchRequests()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white/80 px-4 py-2 text-sm text-stone-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-stone-200/50 bg-white/60 p-12 text-center shadow-xl backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-800/60">
            <p className="text-stone-600 dark:text-stone-300">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-stone-200/50 bg-white/60 p-12 text-center shadow-xl backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-800/60">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/50 bg-white/60 p-12 text-center shadow-xl backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-800/60">
            <ClipboardList className="mx-auto mb-4 h-14 w-14 text-stone-300 dark:text-stone-600" />
            <p className="text-stone-600 dark:text-stone-300">
              No customization requests are waiting for review.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-3xl border border-stone-200/50 bg-white/70 shadow-xl backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-800/70">
              <div className="border-b border-stone-200/50 px-5 py-4 dark:border-stone-700/50">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {requests.length} active request{requests.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {requests.map((request) => {
                  const isSelected = request.id === selectedRequestId;

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => handleSelectRequest(request)}
                      className={`w-full border-b border-stone-200/40 px-5 py-4 text-left transition last:border-b-0 dark:border-stone-700/40 ${
                        isSelected
                          ? "bg-pink-50/70 dark:bg-stone-700/70"
                          : "hover:bg-stone-50/70 dark:hover:bg-stone-700/40"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-stone-800 dark:text-stone-100">
                            {request.customerName}
                          </p>
                          <p className="text-sm text-stone-500 dark:text-stone-400">
                            {request.dressName ?? "Custom design from scratch"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[request.status]}`}
                        >
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <p className="line-clamp-3 whitespace-pre-line text-sm text-stone-600 dark:text-stone-300">
                        {request.requestSummary ?? "No summary provided."}
                      </p>
                      <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
                        {formatRequestTime(request.createdAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-3xl border border-stone-200/50 bg-white/70 shadow-xl backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-800/70">
              {selectedRequest ? (
                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/50 pb-6 dark:border-stone-700/50">
                    <div>
                      <h2 className="font-serif text-3xl text-stone-800 dark:text-stone-100">
                        {selectedRequest.customerName}
                      </h2>
                      <p className="mt-1 text-stone-500 dark:text-stone-400">
                        Submitted {formatRequestTime(selectedRequest.createdAt)}
                      </p>
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                        Base dress:{" "}
                        <span className="font-medium text-stone-800 dark:text-stone-100">
                          {selectedRequest.dressName ?? "Custom design from scratch"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${STATUS_CLASSES[selectedRequest.status]}`}
                    >
                      {STATUS_LABELS[selectedRequest.status]}
                    </span>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="space-y-6">
                      <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-50/80 dark:border-stone-700/60 dark:bg-stone-900/40">
                        <div className="border-b border-stone-200/60 px-5 py-4 dark:border-stone-700/60">
                          <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100">
                            Original Dress
                          </h3>
                        </div>
                        <div className="p-5">
                          {selectedRequest.dressImage ? (
                            <img
                              src={selectedRequest.dressImage}
                              alt={selectedRequest.dressName ?? "Selected dress"}
                              className="aspect-[3/4] w-full rounded-2xl object-contain bg-white dark:bg-stone-950/40"
                            />
                          ) : (
                            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-stone-300/70 bg-white/70 px-6 text-center text-sm text-stone-400 dark:border-stone-600/70 dark:bg-stone-800/60 dark:text-stone-500">
                              No base dress image linked to this request.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-50/80 dark:border-stone-700/60 dark:bg-stone-900/40">
                        <div className="border-b border-stone-200/60 px-5 py-4 dark:border-stone-700/60">
                          <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100">
                            Generated Preview
                          </h3>
                        </div>
                        <div className="space-y-4 p-5">
                          {selectedRequest.generationError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                              {selectedRequest.generationError}
                            </div>
                          )}
                          {imageUrlInput ? (
                            <div className="space-y-3">
                              <img
                                src={imageUrlInput}
                                alt="Generated preview"
                                className="aspect-[3/4] w-full rounded-2xl object-contain bg-white dark:bg-stone-950/40"
                              />
                              <button
                                type="button"
                                onClick={() => setFullscreenImageUrl(imageUrlInput)}
                                className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white/90 px-3 py-2 text-sm text-stone-700 transition hover:bg-white dark:border-stone-700 dark:bg-stone-800/90 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                <Expand className="h-4 w-4" />
                                Full screen preview
                              </button>
                            </div>
                          ) : (
                            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-stone-300/70 bg-white/70 px-6 text-center text-sm text-stone-400 dark:border-stone-600/70 dark:bg-stone-800/60 dark:text-stone-500">
                              No generated preview is available yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-50/80 dark:border-stone-700/60 dark:bg-stone-900/40">
                        <div className="border-b border-stone-200/60 px-5 py-4 dark:border-stone-700/60">
                          <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100">
                            Customer Summary
                          </h3>
                        </div>
                        <div className="p-5">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                            {selectedRequest.requestSummary ?? "No summary provided."}
                          </pre>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-stone-50/80 dark:border-stone-700/60 dark:bg-stone-900/40">
                        <div className="border-b border-stone-200/60 px-5 py-4 dark:border-stone-700/60">
                          <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100">
                            Prompt for Generation
                          </h3>
                        </div>
                        <div className="space-y-4 p-5">
                          <textarea
                            id="request-prompt"
                            name="requestPrompt"
                            value={editablePrompt}
                            onChange={(event) => setEditablePrompt(event.target.value)}
                            rows={18}
                            disabled={generating}
                            className="w-full rounded-3xl border border-stone-200 bg-white/90 px-4 py-4 text-sm leading-relaxed text-stone-800 outline-none transition focus:border-pink-300 dark:border-stone-600 dark:bg-stone-800/90 dark:text-stone-100"
                          />

                          {generating && (
                            <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              <span>
                                OpenAI is generating the preview now. This can take a short while.
                              </span>
                            </div>
                          )}

                          <div className="grid gap-3 md:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => void handleApproveRequest()}
                              disabled={saving}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-100 px-4 py-3 text-sm font-medium text-sky-800 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/40"
                            >
                              <Check className="w-4 h-4" />
                              Approve Request
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRejectRequest()}
                              disabled={saving}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/40"
                            >
                              <X className="w-4 h-4" />
                              Reject Request
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRequestGeneration()}
                              disabled={saving || generating}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-100 px-4 py-3 text-sm font-medium text-violet-800 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/40"
                            >
                              {generating ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              {generating ? "Generating Preview..." : "Generate with OpenAI"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleApproveGeneratedImage()}
                              disabled={saving || generating}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                            >
                              <Send className="w-4 h-4" />
                              Approve Image and Send to Customer
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRejectGeneratedImage()}
                              disabled={saving || generating}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-200 px-4 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                            >
                              <RefreshCcw className="w-4 h-4" />
                              Reject Image and Rework
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
      {fullscreenImageUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setFullscreenImageUrl(null)}
        >
          <button
            type="button"
            onClick={() => setFullscreenImageUrl(null)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close fullscreen preview"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={fullscreenImageUrl}
            alt="Fullscreen generated preview"
            className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
