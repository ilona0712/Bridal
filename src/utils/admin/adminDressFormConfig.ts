import type { DressFormData } from "../../types/admin";

export const EMPTY_DRESS_FORM: DressFormData = {
  name: "",
  collections: [],
  price: null,
  image: "",
  images: [],
  sizes: [],
  neckline: "",
  silhouette: "",
  fabric: "",
  trainLength: "",
  sleeveStyle: "",
};

export const ADMIN_DRESS_FORM_OPTIONS = {
  necklines: ["Sweetheart", "V-Neck", "Off-Shoulder", "Halter"],
  silhouettes: ["A-Line", "Ball Dress", "Mermaid", "Sheath"],
  fabrics: ["Lace", "Satin", "Chiffon", "Crepe", "Tulle"],
  trainLengths: ["No Train", "Court", "Chapel", "Cathedral"],
  sleeveStyles: ["Sleeveless", "Cap Sleeve", "Long Sleeve"],
  availableSizes: [32, 34, 36, 38, 40, 42, 44, 46],
} as const;
