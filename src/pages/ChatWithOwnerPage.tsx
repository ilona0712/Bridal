import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import Header from "../components/common/Header";
import OwnerChatHeader from "../components/chat/OwnerChatHeader";
import OwnerChatMessagesList from "../components/chat/OwnerChatMessagesList";
import OwnerChatInput from "../components/chat/OwnerChatInput";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSession, useRole } from "../routes";
import type { ChatMessage } from "../types/chat";

export default function ChatWithOwnerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const role = useRole();

  // admin passes conversationId + clientName via location.state
  const stateConversationId = location.state?.conversationId as string | undefined;
  const stateClientName = location.state?.clientName as string | undefined;

  const [conversationId, setConversationId] = useState<string | null>(stateConversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [otherAvatarUrl, setOtherAvatarUrl] = useState<string | null>(null);
  console.log("conversationId:", conversationId, "role:", role);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonAreaRef = useRef<HTMLDivElement | null>(null);

  // Step 1: get or create conversation (customer only)
  useEffect(() => {
    if (!session?.user) return;
    if (role === "admin") {
      // admin already has conversationId from navigation state
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
      }
      setLoading(false);
    };

    initConversation();
  }, [session, role]);

  // Fetch profile images for current user and the other party
  useEffect(() => {
    if (!session?.user) return;

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
        if (!stateConversationId) return;
        const { data: conv } = await supabase
          .from("conversations")
          .select("customer_id")
          .eq("id", stateConversationId)
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
  }, [session, role, stateConversationId]);

  // Step 2: load messages when conversationId is ready
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
        console.log("messages data:", data, "error:", error);

      if (error) {
        console.error("Failed to fetch messages:", error);
        return;
      }
      setMessages(data ?? []);
    };

    fetchMessages();

    // Step 3: subscribe to real-time new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    console.log("sending:", trimmed, "conversationId:", conversationId, "role:", role);
    if (!trimmed || !conversationId) return;

    setInputValue("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: trimmed,
      sender_type: role === "admin" ? "designer" : "customer",
    });

    if (error) console.error("Failed to send message:", error);
  };

  const handleSendImage = async (file: File) => {
    if (!conversationId) return;

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

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: urlData.publicUrl,
      sender_type: role === "admin" ? "designer" : "customer",
      attachment_url: urlData.publicUrl,
      attachment_type: "image",
    });

    if (error) console.error("Failed to send image:", error);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
  ? "audio/mp4"
  : MediaRecorder.isTypeSupported("audio/ogg")
  ? "audio/ogg"
  : "audio/webm";

const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mimeTypeRef.current = mimeType;
      setRecordingStream(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
  stream.getTracks().forEach((track) => track.stop());
  setRecordingStream(null);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        const ext = mimeTypeRef.current.split("/")[1].split(";")[0];
        const fileName = `${session?.user?.id}-${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("voice-notes")
    .upload(fileName, audioBlob, { contentType: mimeTypeRef.current });

  if (uploadError) {
    console.error("Audio upload failed:", uploadError);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("voice-notes")
    .getPublicUrl(uploadData.path);

  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    content: urlData.publicUrl,
    sender_type: role === "admin" ? "designer" : "customer",
    is_audio: true,
  });

  if (msgError) console.error("Failed to send voice message:", msgError);
};

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Unable to access microphone.");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Header subtitle={role === "admin" ? "Client Conversation" : "Chat with Us"} />
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
          <OwnerChatHeader
            clientName={role === "admin" ? stateClientName : "Bride Me Up"}
            profileImageUrl={otherAvatarUrl}
            onBack={() => navigate(role === "admin" ? "/clients-chats" : "/")}
          />

          <OwnerChatMessagesList
  messages={messages}
  currentUserId={session?.user?.id ?? ""}
  role={role}
  myAvatarUrl={myAvatarUrl}
  otherAvatarUrl={otherAvatarUrl}
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
        </div>
      </div>
    </div>
  );
}