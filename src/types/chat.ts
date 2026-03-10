export type OwnerChatMessage = {
  type: "owner" | "user";
  text: string;
  time: string;
};