import { supabase } from "../../../lib/supabase";

type UploadedDressImage = {
  path: string;
  publicUrl: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.-]+/g, "_");
}

export function extractStoragePathFromPublicUrl(
  publicUrl: string,
  bucketName: string,
) {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return publicUrl.slice(markerIndex + marker.length);
}

export async function uploadDressImageFile(
  file: File,
  dressId: string,
  index: number,
): Promise<UploadedDressImage> {
  const originalName = file.name;
  const lastDotIndex = originalName.lastIndexOf(".");
  const baseName =
    lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName;
  const extension =
    lastDotIndex > 0 ? originalName.slice(lastDotIndex + 1) : "jpg";

  const safeBaseName = sanitizeFileName(baseName);
  const safeExtension = sanitizeFileName(extension);
  const filePath = `${dressId}/${Date.now()}-${index}-${safeBaseName}.${safeExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("dresses")
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("dresses").getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded image.");
  }

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}

export async function removeDressStorageFiles(paths: string[]) {
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from("dresses").remove(paths);

  if (error) {
    throw new Error(`Failed to remove storage files: ${error.message}`);
  }
}