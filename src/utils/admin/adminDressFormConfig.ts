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
  availableSizes: [32, 34, 36, 38, 40, 42, 44, 46],
} as const;
