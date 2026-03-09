import { User } from "lucide-react";
import type { OwnerChatMessage } from "../../types/chat";

type OwnerChatMessageBubbleProps = {
  message: OwnerChatMessage;
};

export default function OwnerChatMessageBubble({
  message,
}: OwnerChatMessageBubbleProps) {
  return (
    <div
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
          className={`text-xs text-stone-400 px-2 ${
            message.type === "user" ? "text-right" : ""
          }`}
        >
          {message.time}
        </span>
      </div>

      {message.type === "user" && (
        <div className="w-10 h-10 bg-stone-200 rounded-full flex-shrink-0" />
      )}
    </div>
  );
}