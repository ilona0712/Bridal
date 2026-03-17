export type BaseDressRow = {
  id: string | number;
  name: string | null;
  silhouette: string | null;
  base_price: number | string | null;
  status: string | null;
  dress_images?: Array<{
    image_url: string | null;
    is_primary: boolean | null;
  }> | null;
  dress_collections?: Array<{
    collections?: {
      name: string | null;
    } | null;
  }> | null;
  dress_attribute_values?: Array<{
    attribute_values?: {
      value_key: string | null;
      label: string | null;
      attributes?: {
        key: string | null;
      } | null;
    } | null;
  }> | null;
};