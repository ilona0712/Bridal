import { Mic, User } from "lucide-react";
import type { ChatMessage } from "../../types/chat";
import { useEffect, useState } from "react";

type OwnerChatMessageBubbleProps = {
  message: ChatMessage;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
};

export default function OwnerChatMessageBubble({
  message,
  role,
  myAvatarUrl,
  otherAvatarUrl,
}: OwnerChatMessageBubbleProps) {
  const isMine =
    (role === "admin" && message.sender_type === "designer") ||
    (role !== "admin" && message.sender_type === "customer");
  const hasAudio = message.is_audio === true;
  const hasImage = message.attachment_type === "image" && message.attachment_url;

  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAudio || !message.content) return;
    const audio = new Audio(message.content);
    audio.addEventListener("loadedmetadata", () => {
      const secs = Math.floor(audio.duration);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setDuration(`${m}:${s.toString().padStart(2, "0")}`);
    });
  }, [hasAudio, message.content]);

  return (
    <div className={`flex gap-3 items-end ${isMine ? "justify-end" : ""}`}>
      {!isMine && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-amber-200/50 bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 shadow-sm overflow-hidden">
          {otherAvatarUrl ? (
            <img src={otherAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-stone-600" />
          )}
        </div>
      )}

      <div
        className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
        style={{ maxWidth: "70%" }}
      >
        <div
          className={[
            "rounded-3xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all w-fit",
            hasAudio ? "min-w-[250px] max-w-full" : "max-w-full",
            isMine
              ? "bg-gradient-to-br from-stone-300 via-pink-100 to-stone-200 text-stone-800 rounded-br-md border border-pink-100/60"
              : "bg-white/90 text-stone-800 rounded-bl-md border border-stone-200/70",
          ].join(" ")}
        >
          {hasAudio ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${isMine
                      ? "bg-white/50 border border-white/60"
                      : "bg-amber-50 border border-amber-100"
                    }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Voice message</span>
                {duration && (
                  <span className="text-stone-400">{duration}</span>
                )}
              </div>
              {message.content ? (
                <audio
                  controls
                  className="w-full h-10 rounded-xl"
                  preload="metadata"
                >
                  <source src={message.content} />
                </audio>
                
              ) : (
                
                <p className="text-xs text-stone-400">Audio unavailable</p>
              )}
            </div>
          ) : hasImage ? (
            <img
              src={message.attachment_url!}
              alt="attachment"
              className="w-full max-w-[250px] rounded-xl object-cover cursor-pointer"
              onClick={() => window.open(message.attachment_url!, "_blank")}
            />
          ) : (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        <span className="text-xs text-stone-400 px-2">
          {new Date(message.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>

      {isMine && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100 border border-stone-200/70 shadow-sm overflow-hidden">
          {myAvatarUrl ? (
            <img src={myAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-stone-500" />
          )}
        </div>
      )}
    </div>
  );
}