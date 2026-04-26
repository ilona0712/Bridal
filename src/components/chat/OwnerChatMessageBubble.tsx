import { Mic, User, X, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import type { ChatMessage } from "../../types/chat";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatChatTime } from "../../utils/common/formatChatTime";

function inferAudioType(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "mp4" || ext === "m4a") return "audio/mp4";
  if (ext === "ogg") return "audio/ogg";
  return "audio/webm";
}

type OwnerChatMessageBubbleProps = {
  message: ChatMessage;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
  onViewProfile?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  albumUrls?: string[];
};

// ── Lightbox carousel ────────────────────────────────────────────────────────
function PhotoLightbox({
  urls,
  initialIndex,
  onClose,
}: {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(urls.length - 1, i + 1));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [urls.length, onClose]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(urls.length - 1, i + 1));

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 50) prev();
        else if (dx < -50) next();
        touchStartX.current = null;
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm">{index + 1} / {urls.length}</span>
        <button
          onClick={onClose}
          className="text-white bg-white/10 rounded-full p-1.5 hover:bg-white/20 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center relative px-12 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {index > 0 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <img
          src={urls[index]}
          alt={`photo ${index + 1}`}
          className="max-w-full max-h-full object-contain select-none rounded-lg"
          style={{ maxHeight: "calc(100vh - 140px)" }}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
        {index < urls.length - 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div
          className="flex gap-1.5 px-4 py-3 overflow-x-auto flex-shrink-0 justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-10 h-10 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                i === index ? "border-white opacity-100" : "border-transparent opacity-40"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Photo grid ───────────────────────────────────────────────────────────────
function PhotoGrid({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  const count = urls.length;
  const base = "w-[180px] sm:w-[210px]";

  if (count === 1) {
    return (
        <img
          src={urls[0]}
          alt="photo"
          className="w-full max-w-[180px] sm:max-w-[220px] rounded-xl object-contain bg-white dark:bg-stone-900 cursor-pointer"
          onClick={() => onOpen(0)}
        />
    );
  }

  if (count === 2) {
    return (
      <div className={`grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden ${base}`}>
        {urls.map((url, i) => (
          <div key={i} className="aspect-square">
            <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => onOpen(i)} />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden ${base} h-[180px] sm:h-[210px]`}>
        <div className="row-span-2">
          <img src={urls[0]} alt="photo 1" className="w-full h-full object-cover cursor-pointer" onClick={() => onOpen(0)} />
        </div>
        {urls.slice(1).map((url, i) => (
          <div key={i} className="overflow-hidden">
            <img src={url} alt={`photo ${i + 2}`} className="w-full h-full object-cover cursor-pointer" onClick={() => onOpen(i + 1)} />
          </div>
        ))}
      </div>
    );
  }

  // 4+: show first 4, overlay +N on the 4th
  const extra = count > 4 ? count - 3 : 0;
  return (
    <div className={`grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden ${base}`}>
      {urls.slice(0, 4).map((url, i) => (
        <div key={i} className="relative aspect-square">
          <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => onOpen(i)} />
          {i === 3 && extra > 0 && (
            <div
              className="absolute inset-0 bg-black/55 flex items-center justify-center cursor-pointer"
              onClick={() => onOpen(3)}
            >
              <span className="text-white text-2xl font-semibold">+{extra}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main bubble ──────────────────────────────────────────────────────────────
export default function OwnerChatMessageBubble({
  message,
  role,
  myAvatarUrl,
  otherAvatarUrl,
  onViewProfile,
  onDeleteMessage,
  albumUrls,
}: OwnerChatMessageBubbleProps) {
  const isMine =
    (role === "admin" && message.sender_type === "designer") ||
    (role !== "admin" && message.sender_type === "customer");

  const senderLabel =
    message.sender_type === "designer"
      ? "Maria Badari"
      : (message.sender_type as string) === "consultant"
        ? "MAI"
        : "Customer";

  const hasAudio = message.is_audio === true;
  const hasImage = message.attachment_type === "image" && message.attachment_url;
  const isAlbum = albumUrls && albumUrls.length > 1;

  const [duration, setDuration] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxIndex]);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.message-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    if (!hasAudio || !message.content) return;
    const audio = new Audio(message.content);
    const updateDuration = () => {
      const d = audio.duration;
      if (!d || !isFinite(d)) return;
      const secs = Math.floor(d);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setDuration(`${m}:${s.toString().padStart(2, "0")}`);
    };
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.src = "";
    };
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
        <span className="text-[10px] sm:text-xs text-stone-500 px-1">{senderLabel}</span>

        {/* Message row with content and menu */}
        <div className={`flex items-end gap-2 ${isMine ? "justify-end" : "flex-row"}`}>
          <div
            className={[
              "rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-sm transition-all w-fit relative",
              isAlbum ? "overflow-hidden p-0" : hasAudio ? "min-w-[140px] sm:min-w-[200px] max-w-full px-2.5 py-1.5 sm:px-4 sm:py-2.5" : "max-w-full px-2.5 py-1.5 sm:px-4 sm:py-2.5",
              isMine
                ? "bg-gradient-to-br from-stone-300 via-pink-100 to-stone-200 dark:from-stone-600 dark:via-pink-900/20 dark:to-stone-600 text-stone-800 dark:text-stone-100 rounded-br-sm border border-pink-100/60 dark:border-stone-500/60"
                : "bg-white/90 dark:bg-stone-700/90 text-stone-800 dark:text-stone-100 rounded-bl-sm border border-stone-200/70 dark:border-stone-600/70",
            ].join(" ")}
          >
            {hasAudio ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isMine ? "bg-white/50 border border-white/60" : "bg-amber-50 border border-amber-100"}`}>
                    <Mic className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Voice message</span>
                  {duration && <span className="text-stone-400">{duration}</span>}
                </div>
                {message.content ? (
                  <audio controls className="w-full h-8 rounded-xl" preload="metadata">
                    <source src={message.content} type={inferAudioType(message.content)} />
                  </audio>
                ) : (
                  <p className="text-xs text-stone-400">Audio unavailable</p>
                )}
              </div>
            ) : isAlbum ? (
              <>
                <PhotoGrid urls={albumUrls!} onOpen={setLightboxIndex} />
                {lightboxIndex !== null &&
                  createPortal(
                    <PhotoLightbox
                      urls={albumUrls!}
                      initialIndex={lightboxIndex}
                      onClose={() => setLightboxIndex(null)}
                    />,
                    document.body
                  )}
              </>
            ) : hasImage ? (
              <>
                  <img
                    src={message.attachment_url!}
                    alt="attachment"
                    className="w-full max-w-[160px] sm:max-w-[220px] rounded-xl object-contain bg-white dark:bg-stone-900 cursor-pointer"
                    onClick={() => setLightboxIndex(0)}
                  />
                {lightboxIndex === 0 &&
                  createPortal(
                    <PhotoLightbox
                      urls={[message.attachment_url!]}
                      initialIndex={0}
                      onClose={() => setLightboxIndex(null)}
                    />,
                    document.body,
                  )}
                </>
            ) : (
              <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {isMine && onDeleteMessage && (
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 message-menu">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-stone-400 dark:text-stone-500 hover:bg-pink-100/40 dark:hover:bg-pink-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-150"
                  title="Delete message"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showMenu && (
                  <div className="absolute -left-32 top-6 z-10 bg-white/95 dark:bg-stone-700/95 backdrop-blur-sm border border-pink-100/60 dark:border-stone-600/60 rounded-lg shadow-lg py-1.5 px-1 min-w-[120px] message-menu">
                    <button
                      onClick={() => {
                        onDeleteMessage(message.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-200 hover:bg-pink-50/80 dark:hover:bg-stone-600/80 transition-colors duration-150 flex items-center gap-2 group rounded-md"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 7h12M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1m1 0h-14l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
                      </svg>
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
