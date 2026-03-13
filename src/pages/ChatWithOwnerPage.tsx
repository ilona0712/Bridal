import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import Header from "../components/common/Header";
import type { OwnerChatMessage } from "../types/chat";
import OwnerChatHeader from "../components/chat/OwnerChatHeader";
import OwnerChatMessagesList from "../components/chat/OwnerChatMessagesList";
import OwnerChatInput from "../components/chat/OwnerChatInput";
import OwnerChatFeatures from "../components/chat/OwnerChatFeatures";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatWithOwnerPage() {
  const navigate = useNavigate();
  const location = useLocation()
  const selectedClient = location.state?.client
  const [messages, setMessages] = useState<OwnerChatMessage[]>([
  {
    type: "owner",
    text: selectedClient
      ? `Hello ${selectedClient.clientName}! 👋 How can I help you today?`
      : "Hello! 👋 Welcome to Bride Me Up. I'm Sarah, the owner. How can I help you today?",
    time: "Just now",
  },
]);

  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiButtonAreaRef = useRef<HTMLDivElement | null>(null);

  const getTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const currentTime = getTime();

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: trimmed,
        time: currentTime,
      },
    ]);

    setInputValue("");

    setTimeout(() => {
      const responses = [
        "Thank you for reaching out! I'll get back to you as soon as possible. 💕",
        "That's a great question! Let me look into that for you.",
        "I'd love to help you with that! Can you tell me more?",
        "Absolutely! I'm here to make your bridal experience perfect.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) => [
        ...prev,
        {
          type: "owner",
          text:
            randomResponse +
            "\n\n✨ Note: This is a preview. Real-time chat will be available once connected to Supabase.",
          time: getTime(),
        },
      ]);
    }, 1500);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

const handleStartRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    setRecordingStream(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);

      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          audioUrl,
          time: getTime(),
        },
      ]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "owner",
            text: "I received your voice message. Thank you! 🎙️",
            time: getTime(),
          },
        ]);
      }, 1200);

      stream.getTracks().forEach((track) => track.stop());
      setRecordingStream(null);
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

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showEmojiPicker]);

  useEffect(() => {
    return () => {
      messages.forEach((msg) => {
        if (msg.audioUrl) {
          URL.revokeObjectURL(msg.audioUrl);
        }
      });
    };
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle={selectedClient ? "Client Conversation" : "Customer Support"} />

      <div className="container mx-auto px-6 py-8 max-w-5xl">

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 overflow-hidden">
          <OwnerChatHeader
  clientName={selectedClient?.clientName}
  onBack={() => navigate("/clients-chats")}
/>

          <OwnerChatMessagesList messages={messages} />

          <div className="relative" ref={emojiButtonAreaRef}>
            {showEmojiPicker && (
              <div
  ref={emojiPickerRef}
  className="absolute bottom-20 left-4 z-20 shadow-xl"
>
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
  isRecording={isRecording}
  recordingStream={recordingStream}
/>
          </div>
        </div>

        <OwnerChatFeatures />
      </div>
    </div>
  );
}