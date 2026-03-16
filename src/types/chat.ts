export type ChatMessage = {
  id: string;
  conversation_id: string;
  content: string;
  sender_type: "customer" | "designer";
  created_at: string;
};

export type ConversationSummary = {
  id: string;
  customer_id: string;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
};