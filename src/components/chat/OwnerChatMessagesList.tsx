import { useLayoutEffect, useRef } from "react";
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

type DisplayItem =
  | { kind: "single"; message: ChatMessage }
  | { kind: "album"; messages: ChatMessage[] };

function groupMessages(messages: ChatMessage[]): DisplayItem[] {
  const items: DisplayItem[] = [];
  let i = 0;
  while (i < messages.length) {
    const msg = messages[i];
    const isImg = msg.attachment_type === "image" && !!msg.attachment_url;

    if (!isImg) {
      items.push({ kind: "single", message: msg });
      i++;
      continue;
    }

    // collect consecutive images from same sender within 60 seconds
    const group: ChatMessage[] = [msg];
    let j = i + 1;
    while (j < messages.length) {
      const next = messages[j];
      if (next.attachment_type !== "image" || !next.attachment_url) break;
      if (next.sender_type !== msg.sender_type) break;
      const dt = Math.abs(
        new Date(next.created_at).getTime() -
          new Date(group[group.length - 1].created_at).getTime(),
      );
      if (dt > 60000) break;
      group.push(next);
      j++;
    }

    items.push(group.length >= 2 ? { kind: "album", messages: group } : { kind: "single", message: msg });
    i = j;
  }
  return items;
}

export default function OwnerChatMessagesList({
  messages,
  role,
  myAvatarUrl,
  otherAvatarUrl,
  onViewProfile,
  headerOverlay,
}: OwnerChatMessagesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedInitialMessagesRef = useRef(false);
  const previousMessageCountRef = useRef(0);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (messages.length === 0) {
      previousMessageCountRef.current = 0;
      return;
    }

    if (!hasLoadedInitialMessagesRef.current) {
      container.scrollTop = container.scrollHeight;
      hasLoadedInitialMessagesRef.current = true;
    } else if (messages.length > previousMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages]);

  const displayItems = groupMessages(messages);

  return (
    <div className="relative flex-1 min-h-0">
      {/* scrollable messages */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto pt-16 p-6 space-y-4 bg-stone-50/30 dark:bg-stone-900/30"
      >
        {displayItems.map((item) =>
          item.kind === "album" ? (
            <OwnerChatMessageBubble
              key={item.messages[0].id}
              message={item.messages[item.messages.length - 1]}
              albumUrls={item.messages.map((m) => m.attachment_url!)}
              role={role}
              myAvatarUrl={myAvatarUrl}
              otherAvatarUrl={otherAvatarUrl}
              onViewProfile={onViewProfile}
            />
          ) : (
            <OwnerChatMessageBubble
              key={item.message.id}
              message={item.message}
              role={role}
              myAvatarUrl={myAvatarUrl}
              otherAvatarUrl={otherAvatarUrl}
              onViewProfile={onViewProfile}
            />
          ),
        )}
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

      {/* name/avatar overlay — above the blur */}
      {headerOverlay && (
        <div className="absolute top-0 left-0 right-0 z-20">{headerOverlay}</div>
      )}
    </div>
  );
}
