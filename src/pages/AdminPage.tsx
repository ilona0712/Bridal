import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { supabase } from "../../lib/supabase";
import Header from "../components/common/Header";
import AdminCollectionsTab from "../components/admin/AdminCollectionsTab";
import AdminDressFormTab from "../components/admin/AdminDressFormTab";
import AdminDressListTab from "../components/admin/AdminDressListTab";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminTabs from "../components/admin/AdminTabs";
import type { 
  ActiveTab,
  DressFormData,
  EditingCollection,
} from "../types/admin";
import type { Dress } from "../types/dress";

type AdminDressRow = {
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

type CollectionRow = {
  name: string | null;
};

type CollectionLookupRow = {
  id: string | number;
  name: string | null;
};

type AttributeValueLookupRow = {
  id: string;
  label: string | null;
  value_key: string | null;
  attributes?: {
    key: string | null;
  } | null;
};

function mapDressRowToUiDress(dress: AdminDressRow): Dress {
  const primaryImage =
    dress.dress_images?.find((img) => img.is_primary)?.image_url ||
    dress.dress_images?.[0]?.image_url ||
    "/placeholder.png";

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
    sizes: sizeLabels,
    neckline,
    silhouette: dress.silhouette ?? "",
    fabric,
    trainLength,
    sleeveStyle,
    isVisible: dress.status === "published",
  };
}

async function syncDressAttributes(dressId: string, formData: DressFormData) {
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
      if (attributeKey === "train_length")
        return formData.trainLength === label;
      if (attributeKey === "sleeve_style")
        return formData.sleeveStyle === label;

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  const [dresses, setDresses] = useState<Dress[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  const [editingDress, setEditingDress] = useState<Dress | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingCollection, setEditingCollection] =
    useState<EditingCollection | null>(null);
  const [addingCollectionMode, setAddingCollectionMode] = useState(false);
  const [selectedDressesForCollection, setSelectedDressesForCollection] =
    useState<string[]>([]);
  const [
    selectedDressesForEditCollection,
    setSelectedDressesForEditCollection,
  ] = useState<string[]>([]);
  const [showDressSelectionForEdit, setShowDressSelectionForEdit] =
    useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<DressFormData>({
    name: "",
    collections: [],
    price: 0,
    image: "",
    sizes: [],
    neckline: "",
    silhouette: "",
    fabric: "",
    trainLength: "",
    sleeveStyle: "",
  });

  const necklines = ["Sweetheart", "V-Neck", "Off-Shoulder", "Halter"];
  const silhouettes = ["A-Line", "Ball Gown", "Mermaid", "Sheath"];
  const fabrics = ["Lace", "Satin", "Chiffon", "Crepe", "Tulle"];
  const trainLengths = ["No Train", "Court", "Chapel", "Cathedral"];
  const sleeveStyles = ["Sleeveless", "Cap Sleeve", "Long Sleeve"];

  const availableSizes = [32, 34, 36, 38, 40, 42, 44, 46];

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingInitialData(true);
      setInitialDataError(null);

      const [
        { data: dressesData, error: dressesError },
        { data: collectionsData, error: collectionsError },
      ] = await Promise.all([
        supabase
          .from("dresses")
          .select(
  `
    id,
    name,
    silhouette,
    base_price,
    status,
    dress_images (
      image_url,
      is_primary
    ),
    dress_collections (
      collections (
        name
      )
    ),
    dress_attribute_values (
      attribute_values (
        value_key,
        label,
        attributes (
          key
        )
      )
    )
  `,
)
          .returns<AdminDressRow[]>(),
        supabase
          .from("collections")
          .select("name")
          .order("name", { ascending: true })
          .returns<CollectionRow[]>(),
      ]);

      if (dressesError) {
        console.error("Admin dresses fetch failed:", dressesError);
        setInitialDataError(dressesError.message);
        setLoadingInitialData(false);
        return;
      }

      if (collectionsError) {
        console.error("Admin collections fetch failed:", collectionsError);
        setInitialDataError(collectionsError.message);
        setLoadingInitialData(false);
        return;
      }

      const mappedDresses = (dressesData || []).map(mapDressRowToUiDress);
      const mappedCollections = (collectionsData || [])
        .map((collection) => collection.name)
        .filter((name): name is string => Boolean(name));

      setDresses(mappedDresses);
      setCollections(mappedCollections);
      setLoadingInitialData(false);
    };

    fetchAdminData();
  }, []);

  const handleSizeToggle = (size: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size].sort((a, b) => a - b),
    }));
  };

  const handleCollectionToggle = (collection: string) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.includes(collection)
        ? prev.collections.filter((c) => c !== collection)
        : [...prev.collections, collection],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      collections: [],
      price: 0,
      image: "",
      sizes: [],
      neckline: "",
      silhouette: "",
      fabric: "",
      trainLength: "",
      sleeveStyle: "",
    });
    setEditingDress(null);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;

      if (typeof result === "string") {
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Dress name is required!");
      return;
    }

    if (!formData.image.trim()) {
      alert("At least one image is required!");
      return;
    }

    if (formData.collections.length === 0) {
      alert("Please select at least one collection!");
      return;
    }

    if (editingDress) {
      try {
        const { error: dressUpdateError } = await supabase
          .from("dresses")
          .update({
            name: formData.name.trim(),
            description: null,
            silhouette: formData.silhouette || null,
            base_price: formData.price,
            status: "published",
          })
          .eq("id", editingDress.id);

        if (dressUpdateError) {
          console.error("Dress update failed:", dressUpdateError);
          alert(`Failed to update dress: ${dressUpdateError.message}`);
          return;
        }

        const { error: deleteImagesError } = await supabase
          .from("dress_images")
          .delete()
          .eq("dress_id", editingDress.id);

        if (deleteImagesError) {
          console.error("Dress images delete failed:", deleteImagesError);
          alert(`Failed to update dress image: ${deleteImagesError.message}`);
          return;
        }

        const { error: insertImageError } = await supabase
          .from("dress_images")
          .insert({
            dress_id: editingDress.id,
            image_url: formData.image.trim(),
            is_primary: true,
          });

        if (insertImageError) {
          console.error("Dress image insert failed:", insertImageError);
          alert(`Failed to update dress image: ${insertImageError.message}`);
          return;
        }

        const { error: deleteLinksError } = await supabase
          .from("dress_collections")
          .delete()
          .eq("dress_id", editingDress.id);

        if (deleteLinksError) {
          console.error(
            "Dress collection links delete failed:",
            deleteLinksError,
          );
          alert(
            `Failed to update dress collections: ${deleteLinksError.message}`,
          );
          return;
        }

        const { data: collectionRows, error: collectionsLookupError } =
          await supabase
            .from("collections")
            .select("id, name")
            .in("name", formData.collections)
            .returns<CollectionLookupRow[]>();

        if (collectionsLookupError) {
          console.error("Collection lookup failed:", collectionsLookupError);
          alert(
            `Failed to update dress collections: ${collectionsLookupError.message}`,
          );
          return;
        }

        const collectionIds = (collectionRows || [])
          .map((row) => row.id)
          .filter(Boolean);

        if (collectionIds.length > 0) {
          const { error: insertLinksError } = await supabase
            .from("dress_collections")
            .insert(
              collectionIds.map((collectionId) => ({
                dress_id: editingDress.id,
                collection_id: collectionId,
              })),
            );

          if (insertLinksError) {
            console.error(
              "Dress collection links insert failed:",
              insertLinksError,
            );
            alert(
              `Failed to update dress collections: ${insertLinksError.message}`,
            );
            return;
          }
        }

        try {
          await syncDressAttributes(editingDress.id, formData);
        } catch (err) {
          console.error("Dress attributes sync failed:", err);
          alert("Dress updated, but attributes could not be linked.");
          return;
        }

        setDresses((prev) =>
          prev.map((dress) =>
            dress.id === editingDress.id
              ? {
                  ...dress,
                  ...formData,
                  id: editingDress.id,
                  isVisible: true,
                }
              : dress,
          ),
        );

        alert("Dress updated successfully!");
        resetForm();
        setActiveTab("list");
        return;
      } catch (err) {
        console.error("Unexpected update dress error:", err);
        alert("Unexpected error while updating dress.");
        return;
      }
    }

    try {
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
        .single();

      if (dressInsertError || !insertedDress) {
        console.error("Dress insert failed:", dressInsertError);
        alert(dressInsertError?.message || "Failed to create dress.");
        return;
      }

      const newDressId = String(insertedDress.id);

      const { error: imageInsertError } = await supabase
        .from("dress_images")
        .insert({
          dress_id: insertedDress.id,
          image_url: formData.image.trim(),
          is_primary: true,
        });

      if (imageInsertError) {
        console.error("Dress image insert failed:", imageInsertError);
        alert(
          `Dress created, but image insert failed: ${imageInsertError.message}`,
        );
        return;
      }

      const { data: collectionRows, error: collectionsLookupError } =
        await supabase
          .from("collections")
          .select("id, name")
          .in("name", formData.collections)
          .returns<CollectionLookupRow[]>();

      if (collectionsLookupError) {
        console.error("Collection lookup failed:", collectionsLookupError);
        alert(
          `Dress created, but collection lookup failed: ${collectionsLookupError.message}`,
        );
        return;
      }

      const collectionIds = (collectionRows || [])
        .map((row) => row.id)
        .filter(Boolean);

      if (collectionIds.length !== formData.collections.length) {
        alert(
          "Dress created, but one or more selected collections were not found in the database.",
        );
      }

      if (collectionIds.length > 0) {
        const dressCollectionRows = collectionIds.map((collectionId) => ({
          dress_id: insertedDress.id,
          collection_id: collectionId,
        }));

        const { error: dressCollectionsInsertError } = await supabase
          .from("dress_collections")
          .insert(dressCollectionRows);

        if (dressCollectionsInsertError) {
          console.error(
            "Dress collection links insert failed:",
            dressCollectionsInsertError,
          );
          alert(
            `Dress created, but collection linking failed: ${dressCollectionsInsertError.message}`,
          );
          return;
        }
      }

      try {
        await syncDressAttributes(newDressId, formData);
      } catch (err) {
        console.error("Dress attributes sync failed:", err);
        alert("Dress saved, but attributes could not be linked.");
        return;
      }

      const createdDressForUi: Dress = {
        id: newDressId,
        name: insertedDress.name ?? formData.name.trim(),
        collections: [...formData.collections],
        price: Number(insertedDress.base_price ?? formData.price),
        image: formData.image.trim(),
        sizes: [...formData.sizes],
        neckline: formData.neckline,
        silhouette: insertedDress.silhouette ?? formData.silhouette,
        fabric: formData.fabric,
        trainLength: formData.trainLength,
        sleeveStyle: formData.sleeveStyle,
        isVisible: insertedDress.status === "published",
      };

      setDresses((prev) => [createdDressForUi, ...prev]);

      setCollections((prev) => {
        const merged = new Set([...prev, ...formData.collections]);
        return Array.from(merged).sort((a, b) => a.localeCompare(b));
      });

      alert("Dress created successfully!");

      resetForm();
      setActiveTab("list");
    } catch (err) {
      console.error("Unexpected create dress error:", err);
      alert("Unexpected error while creating dress.");
    }
  };

  const handleEdit = (dress: Dress) => {
    setEditingDress(dress);
    setFormData({
      name: dress.name,
      collections: dress.collections,
      price: dress.price,
      image: dress.image,
      sizes: dress.sizes,
      neckline: dress.neckline,
      silhouette: dress.silhouette,
      fabric: dress.fabric,
      trainLength: dress.trainLength,
      sleeveStyle: dress.sleeveStyle,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this dress?")) {
      return;
    }

    try {
      const { error: dressAttributeValuesDeleteError } = await supabase
        .from("dress_attribute_values")
        .delete()
        .eq("dress_id", id);

      if (dressAttributeValuesDeleteError) {
        console.error(
          "Dress attribute values delete failed:",
          dressAttributeValuesDeleteError,
        );
        alert(
          `Failed to delete dress attributes: ${dressAttributeValuesDeleteError.message}`,
        );
        return;
      }

      const { error: dressCollectionsDeleteError } = await supabase
        .from("dress_collections")
        .delete()
        .eq("dress_id", id);

      if (dressCollectionsDeleteError) {
        console.error(
          "Dress collection links delete failed:",
          dressCollectionsDeleteError,
        );
        alert(
          `Failed to delete dress links: ${dressCollectionsDeleteError.message}`,
        );
        return;
      }

      const { error: dressImagesDeleteError } = await supabase
        .from("dress_images")
        .delete()
        .eq("dress_id", id);

      if (dressImagesDeleteError) {
        console.error("Dress images delete failed:", dressImagesDeleteError);
        alert(
          `Failed to delete dress images: ${dressImagesDeleteError.message}`,
        );
        return;
      }

      const { error: dressDeleteError } = await supabase
        .from("dresses")
        .delete()
        .eq("id", id);

      if (dressDeleteError) {
        console.error("Dress delete failed:", dressDeleteError);
        alert(`Failed to delete dress: ${dressDeleteError.message}`);
        return;
      }

      setDresses((prev) => prev.filter((dress) => dress.id !== id));
      alert("Dress deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete dress error:", err);
      alert("Unexpected error while deleting dress.");
    }
  };

  const toggleVisibility = async (id: string) => {
    const targetDress = dresses.find((dress) => dress.id === id);

    if (!targetDress) {
      alert("Dress not found.");
      return;
    }

    const nextIsVisible = !targetDress.isVisible;
    const nextStatus = nextIsVisible ? "published" : "draft";

    try {
      const { error } = await supabase
        .from("dresses")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) {
        console.error("Dress visibility update failed:", error);
        alert(`Failed to update visibility: ${error.message}`);
        return;
      }

      setDresses((prev) =>
        prev.map((dress) =>
          dress.id === id ? { ...dress, isVisible: nextIsVisible } : dress,
        ),
      );
    } catch (err) {
      console.error("Unexpected visibility update error:", err);
      alert("Unexpected error while updating visibility.");
    }
  };

  const handleAddCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      alert("Collection name cannot be empty!");
      return;
    }

    if (collections.includes(trimmedName)) {
      alert("Collection already exists!");
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        console.error("Session fetch failed:", sessionError);
        alert("Could not get current user.");
        return;
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
          .single();

      if (insertCollectionError || !insertedCollection) {
        console.error("Collection insert failed:", insertCollectionError);
        alert(insertCollectionError?.message || "Failed to create collection.");
        return;
      }

      if (selectedDressesForCollection.length > 0) {
        const dressCollectionRows = selectedDressesForCollection.map(
          (dressId) => ({
            dress_id: dressId,
            collection_id: insertedCollection.id,
          }),
        );

        const { error: linkError } = await supabase
          .from("dress_collections")
          .insert(dressCollectionRows);

        if (linkError) {
          console.error("Collection linking failed:", linkError);
          alert(`Collection created, but linking failed: ${linkError.message}`);
          return;
        }
      }

      setCollections((prev) =>
        [...prev, insertedCollection.name]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b)),
      );

      if (selectedDressesForCollection.length > 0) {
        setDresses((prev) =>
          prev.map((dress) =>
            selectedDressesForCollection.includes(dress.id) &&
            !dress.collections.includes(trimmedName)
              ? { ...dress, collections: [...dress.collections, trimmedName] }
              : dress,
          ),
        );
      }

      setNewCollectionName("");
      setSelectedDressesForCollection([]);
      setAddingCollectionMode(false);
      alert("Collection created successfully!");
    } catch (err) {
      console.error("Unexpected create collection error:", err);
      alert("Unexpected error while creating collection.");
    }
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;

    const trimmedName = editingCollection.new.trim();

    if (!trimmedName) {
      alert("Collection name cannot be empty!");
      return;
    }

    if (
      collections.includes(trimmedName) &&
      editingCollection.old !== trimmedName
    ) {
      alert("Collection name already exists!");
      return;
    }

    try {
      const { data: existingCollection, error: lookupError } = await supabase
        .from("collections")
        .select("id, name")
        .eq("name", editingCollection.old)
        .single();

      if (lookupError || !existingCollection) {
        console.error("Collection lookup failed:", lookupError);
        alert(lookupError?.message || "Failed to find collection.");
        return;
      }

      const { error: updateError } = await supabase
        .from("collections")
        .update({ name: trimmedName })
        .eq("id", existingCollection.id);

      if (updateError) {
        console.error("Collection update failed:", updateError);
        alert(`Failed to update collection: ${updateError.message}`);
        return;
      }

      if (selectedDressesForEditCollection.length > 0) {
        const linkRows = selectedDressesForEditCollection.map((dressId) => ({
          dress_id: dressId,
          collection_id: existingCollection.id,
        }));

        const { error: linkError } = await supabase
          .from("dress_collections")
          .insert(linkRows);

        if (linkError) {
          console.error("Collection link insert failed:", linkError);
          alert(`Collection renamed, but linking failed: ${linkError.message}`);
          return;
        }
      }

      setCollections((prev) =>
        prev
          .map((collection) =>
            collection === editingCollection.old ? trimmedName : collection,
          )
          .sort((a, b) => a.localeCompare(b)),
      );

      setDresses((prev) =>
        prev.map((dress) => {
          const renamedCollections = dress.collections.map((collection) =>
            collection === editingCollection.old ? trimmedName : collection,
          );

          const withAddedCollection =
            selectedDressesForEditCollection.includes(dress.id) &&
            !renamedCollections.includes(trimmedName)
              ? [...renamedCollections, trimmedName]
              : renamedCollections;

          return {
            ...dress,
            collections: withAddedCollection,
          };
        }),
      );

      setEditingCollection(null);
      setSelectedDressesForEditCollection([]);
      setShowDressSelectionForEdit(false);
      alert("Collection updated successfully!");
    } catch (err) {
      console.error("Unexpected update collection error:", err);
      alert("Unexpected error while updating collection.");
    }
  };

  const handleDeleteCollection = async (collectionName: string) => {
    const dressesInCollection = dresses.filter((dress) =>
      dress.collections.includes(collectionName),
    );

    if (dressesInCollection.length > 0) {
      const confirmed = window.confirm(
        `This collection has ${dressesInCollection.length} dress(es). Deleting will remove this collection from all dresses. Continue?`,
      );

      if (!confirmed) return;
    }

    try {
      const { data: existingCollection, error: lookupError } = await supabase
        .from("collections")
        .select("id, name")
        .eq("name", collectionName)
        .single();

      if (lookupError || !existingCollection) {
        console.error("Collection lookup failed:", lookupError);
        alert(lookupError?.message || "Failed to find collection.");
        return;
      }

      const { error: unlinkError } = await supabase
        .from("dress_collections")
        .delete()
        .eq("collection_id", existingCollection.id);

      if (unlinkError) {
        console.error("Collection unlink failed:", unlinkError);
        alert(`Failed to unlink dresses: ${unlinkError.message}`);
        return;
      }

      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .eq("id", existingCollection.id);

      if (deleteError) {
        console.error("Collection delete failed:", deleteError);
        alert(`Failed to delete collection: ${deleteError.message}`);
        return;
      }

      setCollections((prev) =>
        prev.filter((collection) => collection !== collectionName),
      );

      setDresses((prev) =>
        prev.map((dress) => ({
          ...dress,
          collections: dress.collections.filter(
            (collection) => collection !== collectionName,
          ),
        })),
      );

      alert("Collection deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete collection error:", err);
      alert("Unexpected error while deleting collection.");
    }
  };

  const toggleDressForCollection = (dressId: string) => {
    setSelectedDressesForCollection((prev) =>
      prev.includes(dressId)
        ? prev.filter((id) => id !== dressId)
        : [...prev, dressId],
    );
  };

  const toggleDressForEditCollection = (dressId: string) => {
    setSelectedDressesForEditCollection((prev) =>
      prev.includes(dressId)
        ? prev.filter((id) => id !== dressId)
        : [...prev, dressId],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <AdminPageHeader />

          <AdminTabs
            activeTab={activeTab}
            dressesCount={dresses.length}
            isEditingDress={!!editingDress}
            onListClick={() => {
              setActiveTab("list");
              resetForm();
            }}
            onAddClick={() => {
              setActiveTab("add");
              resetForm();
            }}
            onCollectionsClick={() => setActiveTab("collections")}
          />
        </div>

        {loadingInitialData ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12 text-center">
            <p className="text-stone-600">Loading admin data...</p>
          </div>
        ) : initialDataError ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12 text-center">
            <p className="text-red-600">Error: {initialDataError}</p>
          </div>
        ) : (
          <>
            {activeTab === "list" && (
              <AdminDressListTab
                dresses={dresses}
                onAddDress={() => setActiveTab("add")}
                onToggleVisibility={toggleVisibility}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {activeTab === "add" && (
              <AdminDressFormTab
                formData={formData}
                collections={collections}
                dragActive={dragActive}
                fileInputRef={fileInputRef}
                availableSizes={availableSizes}
                necklines={necklines}
                silhouettes={silhouettes}
                fabrics={fabrics}
                trainLengths={trainLengths}
                sleeveStyles={sleeveStyles}
                isEditingDress={!!editingDress}
                onSubmit={handleSubmit}
                onCancel={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                onNameChange={(value) =>
                  setFormData((prev) => ({ ...prev, name: value }))
                }
                onCollectionToggle={handleCollectionToggle}
                onPriceChange={(value) =>
                  setFormData((prev) => ({ ...prev, price: value }))
                }
                onImageChange={(value) =>
                  setFormData((prev) => ({ ...prev, image: value }))
                }
                onSizeToggle={handleSizeToggle}
                onNecklineChange={(value) =>
                  setFormData((prev) => ({ ...prev, neckline: value }))
                }
                onSilhouetteChange={(value) =>
                  setFormData((prev) => ({ ...prev, silhouette: value }))
                }
                onFabricChange={(value) =>
                  setFormData((prev) => ({ ...prev, fabric: value }))
                }
                onTrainLengthChange={(value) =>
                  setFormData((prev) => ({ ...prev, trainLength: value }))
                }
                onSleeveStyleChange={(value) =>
                  setFormData((prev) => ({ ...prev, sleeveStyle: value }))
                }
                onDrag={handleDrag}
                onDrop={handleDrop}
                onFileInputChange={handleFileInput}
              />
            )}

            {activeTab === "collections" && (
              <AdminCollectionsTab
                collections={collections}
                dresses={dresses}
                newCollectionName={newCollectionName}
                editingCollection={editingCollection}
                addingCollectionMode={addingCollectionMode}
                selectedDressesForCollection={selectedDressesForCollection}
                selectedDressesForEditCollection={
                  selectedDressesForEditCollection
                }
                showDressSelectionForEdit={showDressSelectionForEdit}
                onNewCollectionNameChange={setNewCollectionName}
                onToggleAddingCollectionMode={() =>
                  setAddingCollectionMode((prev) => !prev)
                }
                onAddCollection={handleAddCollection}
                onStartEditingCollection={(collectionName) =>
                  setEditingCollection({
                    old: collectionName,
                    new: collectionName,
                  })
                }
                onEditingCollectionNameChange={(value) =>
                  setEditingCollection((prev) =>
                    prev ? { ...prev, new: value } : prev,
                  )
                }
                onToggleShowDressSelectionForEdit={() =>
                  setShowDressSelectionForEdit((prev) => !prev)
                }
                onUpdateCollection={handleUpdateCollection}
                onCancelEditCollection={() => {
                  setEditingCollection(null);
                  setShowDressSelectionForEdit(false);
                  setSelectedDressesForEditCollection([]);
                }}
                onDeleteCollection={handleDeleteCollection}
                onToggleDressForCollection={toggleDressForCollection}
                onToggleDressForEditCollection={toggleDressForEditCollection}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
