export type ActiveTab = "list" | "add" | "collections" | "settings";

export type AdminCollection = {
  id: string;
  name: string;
  isActive: boolean;
};

export type EditingCollection = {
  id: string;
  oldName: string;
  newName: string;
};

export type DressFormData = {
  name: string;
  collections: string[];
  price: number | null;
  image: string;
  images: string[];
  sizes: number[];
  neckline: string;
  silhouette: string;
  fabric: string;
  trainLength: string;
  sleeveStyle: string;
};

export type ChatbotRequestStatus =
  | "in_progress"
  | "pending_review"
  | "approved"
  | "rejected"
  | "image_requested"
  | "image_generated"
  | "generation_failed"
  | "completed";

export type AdminCustomizationRequest = {
  id: string;
  customerId: string;
  customerName: string;
  conversationId: string | null;
  dressId: string | null;
  dressName: string | null;
  dressImage: string | null;
  requestSummary: string | null;
  generatedPrompt: string | null;
  imageUrl: string | null;
  generationError: string | null;
  status: ChatbotRequestStatus;
  createdAt: string;
  updatedAt: string;
};
