import { Mic, User, X } from "lucide-react";
import type { ChatMessage } from "../../types/chat";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatChatTime } from "../../utils/common/formatChatTime";


type OwnerChatMessageBubbleProps = {
  message: ChatMessage;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
  onViewProfile?: () => void;
};

export default function OwnerChatMessageBubble({
  message,
  role,
  myAvatarUrl,
  otherAvatarUrl,
  onViewProfile,
}: OwnerChatMessageBubbleProps) {
  const isMine =
    (role === "admin" && message.sender_type === "designer") ||
    (role !== "admin" && message.sender_type === "customer");
  const hasAudio = message.is_audio === true;
  const hasImage = message.attachment_type === "image" && message.attachment_url;

  const [duration, setDuration] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
    <div className={`flex gap-2 sm:gap-3 items-end ${isMine ? "justify-end" : ""}`}>
      {!isMine && (
        <button
          type="button"
          onClick={onViewProfile}
          disabled={!onViewProfile}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-amber-200/50 bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 shadow-sm overflow-hidden disabled:cursor-default hover:ring-2 hover:ring-pink-300/50 transition-all"
        >
          {otherAvatarUrl ? (
            <img src={otherAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-stone-600" />
          )}
        </button>
      )}

      <div
        className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
        style={{ maxWidth: "75%" }}
      >
        <div
          className={[
            "rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-sm backdrop-blur-sm transition-all w-fit",
            hasAudio ? "min-w-[140px] sm:min-w-[200px] max-w-full" : "max-w-full",
            isMine
              ? "bg-gradient-to-br from-stone-300 via-pink-100 to-stone-200 dark:from-stone-600 dark:via-pink-900/20 dark:to-stone-600 text-stone-800 dark:text-stone-100 rounded-br-sm border border-pink-100/60 dark:border-stone-500/60"
              : "bg-white/90 dark:bg-stone-700/90 text-stone-800 dark:text-stone-100 rounded-bl-sm border border-stone-200/70 dark:border-stone-600/70",
          ].join(" ")}
        >
          {hasAudio ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${isMine
                      ? "bg-white/50 border border-white/60"
                      : "bg-amber-50 border border-amber-100"
                    }`}
                >
                  <Mic className="w-3 h-3" />
                </div>
                <span className="font-medium">Voice message</span>
                {duration && <span className="text-stone-400">{duration}</span>}
              </div>
              {message.content ? (
                <audio controls className="w-full h-8 rounded-xl" preload="metadata">
                  <source src={message.content} />
                </audio>
              ) : (
                <p className="text-xs text-stone-400">Audio unavailable</p>
              )}
            </div>
          ) : hasImage ? (
            <>
              <img
                src={message.attachment_url!}
                alt="attachment"
                className="w-full max-w-[160px] sm:max-w-[220px] rounded-xl object-cover cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />
              {lightboxOpen && createPortal(
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
                  onClick={() => setLightboxOpen(false)}
                >
                  <button
                    className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-1.5 hover:bg-black/60 transition-colors"
                    onClick={() => setLightboxOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={message.attachment_url!}
                    alt="attachment"
                    className="max-w-full max-h-full w-full sm:w-auto sm:max-w-[90vw] sm:max-h-[90vh] object-contain sm:rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>,
                document.body
              )}
            </>
          ) : (
            <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 px-1">
          {formatChatTime(message.created_at)}
        </span>
      </div>

      {isMine && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-100 border border-stone-200/70 shadow-sm overflow-hidden">
          {myAvatarUrl ? (
            <img src={myAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-stone-500" />
          )}
        </div>
      )}
    </div>
  );
}