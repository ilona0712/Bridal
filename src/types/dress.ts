//added isVisible for deleting + hide/show dresses feature
export interface Dress {
  id: number;
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
  isVisible: boolean;
}