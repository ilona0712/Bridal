export type OwnerChatMessage = {
  type: "user" | "owner";
  time: string;
  text?: string;
  audioUrl?: string;
};