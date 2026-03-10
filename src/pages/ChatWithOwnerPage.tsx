import { useState } from "react";
import Header from "../components/common/Header";
import type { OwnerChatMessage } from "../types/chat";
import OwnerChatHeader from "../components/chat/OwnerChatHeader";
import OwnerChatMessagesList from "../components/chat/OwnerChatMessagesList";
import OwnerChatInput from "../components/chat/OwnerChatInput";
import OwnerChatFeatures from "../components/chat/OwnerChatFeatures";

export default function ChatWithOwnerPage() {
  const [messages, setMessages] = useState<OwnerChatMessage[]>([
    {
      type: "owner",
      text: "Hello! 👋 Welcome to Bride Me Up. I'm Sarah, the owner. How can I help you today?",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Customer Support" />
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 overflow-hidden">
          <OwnerChatHeader />
          <OwnerChatMessagesList messages={messages} />
          <OwnerChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyDown={handleKeyDown}
          />
        </div>
        <OwnerChatFeatures />
      </div>
    </div>
  );
}
