//added isVisible for deleting + hide/show dresses feature
export interface Dress {
  id: string;
  name: string;
  collections: string[];
  price: number;

  // main image used in gallery cards
  image: string;

  // all images from database
  images: string[];

  sizes: number[];
  neckline: string;
  silhouette: string;
  fabric: string;
  trainLength: string;
  sleeveStyle: string;
  isVisible: boolean;
}