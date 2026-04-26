import { useCallback, useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { ArrowLeft, User } from "lucide-react";
import Header from "../components/common/Header";
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";
import OwnerChatMessagesList from "../components/chat/OwnerChatMessagesList";
import OwnerChatInput from "../components/chat/OwnerChatInput";
import CustomerProfilePanel from "../components/chat/CustomerProfilePanel";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSession, useRole, useRoleLoading } from "../routes";
import type { ChatMessage } from "../types/chat";
import { sendPushNotification } from "../services/pushNotificationService";

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function getAudioExtension(mimeType: string) {
  const cleanType = mimeType.split(";")[0];
  if (cleanType === "audio/mp4") return "mp4";
  if (cleanType === "audio/ogg") return "ogg";
  if (cleanType === "audio/wav") return "wav";
  if (cleanType === "audio/mpeg") return "mp3";
  return "webm";
}

function appendMessageIfMissing(
  currentMessages: ChatMessage[],
  nextMessage: ChatMessage,
) {
  if (currentMessages.some((message) => message.id === nextMessage.id)) {
    return currentMessages;
  }

  return [...currentMessages, nextMessage].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export default function ChatWithOwnerPage() {
  const { toasts, showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const role = useRole();
  const roleLoading = useRoleLoading();

  // admin passes conversationId + clientName + customerId via location.state
  const stateConversationId = location.state?.conversationId as string | undefined;
  const stateClientName = location.state?.clientName as string | undefined;
  const stateCustomerId = location.state?.customerId as string | undefined;

  const [conversationId, setConversationId] = useState<string | null>(stateConversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [otherAvatarUrl, setOtherAvatarUrl] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const senderName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.first_name ||
    session?.user?.email?.split("@")[0] ||
    (role === "admin" ? "Maria Badari" : "A customer");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const recordingStartedAtRef = useRef<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonAreaRef = useRef<HTMLDivElement | null>(null);

  // Step 1: get or create conversation (customer only)
  useEffect(() => {
    if (!session?.user || roleLoading || !role) return;

    if (role === "admin") {
      // Admin gets the conversation from navigation state. Keep it synced in case
      // React Router reuses this page instance for a different customer.
      setConversationId(stateConversationId ?? null);
      setMessages([]);

      if (stateConversationId) {
        supabase.from("conversation_reads").upsert(
          { conversation_id: stateConversationId, user_id: session.user.id, last_read_at: new Date().toISOString() },
          { onConflict: "conversation_id,user_id" }
        ).then(({ error }) => { if (error) console.error("Failed to mark conversation as read:", error); });
      }
      setLoading(false);
      return;
    }

    const initConversation = async () => {
      // check if conversation already exists for this customer
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (existing) {
        setConversationId(existing.id);
        supabase.from("conversation_reads").upsert(
          { conversation_id: existing.id, user_id: session.user.id, last_read_at: new Date().toISOString() },
          { onConflict: "conversation_id,user_id" }
        ).then(({ error }) => { if (error) console.error("Failed to mark conversation as read:", error); });
      } else {
        // create new conversation
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ customer_id: session.user.id })
          .select("id")
          .single();

        if (error) {
          console.error("Failed to create conversation:", error);
          return;
        }
        setConversationId(created.id);
        supabase.from("conversation_reads").upsert(
          { conversation_id: created.id, user_id: session.user.id, last_read_at: new Date().toISOString() },
          { onConflict: "conversation_id,user_id" }
        ).then(({ error }) => { if (error) console.error("Failed to mark conversation as read:", error); });
      }
      setLoading(false);
    };

    initConversation();
  }, [session?.user, role, roleLoading, stateConversationId]);

  // Fetch profile images for current user and the other party
  useEffect(() => {
    if (!session?.user || roleLoading || !role) return;

    const fetchAvatars = async () => {
      // Always fetch current user's avatar
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("profile_image_url")
        .eq("id", session.user.id)
        .single();
      setMyAvatarUrl(myProfile?.profile_image_url ?? null);

      if (role === "admin") {
        // For admin: fetch the customer's avatar from conversations
        if (!conversationId) return;
        const { data: conv } = await supabase
          .from("conversations")
          .select("customer_id")
          .eq("id", conversationId)
          .single();
        if (conv?.customer_id) {
          const { data: clientProfile } = await supabase
            .from("profiles")
            .select("profile_image_url")
            .eq("id", conv.customer_id)
            .single();
          setOtherAvatarUrl(clientProfile?.profile_image_url ?? null);
        }
      } else {
        // For customer: fetch the admin's profile image
        const { data: adminProfiles } = await supabase
          .from("profiles")
          .select("profile_image_url")
          .eq("role", "admin")
          .limit(1);
        setOtherAvatarUrl(adminProfiles?.[0]?.profile_image_url ?? null);
      }
    };

    fetchAvatars();
  }, [session?.user, role, roleLoading, conversationId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch messages:", error);
        return;
      }
      setMessages(data ?? []);

      if (session?.user?.id) {
        supabase.from("conversation_reads").upsert(
          { conversation_id: conversationId, user_id: session.user.id, last_read_at: new Date().toISOString() },
          { onConflict: "conversation_id,user_id" }
        ).then(({ error: readError }) => {
          if (readError) console.error("Failed to mark conversation as read:", readError);
        });
      }
  }, [conversationId, session?.user?.id]);

  // Step 2: load messages when conversationId is ready
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Step 3: subscribe to real-time new messages
    // No server-side filter — filter client-side to avoid silent filter failures in Supabase
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.conversation_id === conversationId) {
            setMessages((prev) => appendMessageIfMissing(prev, msg));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const old = payload.old as { id: string; conversation_id?: string };
          if (!old.conversation_id || old.conversation_id === conversationId) {
            setMessages((prev) => prev.filter((msg) => msg.id !== old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void fetchMessages();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const refreshVisibleChat = () => {
      if (document.visibilityState === "visible") {
        void fetchMessages();
      }
    };

    window.addEventListener("focus", fetchMessages);
    document.addEventListener("visibilitychange", refreshVisibleChat);

    return () => {
      window.removeEventListener("focus", fetchMessages);
      document.removeEventListener("visibilitychange", refreshVisibleChat);
    };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMessages();
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [conversationId, fetchMessages]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !conversationId || !role) return;

    setInputValue("");

    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: trimmed,
      sender_type: role === "admin" ? "designer" : "customer",
    }).select("*").single();

    if (error) {
      console.error("Failed to send message:", error);
      setInputValue(trimmed);
      showToast("Message could not be sent. Please try again.", "error");
      return;
    }

    if (data) {
      setMessages((prev) => appendMessageIfMissing(prev, data as ChatMessage));
    }

    if (!error && session?.user?.id) {
      void sendPushNotification({
        type: "chat_message",
        conversationId,
        senderUserId: session.user.id,
        senderName,
      });
    }
  };

  const handleSendImage = async (file: File) => {
    if (!conversationId || !role) return;

    const fileName = `${session?.user?.id}-${Date.now()}.${file.name.split(".").pop()}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("chat-images")
      .getPublicUrl(uploadData.path);

    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: urlData.publicUrl,
      sender_type: role === "admin" ? "designer" : "customer",
      attachment_url: urlData.publicUrl,
      attachment_type: "image",
    }).select("*").single();

    if (error) {
      console.error("Failed to send image:", error);
      showToast("Image could not be sent. Please try again.", "error");
      return;
    }

    if (data) {
      setMessages((prev) => appendMessageIfMissing(prev, data as ChatMessage));
    }

    if (!error && session?.user?.id) {
      void sendPushNotification({
        type: "chat_message",
        conversationId,
        senderUserId: session.user.id,
        senderName,
      });
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const handleStartRecording = async () => {
    try {
      if (typeof MediaRecorder === "undefined") {
        showToast("Voice recording is not supported on this device browser.", "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer mp4 — it embeds duration metadata and plays on iOS/Android/Desktop.
      // webm often reports Infinity duration and is unsupported on iOS.
      const mimeType = getSupportedAudioMimeType();

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mimeTypeRef.current = mediaRecorder.mimeType || mimeType || "audio/webm";
      setRecordingStream(stream);
      audioChunksRef.current = [];
      recordingStartedAtRef.current = performance.now();
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
  stream.getTracks().forEach((track) => track.stop());
  setRecordingStream(null);

        const recordingStartedAt = recordingStartedAtRef.current;
        recordingStartedAtRef.current = null;
        const durationMs = recordingStartedAt
          ? Math.max(0, Math.round(performance.now() - recordingStartedAt))
          : null;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        if (audioBlob.size === 0) {
          showToast("Voice message was empty. Please try recording again.", "error");
          return;
        }

        const ext = getAudioExtension(mimeTypeRef.current);
        const fileName = `${session?.user?.id}-${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("voice-notes")
    .upload(fileName, audioBlob, { contentType: mimeTypeRef.current });

  if (uploadError) {
    console.error("Audio upload failed:", uploadError);
    showToast("Voice message could not be uploaded. Please try again.", "error");
    return;
  }

  const { data: urlData } = supabase.storage
    .from("voice-notes")
    .getPublicUrl(uploadData.path);

  if (!conversationId || !role) return;

  const { data: messageData, error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    content: urlData.publicUrl,
    sender_type: role === "admin" ? "designer" : "customer",
    is_audio: true,
  }).select("*").single();

  if (msgError) {
    console.error("Failed to send voice message:", msgError);
    showToast("Voice message could not be sent. Please try again.", "error");
    return;
  }

  if (messageData) {
    const messageWithDuration = {
      ...(messageData as ChatMessage),
      duration_ms: durationMs,
    };

    setMessages((prev) => appendMessageIfMissing(prev, messageWithDuration));

    if (durationMs !== null) {
      supabase
        .from("messages")
        .update({ duration_ms: durationMs } as Record<string, number>)
        .eq("id", messageData.id)
        .then(({ error: durationError }) => {
          if (durationError) {
            console.warn("Voice duration was not saved:", durationError.message);
          }
        });
    }
  }

  if (!msgError && session?.user?.id && conversationId) {
    void sendPushNotification({
      type: "chat_message",
      conversationId,
      senderUserId: session.user.id,
      senderName,
    });
  }
};

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      showToast("Unable to access microphone.", "error");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Failed to delete message:", error);
      return;
    }

    // Remove the message from local state
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        showEmojiPicker &&
        !emojiPickerRef.current?.contains(target) &&
        !emojiButtonAreaRef.current?.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const updateChatViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--chat-viewport-height", `${height}px`);
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    updateChatViewportHeight();

    window.visualViewport?.addEventListener("resize", updateChatViewportHeight);
    window.addEventListener("resize", updateChatViewportHeight);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.removeProperty("--chat-viewport-height");
      window.visualViewport?.removeEventListener("resize", updateChatViewportHeight);
      window.removeEventListener("resize", updateChatViewportHeight);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading chat...
      </div>
    );
  }

  return (
    <div
      className="fixed inset-x-0 top-0 flex flex-col overflow-hidden overscroll-none bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
      style={{ height: "var(--chat-viewport-height, 100dvh)" }}
    >
      <Toast toasts={toasts} />
      <Header subtitle={role === "admin" ? "Client Conversation" : "Chat with Us"} />
      <OwnerChatMessagesList
        messages={messages}
        currentUserId={session?.user?.id ?? ""}
        role={role}
        myAvatarUrl={myAvatarUrl}
        otherAvatarUrl={otherAvatarUrl}
        onViewProfile={role === "admin" && stateCustomerId ? () => setShowProfile(true) : undefined}
        onDeleteMessage={handleDeleteMessage}
        headerOverlay={
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(role === "admin" ? "/clients-chats" : "/")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-stone-800/30 transition"
            >
              <ArrowLeft className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </button>
            <button
              type="button"
              onClick={role === "admin" && stateCustomerId ? () => setShowProfile(true) : undefined}
              disabled={!(role === "admin" && stateCustomerId)}
              className="flex items-center gap-2 disabled:cursor-default group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200/80 dark:bg-stone-700/80 flex-shrink-0 flex items-center justify-center">
                {otherAvatarUrl ? (
                  <img src={otherAvatarUrl} alt={role === "admin" ? stateClientName : "Maria Badari"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                )}
              </div>
              <span className="font-serif text-stone-800 dark:text-stone-100 text-base">
                {role === "admin" ? stateClientName : "Maria Badari"}
              </span>
            </button>
          </div>
        }
      />
      <div className="relative" ref={emojiButtonAreaRef}>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-20 shadow-xl">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <OwnerChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyDown={handleKeyDown}
          onToggleEmoji={() => setShowEmojiPicker((prev) => !prev)}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onSendImage={handleSendImage}
          isRecording={isRecording}
          recordingStream={recordingStream}
        />
      </div>

      {showProfile && stateCustomerId && (
        <CustomerProfilePanel
          customerId={stateCustomerId}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
