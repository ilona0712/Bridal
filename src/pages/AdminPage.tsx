import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
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
import { adminMockDresses } from "../data/adminMockDresses";



export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  const [dresses, setDresses] = useState<Dress[]>(() => {
    const saved = localStorage.getItem("brideMeUpDresses");
    if (!saved) return adminMockDresses;

    const parsed = JSON.parse(saved);

    return parsed.map((dress: any) => ({
      ...dress,
      id: String(dress.id),
      price: Number(dress.price ?? 0),
      collections: Array.isArray(dress.collections)
        ? dress.collections
        : dress.collection
          ? [dress.collection]
          : [],
      isVisible:
        typeof dress.isVisible === "boolean"
          ? dress.isVisible
          : typeof dress.visible === "boolean"
            ? dress.visible
            : true,
    }));
  });

  const [collections, setCollections] = useState<string[]>(() => {
    const saved = localStorage.getItem("brideMeUpCollections");
    return saved
      ? JSON.parse(saved)
      : [
          "Classic Romance",
          "Royal Collection",
          "Contemporary",
          "Boho Chic",
          "Vintage Collection",
        ];
  });

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

  const necklines = [
    "Sweetheart",
    "Off-Shoulder",
    "V-Neck",
    "Halter",
    "Square",
    "Illusion",
    "Scoop",
    "Bateau",
    "Jewel",
  ];

  const silhouettes = [
    "A-Line",
    "Ball Gown",
    "Mermaid",
    "Sheath",
    "Fit & Flare",
    "Empire",
    "Trumpet",
  ];

  const fabrics = [
    "Lace",
    "Satin",
    "Crepe",
    "Chiffon",
    "Tulle",
    "Organza",
    "Mikado",
    "Silk",
    "Taffeta",
  ];

  const trainLengths = [
    "No Train",
    "Sweep",
    "Court",
    "Chapel",
    "Cathedral",
    "Royal",
    "Monarch",
  ];

  const sleeveStyles = [
    "Sleeveless",
    "Cap Sleeve",
    "Short Sleeve",
    "Long Sleeve",
    "Three-Quarter",
    "Off-Shoulder",
    "Bell Sleeve",
  ];

  const availableSizes = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

  useEffect(() => {
    localStorage.setItem("brideMeUpDresses", JSON.stringify(dresses));
  }, [dresses]);

  useEffect(() => {
    localStorage.setItem("brideMeUpCollections", JSON.stringify(collections));
  }, [collections]);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      setDresses((prev) =>
        prev.map((dress) =>
          dress.id === editingDress.id
            ? {
                ...dress,
                ...formData,
              }
            : dress,
        ),
      );
      alert("Dress updated successfully!");
    } else {
      const newDress: Dress = {
        id: crypto.randomUUID(),
        ...formData,
        isVisible: true,
      };

      setDresses((prev) => [...prev, newDress]);
      alert("Dress added successfully!");
    }

    resetForm();
    setActiveTab("list");
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this dress?")) {
      setDresses((prev) => prev.filter((dress) => dress.id !== id));
      alert("Dress deleted successfully!");
    }
  };

  const toggleVisibility = (id: string) => {
    setDresses((prev) =>
      prev.map((dress) =>
        dress.id === id ? { ...dress, isVisible: !dress.isVisible } : dress,
      ),
    );
  };

  const handleAddCollection = () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      alert("Collection name cannot be empty!");
      return;
    }

    if (collections.includes(trimmedName)) {
      alert("Collection already exists!");
      return;
    }

    setCollections((prev) => [...prev, trimmedName]);

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
    alert("Collection added successfully!");
  };

  const handleUpdateCollection = () => {
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

    setCollections((prev) =>
      prev.map((collection) =>
        collection === editingCollection.old ? trimmedName : collection,
      ),
    );

    setDresses((prev) =>
      prev.map((dress) => ({
        ...dress,
        collections: dress.collections.map((collection) =>
          collection === editingCollection.old ? trimmedName : collection,
        ),
      })),
    );

    if (selectedDressesForEditCollection.length > 0) {
      setDresses((prev) =>
        prev.map((dress) =>
          selectedDressesForEditCollection.includes(dress.id) &&
          !dress.collections.includes(trimmedName)
            ? { ...dress, collections: [...dress.collections, trimmedName] }
            : dress,
        ),
      );
    }

    setEditingCollection(null);
    setSelectedDressesForEditCollection([]);
    setShowDressSelectionForEdit(false);
    alert("Collection updated successfully!");
  };

  const handleDeleteCollection = (collectionName: string) => {
    const dressesInCollection = dresses.filter((dress) =>
      dress.collections.includes(collectionName),
    );

    if (dressesInCollection.length > 0) {
      const confirmed = window.confirm(
        `This collection has ${dressesInCollection.length} dress(es). Deleting will remove this collection from all dresses. Continue?`,
      );

      if (!confirmed) return;
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
            selectedDressesForEditCollection={selectedDressesForEditCollection}
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
      </div>
    </div>
  );
}
