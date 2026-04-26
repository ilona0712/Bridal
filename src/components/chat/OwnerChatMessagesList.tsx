import { useEffect, useRef } from "react";
import OwnerChatMessageBubble from "./OwnerChatMessageBubble";
import type { ChatMessage } from "../../types/chat";
import { formatChatDayLabel } from "../../utils/common/formatChatDayLabel";

type OwnerChatMessagesListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  role: string | null;
  myAvatarUrl?: string | null;
  otherAvatarUrl?: string | null;
  onViewProfile?: () => void;
  onDeleteMessage?: (messageId: string) => void;
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

    items.push(
      group.length >= 2
        ? { kind: "album", messages: group }
        : { kind: "single", message: msg },
    );

    i = j;
  }

  return items;
}

function getDateKey(dateString: string) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function OwnerChatMessagesList({
  messages,
  role,
  myAvatarUrl,
  otherAvatarUrl,
  onViewProfile,
  onDeleteMessage,
  headerOverlay,
}: OwnerChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    if (messages.length === 0) return;
    const behavior = initialScrollDone.current ? "smooth" : "instant";
    bottomRef.current?.scrollIntoView({ behavior });
    initialScrollDone.current = true;
  }, [messages]);

  const displayItems = groupMessages(messages);

  return (
    <div className="relative flex-1 min-h-0">
      <div className="absolute inset-0 overflow-y-auto pt-16 p-6 space-y-4 bg-stone-50/30 dark:bg-stone-900/30">
        {displayItems.map((item, index) => {
          const message =
            item.kind === "album"
              ? item.messages[item.messages.length - 1]
              : item.message;

          const prevItem = index > 0 ? displayItems[index - 1] : null;

          const prevMessage =
            prevItem && prevItem.kind === "album"
              ? prevItem.messages[prevItem.messages.length - 1]
              : prevItem && prevItem.kind === "single"
                ? prevItem.message
                : null;

          const showSeparator =
            !prevMessage ||
            getDateKey(prevMessage.created_at) !== getDateKey(message.created_at);

          return (
            <div key={message.id}>
              {showSeparator && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-stone-200/70 text-stone-600 text-xs">
                    {formatChatDayLabel(message.created_at)}
                  </span>
                </div>
              )}

              {item.kind === "album" ? (
                <OwnerChatMessageBubble
                  message={message}
                  albumUrls={item.messages.map((m) => m.attachment_url!)}
                  role={role}
                  myAvatarUrl={myAvatarUrl}
                  otherAvatarUrl={otherAvatarUrl}
                  onViewProfile={onViewProfile}
                  onDeleteMessage={onDeleteMessage}
                />
              ) : (
                <OwnerChatMessageBubble
                  message={message}
                  role={role}
                  myAvatarUrl={myAvatarUrl}
                  otherAvatarUrl={otherAvatarUrl}
                  onViewProfile={onViewProfile}
                  onDeleteMessage={onDeleteMessage}
                />
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />

      {headerOverlay && (
        <div className="absolute top-0 left-0 right-0 z-20">{headerOverlay}</div>
      )}
    </div>
  );
}