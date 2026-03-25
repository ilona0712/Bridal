import { supabase } from "../../../lib/supabase";
import type { DressFormData } from "../../types/admin";
import type { BaseDressRow } from "../common/dressRowTypes";

export type AdminDressRow = BaseDressRow;

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



export async function syncDressAttributes(
  dressId: string,
  formData: DressFormData,
) {
  const selectedAttributeLabels: string[] = [
    ...formData.sizes.map(String),
    ...(formData.neckline ? [formData.neckline] : []),
    ...(formData.silhouette ? [formData.silhouette] : []),
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
      if (attributeKey === "silhouette") return formData.silhouette === label;
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