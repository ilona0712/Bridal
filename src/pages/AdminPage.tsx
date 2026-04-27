import { useState, type FormEvent } from "react";
import Header from "../components/common/Header";
import AdminCollectionsTab from "../components/admin/AdminCollectionsTab";
import AdminDressFormTab from "../components/admin/AdminDressFormTab";
import AdminDressListTab from "../components/admin/AdminDressListTab";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminTabs from "../components/admin/AdminTabs";
import { useAdminDressForm } from "../hooks/admin/useAdminDressForm";
import AdminSiteSettingsTab from "../components/admin/AdminSiteSettingsTab";
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";
import type {
  ActiveTab,
  AdminCollection,
  EditingCollection,
} from "../types/admin";
import type { Dress } from "../types/dress";
import { useAdminData } from "../hooks/admin/useAdminData";
import { ADMIN_DRESS_FORM_OPTIONS } from "../utils/admin/adminDressFormConfig";
import {
  createDress,
  deleteDressById,
  updateDress,
  updateDressVisibility,
} from "../services/admin/adminDressService";
import {
  createCollection,
  deleteCollectionById,
  updateCollection,
  setCollectionIsActive,
} from "../services/admin/adminCollectionService";
import { sendPushNotification } from "../services/pushNotificationService";

export default function AdminPage() {
  const { toasts, showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionNameError, setCollectionNameError] = useState("");
  const normalizeCollectionName = (value: string) => value.trim().toLowerCase();
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
  const {
    formData,
    setFormData,
    dragActive,
    fileInputRef,
    imageFiles,
    handleSizeToggle,
    handleCollectionToggle,
    resetForm,
    handleDrag,
    handleDrop,
    handleFileInput,
    reorderImages,
    removeImage,
    startEditingDress,
  } = useAdminDressForm((msg) => showToast(msg, "error"));
  const { availableSizes } = ADMIN_DRESS_FORM_OPTIONS;

  const {
    dresses,
    setDresses,
    collections,
    setCollections,
    necklines,
    silhouettes,
    fabrics,
    trainLengths,
    sleeveStyles,
    loadingInitialData,
    initialDataError,
  } = useAdminData();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Dress name is required!", "error");
      return;
    }

    if (formData.images.length === 0) {
      showToast("At least one image is required!", "error");
      return;
    }

    setIsSubmitting(true);

    if (editingDress) {
      try {
        const result = await updateDress(editingDress.id, formData, imageFiles);
        const updatedDress = result.dress;

        setDresses((prev) =>
          prev.map((dress) =>
            dress.id === editingDress.id
              ? {
                  ...dress,
                  ...formData,
                  id: editingDress.id,
                  name: updatedDress.name ?? formData.name.trim(),
                  image: result.imageUrls[0] || formData.image,
                  images: [...result.imageUrls],
                  price: Number(updatedDress.base_price ?? formData.price ?? 0),
                  silhouette: formData.silhouette,
                  isVisible: updatedDress.status === "published",
                }
              : dress,
          ),
        );

        showToast("Dress updated successfully!");
        resetForm();
        setEditingDress(null);
        setActiveTab("list");
      } catch (err) {
        console.error("Unexpected update dress error:", err);
        showToast(
          err instanceof Error ? err.message : "Unexpected error while updating dress.",
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const result = await createDress(formData, imageFiles);
      const insertedDress = result.dress;
      const newDressId = String(insertedDress.id);

      const createdDressForUi: Dress = {
        id: newDressId,
        name: insertedDress.name ?? formData.name.trim(),
        collections: [...formData.collections],
        price: Number(insertedDress.base_price ?? formData.price ?? 0),
        image: result.imageUrls[0] || formData.image.trim(),
        images: [...result.imageUrls],
        sizes: [...formData.sizes],
        neckline: formData.neckline,
        silhouette: formData.silhouette,
        fabric: formData.fabric,
        trainLength: formData.trainLength,
        sleeveStyle: formData.sleeveStyle,
        isVisible: insertedDress.status === "published",
      };

      setDresses((prev) => [createdDressForUi, ...prev]);

      showToast("Dress created successfully!");

      resetForm();
      setEditingDress(null);
      setActiveTab("list");
    } catch (err) {
      console.error("Unexpected create dress error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while creating dress.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (dress: Dress) => {
    setEditingDress(dress);
    startEditingDress(dress);
    setActiveTab("add");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDressById(id);
      setDresses((prev) => prev.filter((dress) => dress.id !== id));
      showToast("Dress deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete dress error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while deleting dress.",
        "error",
      );
    }
  };

  const toggleVisibility = async (id: string) => {
    const targetDress = dresses.find((dress) => dress.id === id);

    if (!targetDress) {
      showToast("Dress not found.", "error");
      return;
    }

    const nextIsVisible = !targetDress.isVisible;

    try {
      await updateDressVisibility(id, nextIsVisible);

      setDresses((prev) =>
        prev.map((dress) =>
          dress.id === id ? { ...dress, isVisible: nextIsVisible } : dress,
        ),
      );
    } catch (err) {
      console.error("Unexpected visibility update error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while updating visibility.",
        "error",
      );
    }
  };

  const handleAddCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      showToast("Collection name cannot be empty!", "error");
      return;
    }

    const nameAlreadyExists = collections.some(
      (collection) =>
        normalizeCollectionName(collection.name) ===
        normalizeCollectionName(trimmedName),
    );

    if (nameAlreadyExists) {
      setCollectionNameError("Collection name already exists.");
      return;
    }
    setCollectionNameError("");
    try {
      const insertedCollection = await createCollection(
        trimmedName,
        selectedDressesForCollection,
      );

      setCollections((prev) =>
        [...prev, insertedCollection].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
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
      void sendPushNotification({
        type: "collection_published",
        collectionId: insertedCollection.id,
        collectionName: insertedCollection.name,
      });
      showToast("Collection created successfully!");
    } catch (err) {
      console.error("Unexpected create collection error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while creating collection.",
        "error",
      );
    }
    setCollectionNameError("");
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;

    const trimmedName = editingCollection.newName.trim();

    if (!trimmedName) {
      showToast("Collection name cannot be empty!", "error");
      return;
    }

    const nameAlreadyExists = collections.some(
      (collection) =>
        collection.id !== editingCollection.id &&
        normalizeCollectionName(collection.name) ===
          normalizeCollectionName(trimmedName),
    );

    if (nameAlreadyExists) {
      setCollectionNameError("Collection name already exists.");
      return;
    }
    setCollectionNameError("");
    try {
      await updateCollection(
        editingCollection.id,
        trimmedName,
        selectedDressesForEditCollection,
      );

      setCollections((prev) =>
        prev
          .map((collection) =>
            collection.id === editingCollection.id
              ? { ...collection, name: trimmedName }
              : collection,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      setDresses((prev) =>
        prev.map((dress) => {
          const collectionsWithoutThis = dress.collections.filter(
            (c) => c !== editingCollection.oldName && c !== trimmedName,
          );
          const updatedCollections = selectedDressesForEditCollection.includes(
            dress.id,
          )
            ? [...collectionsWithoutThis, trimmedName]
            : collectionsWithoutThis;

          return { ...dress, collections: updatedCollections };
        }),
      );

      setEditingCollection(null);
      setSelectedDressesForEditCollection([]);
      showToast("Collection updated successfully!");
    } catch (err) {
      console.error("Unexpected update collection error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while updating collection.",
        "error",
      );
    }
  };

  const handleDeleteCollection = async (collection: AdminCollection) => {
    try {
      await deleteCollectionById(collection.id);

      setCollections((prev) =>
        prev.filter((item) => item.id !== collection.id),
      );

      setDresses((prev) =>
        prev.map((dress) => ({
          ...dress,
          collections: dress.collections.filter(
            (collectionName) => collectionName !== collection.name,
          ),
        })),
      );

      showToast("Collection deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete collection error:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while deleting collection.",
        "error",
      );
    }
  };

  const MAX_HOMEPAGE_COLLECTIONS = 6;

  const handleToggleHomepage = async (collection: AdminCollection) => {
    const nextIsActive = !collection.isActive;

    if (nextIsActive) {
      const currentlyActive = collections.filter((c) => c.isActive).length;
      if (currentlyActive >= MAX_HOMEPAGE_COLLECTIONS) {
        showToast(
          `You can show at most ${MAX_HOMEPAGE_COLLECTIONS} collections on the homepage. Please hide another collection first.`,
          "error",
        );
        return;
      }
    }

    try {
      await setCollectionIsActive(collection.id, nextIsActive);
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collection.id ? { ...c, isActive: nextIsActive } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle homepage visibility:", err);
      showToast(
        err instanceof Error ? err.message : "Unexpected error while updating homepage visibility.",
        "error",
      );
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Toast toasts={toasts} />
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
              setEditingDress(null);
            }}
            onAddClick={() => {
              setActiveTab("add");
              resetForm();
              setEditingDress(null);
            }}
            onCollectionsClick={() => setActiveTab("collections")}
            onSettingsClick={() => setActiveTab("settings")}
          />
        </div>

        {loadingInitialData ? (
          <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
            <p className="text-stone-600 dark:text-stone-300">Loading admin data...</p>
          </div>
        ) : initialDataError ? (
          <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
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
                collections={collections.map((collection) => collection.name)}
                dragActive={dragActive}
                fileInputRef={fileInputRef}
                availableSizes={availableSizes}
                necklines={necklines}
                silhouettes={silhouettes}
                fabrics={fabrics}
                trainLengths={trainLengths}
                sleeveStyles={sleeveStyles}
                isEditingDress={!!editingDress}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => {
                  resetForm();
                  setEditingDress(null);
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
                onRemoveImage={removeImage}
                onReorderImages={reorderImages}
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
                collectionNameError={collectionNameError}
                dresses={dresses}
                newCollectionName={newCollectionName}
                editingCollection={editingCollection}
                addingCollectionMode={addingCollectionMode}
                selectedDressesForCollection={selectedDressesForCollection}
                selectedDressesForEditCollection={
                  selectedDressesForEditCollection
                }
                onNewCollectionNameChange={(value) => {
                  setNewCollectionName(value);
                  setCollectionNameError("");
                }}
                onToggleAddingCollectionMode={() =>
                  setAddingCollectionMode((prev) => !prev)
                }
                onAddCollection={handleAddCollection}
                onStartEditingCollection={(collection) => {
                  setCollectionNameError("");
                  setEditingCollection({
                    id: collection.id,
                    oldName: collection.name,
                    newName: collection.name,
                  });
                  const dressesInCollection = dresses
                    .filter((d) => d.collections.includes(collection.name))
                    .map((d) => d.id);
                  setSelectedDressesForEditCollection(dressesInCollection);
                }}
                onEditingCollectionNameChange={(value) => {
                  setEditingCollection((prev) =>
                    prev ? { ...prev, newName: value } : prev,
                  );
                  setCollectionNameError("");
                }}
                onUpdateCollection={handleUpdateCollection}
                onCancelEditCollection={() => {
                  setCollectionNameError("");
                  setEditingCollection(null);
                  setSelectedDressesForEditCollection([]);
                }}
                onDeleteCollection={handleDeleteCollection}
                onToggleHomepage={handleToggleHomepage}
                onToggleDressForCollection={toggleDressForCollection}
                onToggleDressForEditCollection={toggleDressForEditCollection}
              />
            )}
            {activeTab === "settings" && (
              <AdminSiteSettingsTab />
            )}
          </>
        )}
      </div>
    </div>
  );
}
