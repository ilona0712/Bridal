export type ChatMessage = {
  id: string;
  conversation_id: string;
  content: string;
  sender_type: "customer" | "designer";
  created_at: string;
  is_audio: boolean;
  duration_ms?: number | null;
  attachment_url: string | null;
  attachment_type: string | null;
};

export type ConversationSummary = {
  id: string;
  customer_id: string;
  clientName: string;
  profileImageUrl?: string | null;
  lastMessage: string;
  lastMessageType: "text" | "image" | "audio";
  lastMessageAt: string | null;
  unreadCount: number;
  timestamp: string;
  unread: boolean;
};
