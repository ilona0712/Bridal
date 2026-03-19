import { useEffect, useRef } from "react";
import OwnerChatMessageBubble from "./OwnerChatMessageBubble";
import type { ChatMessage } from "../../types/chat";

type OwnerChatMessagesListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
};

export default function OwnerChatMessagesList({
  messages,
  role,
  myAvatarUrl,
  otherAvatarUrl,
}: OwnerChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-stone-50/30">
      {messages.map((message) => (
<OwnerChatMessageBubble
  key={message.id}
  message={message}
  role={role}
  myAvatarUrl={myAvatarUrl}
  otherAvatarUrl={otherAvatarUrl}
/>
))}
      <div ref={bottomRef} />
    </div>
  );
}