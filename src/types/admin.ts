export type ActiveTab = "list" | "add" | "collections";

export type EditingCollection = {
  old: string;
  new: string;
};

export type DressFormData = {
  name: string;
  collections: string[];
  price: number;
  image: string;
  sizes: number[];
  neckline: string;
  silhouette: string;
  fabric: string;
  trainLength: string;
  sleeveStyle: string;
};