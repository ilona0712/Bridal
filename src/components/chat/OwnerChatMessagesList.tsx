import { useEffect, useRef } from "react";
import OwnerChatMessageBubble from "./OwnerChatMessageBubble";
import type { OwnerChatMessage } from "../../types/chat";

type OwnerChatMessagesListProps = {
  messages: OwnerChatMessage[];
};

export default function OwnerChatMessagesList({
  messages,
}: OwnerChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-stone-50/30">
      {messages.map((message, index) => (
        <OwnerChatMessageBubble key={index} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}