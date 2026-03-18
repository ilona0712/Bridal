export type ActiveTab = "list" | "add" | "collections" | "settings";

export type AdminCollection = {
  id: string;
  name: string;
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