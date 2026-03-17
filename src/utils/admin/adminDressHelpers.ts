import { supabase } from "../../../lib/supabase";
import type { DressFormData } from "../../types/admin";
import type { Dress } from "../../types/dress";

export type AdminDressRow = {
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

export type CollectionRow = {
  name: string | null;
};

export type CollectionLookupRow = {
  id: string | number;
  name: string | null;
};

export type AttributeValueLookupRow = {
  id: string;
  label: string | null;
  value_key: string | null;
  attributes?: {
    key: string | null;
  } | null;
};

export function mapDressRowToUiDress(dress: AdminDressRow): Dress {
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
    collections: collectionNames,
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

export async function syncDressAttributes(
  dressId: string,
  formData: DressFormData,
) {
  const selectedAttributeLabels: string[] = [
    ...formData.sizes.map(String),
    ...(formData.neckline ? [formData.neckline] : []),
    ...(formData.fabric ? [formData.fabric] : []),
    ...(formData.trainLength ? [formData.trainLength] : []),
    ...(formData.sleeveStyle ? [formData.sleeveStyle] : []),
  ];

  const uniqueLabels = Array.from(new Set(selectedAttributeLabels));

  const { error: deleteError } = await supabase
    .from("dress_attribute_values")
    .delete()
    .eq("dress_id", dressId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (uniqueLabels.length === 0) {
    return;
  }

  const { data: attributeValueRows, error: attributeLookupError } =
    await supabase
      .from("attribute_values")
      .select(
        `
        id,
        label,
        value_key,
        attributes (
          key
        )
      `,
      )
      .in("label", uniqueLabels)
      .returns<AttributeValueLookupRow[]>();

  if (attributeLookupError) {
    throw new Error(attributeLookupError.message);
  }

  const selectedSizeLabels = new Set(formData.sizes.map(String));

  const selectedIds = (attributeValueRows || [])
    .filter((row) => {
      const attributeKey = row.attributes?.key ?? null;
      const label = row.label ?? "";

      if (attributeKey === "size") return selectedSizeLabels.has(label);
      if (attributeKey === "neckline") return formData.neckline === label;
      if (attributeKey === "fabric") return formData.fabric === label;
      if (attributeKey === "train_length") return formData.trainLength === label;
      if (attributeKey === "sleeve_style") return formData.sleeveStyle === label;

      return false;
    })
    .map((row) => row.id);

  if (selectedIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("dress_attribute_values")
    .insert(
      selectedIds.map((attributeValueId) => ({
        dress_id: dressId,
        attribute_value_id: attributeValueId,
      })),
    );

  if (insertError) {
    throw new Error(insertError.message);
  }
}