import type { Dress } from "../../types/dress";
import type { BaseDressRow } from "./dressRowTypes";

export function mapDressRowToUiDress(dress: BaseDressRow): Dress {
  const primaryImage =
    dress.dress_images?.find((img) => img.is_primary)?.image_url ||
    dress.dress_images?.[0]?.image_url ||
    "/placeholder.png";

  const allImages = [...(dress.dress_images || [])]
    .sort(
      (a, b) =>
        Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)),
    )
    .map((img) => img.image_url)
    .filter((url): url is string => Boolean(url));

  const collectionNames = Array.from(
    new Set(
      (dress.dress_collections || [])
        .map((link) => link.collections?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const attributeEntries = (dress.dress_attribute_values || [])
    .map((link) => link.attribute_values)
    .filter(Boolean);

  const sizeLabels = attributeEntries
    .filter((value) => value?.attributes?.key === "size")
    .map((value) => Number(value?.label))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);

  const neckline =
    attributeEntries.find((value) => value?.attributes?.key === "neckline")
      ?.label ?? "";

  const fabric =
    attributeEntries.find((value) => value?.attributes?.key === "fabric")
      ?.label ?? "";

  const trainLength =
    attributeEntries.find((value) => value?.attributes?.key === "train_length")
      ?.label ?? "";

  const sleeveStyle =
    attributeEntries.find((value) => value?.attributes?.key === "sleeve_style")
      ?.label ?? "";

  return {
    id: String(dress.id),
    name: dress.name ?? "Unnamed Dress",
    collections: collectionNames.length > 0 ? collectionNames : ["Uncategorized"],
    price: Number(dress.base_price ?? 0),
    image: primaryImage,
    images: allImages.length > 0 ? allImages : ["/placeholder.png"],
    sizes: sizeLabels,
    neckline,
    silhouette: dress.silhouette ?? "",
    fabric,
    trainLength,
    sleeveStyle,
    isVisible: dress.status === "published",
  };
}