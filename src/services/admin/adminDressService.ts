import { supabase } from "../../../lib/supabase";
import {
  syncDressAttributes,
  type CollectionLookupRow,
} from "../../utils/admin/adminDressHelpers";
import type { DressFormData } from "../../types/admin";
import {
  extractStoragePathFromPublicUrl,
  removeDressStorageFiles,
  uploadDressImageFile,
} from "./adminImageStorageService";

type PersistedDressRow = {
  id: string | number;
  name: string | null;
  silhouette: string | null;
  base_price: number | string | null;
  status: string | null;
};

type DressMutationResult = {
  dress: PersistedDressRow;
  imageUrls: string[];
};

type DressImageRow = {
  image_url: string | null;
};

async function getCollectionIdsByNames(collectionNames: string[]) {
  const { data: collectionRows, error: collectionsLookupError } = await supabase
    .from("collections")
    .select("id, name")
    .in("name", collectionNames)
    .returns<CollectionLookupRow[]>();

  if (collectionsLookupError) {
    throw new Error(collectionsLookupError.message);
  }

  return (collectionRows || []).map((row) => row.id).filter(Boolean);
}

async function getExistingDressImageUrls(dressId: string) {
  const { data, error } = await supabase
    .from("dress_images")
    .select("image_url")
    .eq("dress_id", dressId)
    .returns<DressImageRow[]>();

  if (error) {
    throw new Error(`Failed to load existing dress images: ${error.message}`);
  }

  return (data || [])
    .map((row) => row.image_url)
    .filter((url): url is string => Boolean(url));
}

function getStoragePathsFromUrls(urls: string[]) {
  return urls
    .map((url) => extractStoragePathFromPublicUrl(url, "dresses"))
    .filter((path): path is string => Boolean(path));
}

async function resolveDressImageUrls(
  dressId: string,
  images: string[],
  imageFiles: Array<File | null>,
) {
  const resolvedUrls: string[] = [];
  const uploadedPaths: string[] = [];

  for (let i = 0; i < images.length; i += 1) {
    const imageFile = imageFiles[i];

    if (imageFile) {
      const uploaded = await uploadDressImageFile(imageFile, dressId, i);
      resolvedUrls.push(uploaded.publicUrl);
      uploadedPaths.push(uploaded.path);
    } else {
      resolvedUrls.push(images[i]);
    }
  }

  return { resolvedUrls, uploadedPaths };
}

async function replaceDressImages(dressId: string, imageUrls: string[]) {
  const { error: deleteImagesError } = await supabase
    .from("dress_images")
    .delete()
    .eq("dress_id", dressId);

  if (deleteImagesError) {
    throw new Error(deleteImagesError.message);
  }

  if (imageUrls.length === 0) {
    return;
  }

  const imageRows = imageUrls.map((img, index) => ({
    dress_id: dressId,
    image_url: img,
    is_primary: index === 0,
  }));

  const { error: insertImageError } = await supabase
    .from("dress_images")
    .insert(imageRows);

  if (insertImageError) {
    throw new Error(insertImageError.message);
  }
}

async function replaceDressCollections(
  dressId: string,
  collectionNames: string[],
) {
  const { error: deleteLinksError } = await supabase
    .from("dress_collections")
    .delete()
    .eq("dress_id", dressId);

  if (deleteLinksError) {
    throw new Error(deleteLinksError.message);
  }

  if (collectionNames.length === 0) {
    return;
  }

  const collectionIds = await getCollectionIdsByNames(collectionNames);

  if (collectionIds.length > 0) {
    const { error: insertLinksError } = await supabase
      .from("dress_collections")
      .insert(
        collectionIds.map((collectionId) => ({
          dress_id: dressId,
          collection_id: collectionId,
        })),
      );

    if (insertLinksError) {
      throw new Error(insertLinksError.message);
    }
  }
}

export async function createDress(
  formData: DressFormData,
  imageFiles: Array<File | null>,
): Promise<DressMutationResult> {
  const { data: insertedDress, error: dressInsertError } = await supabase
    .from("dresses")
    .insert({
      name: formData.name.trim(),
      description: null,
      silhouette: formData.silhouette || null,
      base_price: formData.price,
      is_customizable: false,
      status: "published",
    })
    .select("id, name, silhouette, base_price, status")
    .single()
    .returns<PersistedDressRow>();

  if (dressInsertError || !insertedDress) {
    throw new Error(dressInsertError?.message || "Failed to create dress.");
  }

  const dressId = String(insertedDress.id);
  let uploadedPaths: string[] = [];

  try {
    const resolved = await resolveDressImageUrls(
      dressId,
      formData.images,
      imageFiles,
    );
    uploadedPaths = resolved.uploadedPaths;

    await replaceDressImages(dressId, resolved.resolvedUrls);
    await replaceDressCollections(dressId, formData.collections);
    await syncDressAttributes(dressId, formData);

    return {
      dress: insertedDress,
      imageUrls: resolved.resolvedUrls,
    };
  } catch (error) {
    await deleteDressById(dressId);
    await removeDressStorageFiles(uploadedPaths);
    throw error;
  }
}

export async function updateDress(
  dressId: string,
  formData: DressFormData,
  imageFiles: Array<File | null>,
): Promise<DressMutationResult> {
  const existingImageUrls = await getExistingDressImageUrls(dressId);

  const { data: updatedDress, error: dressUpdateError } = await supabase
    .from("dresses")
    .update({
      name: formData.name.trim(),
      description: null,
      silhouette: formData.silhouette || null,
      base_price: formData.price,
      status: "published",
    })
    .eq("id", dressId)
    .select("id, name, silhouette, base_price, status")
    .single()
    .returns<PersistedDressRow>();

  if (dressUpdateError || !updatedDress) {
    throw new Error(dressUpdateError?.message || "Failed to update dress.");
  }

  const resolved = await resolveDressImageUrls(dressId, formData.images, imageFiles);

  await replaceDressImages(dressId, resolved.resolvedUrls);
  await replaceDressCollections(dressId, formData.collections);
  await syncDressAttributes(dressId, formData);

  const keptUrlSet = new Set(resolved.resolvedUrls);
  const removedOldUrls = existingImageUrls.filter((url) => !keptUrlSet.has(url));
  const removedStoragePaths = getStoragePathsFromUrls(removedOldUrls);

  await removeDressStorageFiles(removedStoragePaths);

  return {
    dress: updatedDress,
    imageUrls: resolved.resolvedUrls,
  };
}

export async function deleteDressById(dressId: string) {
  const existingImageUrls = await getExistingDressImageUrls(dressId);
  const storagePaths = getStoragePathsFromUrls(existingImageUrls);

  const { error: dressAttributeValuesDeleteError } = await supabase
    .from("dress_attribute_values")
    .delete()
    .eq("dress_id", dressId);

  if (dressAttributeValuesDeleteError) {
    throw new Error(
      `Failed to delete dress attributes: ${dressAttributeValuesDeleteError.message}`,
    );
  }

  const { error: dressCollectionsDeleteError } = await supabase
    .from("dress_collections")
    .delete()
    .eq("dress_id", dressId);

  if (dressCollectionsDeleteError) {
    throw new Error(
      `Failed to delete dress links: ${dressCollectionsDeleteError.message}`,
    );
  }

  const { error: dressImagesDeleteError } = await supabase
    .from("dress_images")
    .delete()
    .eq("dress_id", dressId);

  if (dressImagesDeleteError) {
    throw new Error(
      `Failed to delete dress images: ${dressImagesDeleteError.message}`,
    );
  }

  const { error: dressDeleteError } = await supabase
    .from("dresses")
    .delete()
    .eq("id", dressId);

  if (dressDeleteError) {
    throw new Error(`Failed to delete dress: ${dressDeleteError.message}`);
  }

  await removeDressStorageFiles(storagePaths);
}

export async function updateDressVisibility(
  dressId: string,
  isVisible: boolean,
) {
  const nextStatus = isVisible ? "published" : "draft";

  const { error } = await supabase
    .from("dresses")
    .update({ status: nextStatus })
    .eq("id", dressId);

  if (error) {
    throw new Error(`Failed to update visibility: ${error.message}`);
  }
}