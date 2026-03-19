import { useState, type FormEvent } from "react";
import Header from "../components/common/Header";
import AdminCollectionsTab from "../components/admin/AdminCollectionsTab";
import AdminDressFormTab from "../components/admin/AdminDressFormTab";
import AdminDressListTab from "../components/admin/AdminDressListTab";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminTabs from "../components/admin/AdminTabs";
import { useAdminDressForm } from "../hooks/admin/useAdminDressForm";
import AdminSiteSettingsTab from "../components/admin/AdminSiteSettingsTab"
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
} from "../services/admin/adminCollectionService";

export default function AdminPage() {
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
  } = useAdminDressForm();
  const {
    necklines,
    silhouettes,
    fabrics,
    trainLengths,
    sleeveStyles,
    availableSizes,
  } = ADMIN_DRESS_FORM_OPTIONS;

  const {
    dresses,
    setDresses,
    collections,
    setCollections,
    loadingInitialData,
    initialDataError,
  } = useAdminData();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Dress name is required!");
      return;
    }

    if (formData.images.length === 0) {
      alert("At least one image is required!");
      return;
    }

    if (formData.collections.length === 0) {
      alert("Please select at least one collection!");
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
                  silhouette: updatedDress.silhouette ?? formData.silhouette,
                  isVisible: updatedDress.status === "published",
                }
              : dress,
          ),
        );

        alert("Dress updated successfully!");
        resetForm();
        setEditingDress(null);
        setActiveTab("list");
      } catch (err) {
        console.error("Unexpected update dress error:", err);
        alert(
          err instanceof Error
            ? err.message
            : "Unexpected error while updating dress.",
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
        silhouette: insertedDress.silhouette ?? formData.silhouette,
        fabric: formData.fabric,
        trainLength: formData.trainLength,
        sleeveStyle: formData.sleeveStyle,
        isVisible: insertedDress.status === "published",
      };

      setDresses((prev) => [createdDressForUi, ...prev]);

      alert("Dress created successfully!");

      resetForm();
      setEditingDress(null);
      setActiveTab("list");
    } catch (err) {
      console.error("Unexpected create dress error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while creating dress.",
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
    if (!window.confirm("Are you sure you want to delete this dress?")) {
      return;
    }

    try {
      await deleteDressById(id);
      setDresses((prev) => prev.filter((dress) => dress.id !== id));
      alert("Dress deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete dress error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while deleting dress.",
      );
    }
  };

  const toggleVisibility = async (id: string) => {
    const targetDress = dresses.find((dress) => dress.id === id);

    if (!targetDress) {
      alert("Dress not found.");
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
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while updating visibility.",
      );
    }
  };

  const handleAddCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      alert("Collection name cannot be empty!");
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
      alert("Collection created successfully!");
    } catch (err) {
      console.error("Unexpected create collection error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while creating collection.",
      );
    }
    setCollectionNameError("");
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;

    const trimmedName = editingCollection.newName.trim();

    if (!trimmedName) {
      alert("Collection name cannot be empty!");
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
      alert("Collection updated successfully!");
    } catch (err) {
      console.error("Unexpected update collection error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while updating collection.",
      );
    }
  };

  const handleDeleteCollection = async (collection: AdminCollection) => {
    const dressesInCollection = dresses.filter((dress) =>
      dress.collections.includes(collection.name),
    );

    if (dressesInCollection.length > 0) {
      const confirmed = window.confirm(
        `This collection has ${dressesInCollection.length} dress(es). Deleting will remove this collection from all dresses. Continue?`,
      );

      if (!confirmed) return;
    }

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

      alert("Collection deleted successfully!");
    } catch (err) {
      console.error("Unexpected delete collection error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unexpected error while deleting collection.",
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
