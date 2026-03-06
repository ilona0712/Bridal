import { useState } from "react";
import { Send, User } from "lucide-react";
import Header from "../components/common/Header";

type ChatMessage = {
  type: "owner" | "user";
  text: string;
  time: string;
};

export default function ChatWithOwnerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
        

        {/* Chat Interface */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 px-6 py-5 border-b border-amber-200/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center border-2 border-amber-200/30">
                <User className="w-7 h-7 text-stone-600" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-stone-800">
                  Sarah Mitchell
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm text-stone-600">Owner • Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-stone-50/30">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}
              >
                {message.type === "owner" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-amber-200/30">
                    <User className="w-5 h-5 text-stone-600" />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-5 py-4 max-w-[80%] ${
                      message.type === "owner"
                        ? "bg-white/90 border border-stone-200/50 rounded-tl-none"
                        : "bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-tr-none"
                    }`}
                  >
                    <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                      {message.text}
                    </p>
                  </div>
                  <span
                    className={`text-xs text-stone-400 px-2 ${message.type === "user" ? "text-right" : ""}`}
                  >
                    {message.time}
                  </span>
                </div>

                {message.type === "user" && (
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-stone-200/50 p-6 bg-white/40">
            <div className="flex gap-3 items-end">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                rows={1}
                className="flex-1 bg-white/90 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300/50 resize-none"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-12 h-12 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
              >
                <Send className="w-5 h-5 text-stone-700" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
            <h3 className="font-serif text-stone-800 mb-2">
              Real-time Messaging
            </h3>
            <p className="text-xs text-stone-600">
              Instant communication with customers when you connect to Supabase
            </p>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
            <h3 className="font-serif text-stone-800 mb-2">Message History</h3>
            <p className="text-xs text-stone-600">
              All conversations saved and accessible from your dashboard
            </p>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
            <h3 className="font-serif text-stone-800 mb-2">Notifications</h3>
            <p className="text-xs text-stone-600">
              Get notified when customers send you messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
