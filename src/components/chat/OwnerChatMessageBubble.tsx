import { Mic, User } from "lucide-react";
import type { OwnerChatMessage } from "../../types/chat";

type OwnerChatMessageBubbleProps = {
  message: OwnerChatMessage;
};

export default function OwnerChatMessageBubble({
  message,
}: OwnerChatMessageBubbleProps) {
  const isUser = message.type === "user";
  const hasAudio = Boolean(message.audioUrl);

  return (
    <div className={`flex gap-3 items-end ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-amber-200/50 bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 shadow-sm">
          <User className="w-5 h-5 text-stone-600" />
        </div>
      )}

      <div
        className={`flex flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={[
            "rounded-3xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all",
            hasAudio ? "min-w-[250px] max-w-[320px]" : "max-w-[80%]",
            isUser
              ? "bg-gradient-to-br from-stone-300 via-pink-100 to-stone-200 text-stone-800 rounded-br-md border border-pink-100/60"
              : "bg-white/90 text-stone-800 rounded-bl-md border border-stone-200/70",
          ].join(" ")}
        >
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {message.text}
            </p>
          )}

          {hasAudio && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isUser
                      ? "bg-white/50 border border-white/60"
                      : "bg-amber-50 border border-amber-100"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Voice message</span>
              </div>

              <audio
                controls
                className="w-full h-10 rounded-xl"
                preload="metadata"
              >
                <source src={message.audioUrl} type="audio/webm" />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>

        <span className="text-xs text-stone-400 px-2">{message.time}</span>
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100 border border-stone-200/70 shadow-sm">
          <User className="w-5 h-5 text-stone-500" />
        </div>
      )}
    </div>
  );
}