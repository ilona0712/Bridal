export interface Dress {
  id: string;
  name: string;
  collections: string[];
  price: number | null | undefined;
  image: string;
  images: string[];
  sizes: number[];
  neckline: string;
  silhouette: string;
  fabric: string;
  trainLength: string;
  sleeveStyle: string;
  isVisible: boolean;
}