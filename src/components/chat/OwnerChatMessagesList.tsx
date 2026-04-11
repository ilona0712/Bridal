import { useEffect, useRef } from "react";
import OwnerChatMessageBubble from "./OwnerChatMessageBubble";
import type { ChatMessage } from "../../types/chat";

type OwnerChatMessagesListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
  onViewProfile?: () => void;
  headerOverlay?: React.ReactNode;
};

export default function OwnerChatMessagesList({
  messages,
  role,
  myAvatarUrl,
  otherAvatarUrl,
  onViewProfile,
  headerOverlay,
}: OwnerChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative flex-1 min-h-0">
      {/* scrollable messages — pt-16 keeps first message below the overlay */}
      <div className="absolute inset-0 overflow-y-auto pt-16 p-6 space-y-4 bg-stone-50/30 dark:bg-stone-900/30">
        {messages.map((message) => (
          <OwnerChatMessageBubble
            key={message.id}
            message={message}
            role={role}
            myAvatarUrl={myAvatarUrl}
            otherAvatarUrl={otherAvatarUrl}
            onViewProfile={onViewProfile}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* blur-fade overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />

      {/* name/avatar — above the blur */}
      {headerOverlay && (
        <div className="absolute top-0 left-0 right-0 z-20">
          {headerOverlay}
        </div>
      )}
    </div>
  );
}
