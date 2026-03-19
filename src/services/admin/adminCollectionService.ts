import { supabase } from "../../../lib/supabase";

type CollectionRecord = {
  id: string | number;
  name: string | null;
};

export async function createCollection(
  name: string,
  selectedDressIds: string[],
) {
  const trimmedName = name.trim();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user?.id) {
    throw new Error("Could not get current user.");
  }

  const { data: insertedCollection, error: insertCollectionError } =
    await supabase
      .from("collections")
      .insert({
        name: trimmedName,
        description: trimmedName,
        season: "General",
        year: new Date().getFullYear(),
        is_active: true,
        created_by: session.user.id,
      })
      .select("id, name")
      .single()
      .returns<CollectionRecord>();

  if (insertCollectionError || !insertedCollection) {
    throw new Error(
      insertCollectionError?.message || "Failed to create collection.",
    );
  }

  if (selectedDressIds.length > 0) {
    const dressCollectionRows = selectedDressIds.map((dressId) => ({
      dress_id: dressId,
      collection_id: insertedCollection.id,
    }));

    const { error: linkError } = await supabase
      .from("dress_collections")
      .insert(dressCollectionRows);

    if (linkError) {
      throw new Error(
        `Collection created, but linking failed: ${linkError.message}`,
      );
    }
  }

  return {
    id: String(insertedCollection.id),
    name: insertedCollection.name ?? trimmedName,
  };
}

export async function updateCollection(
  collectionId: string,
  newName: string,
  selectedDressIds: string[],
) {
  const trimmedName = newName.trim();

  const { data: existingCollection, error: lookupError } = await supabase
    .from("collections")
    .select("id, name")
    .eq("id", collectionId)
    .single()
    .returns<CollectionRecord>();

  if (lookupError || !existingCollection) {
    throw new Error(lookupError?.message || "Failed to find collection.");
  }

  const { error: updateError } = await supabase
    .from("collections")
    .update({ name: trimmedName })
    .eq("id", collectionId);

  if (updateError) {
    throw new Error(`Failed to update collection: ${updateError.message}`);
  }

  const { error: unlinkError } = await supabase
    .from("dress_collections")
    .delete()
    .eq("collection_id", collectionId);

  if (unlinkError) {
    throw new Error(`Failed to update dress links: ${unlinkError.message}`);
  }

  if (selectedDressIds.length > 0) {
    const linkRows = selectedDressIds.map((dressId) => ({
      dress_id: dressId,
      collection_id: collectionId,
    }));

    const { error: linkError } = await supabase
      .from("dress_collections")
      .insert(linkRows);

    if (linkError) {
      throw new Error(
        `Collection renamed, but linking failed: ${linkError.message}`,
      );
    }
  }

  return {
    id: String(existingCollection.id),
    name: trimmedName,
  };
}

export async function deleteCollectionById(collectionId: string) {
  const { data: existingCollection, error: lookupError } = await supabase
    .from("collections")
    .select("id, name")
    .eq("id", collectionId)
    .single()
    .returns<CollectionRecord>();

  if (lookupError || !existingCollection) {
    throw new Error(lookupError?.message || "Failed to find collection.");
  }

  const { error: unlinkError } = await supabase
    .from("dress_collections")
    .delete()
    .eq("collection_id", collectionId);

  if (unlinkError) {
    throw new Error(`Failed to unlink dresses: ${unlinkError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId);

  if (deleteError) {
    throw new Error(`Failed to delete collection: ${deleteError.message}`);
  }

  return {
    id: String(existingCollection.id),
    name: existingCollection.name ?? "",
  };
}