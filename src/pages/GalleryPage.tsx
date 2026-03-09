import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, SlidersHorizontal } from "lucide-react";
//hide/show + deleting dresses feature imports
import { dresses as initialDresses } from "../data/dresses";
import { isAdmin } from "../auth";
/////////////////////////////////////
import {
  collections,
  sizes,
  necklines,
  silhouettes,
  fabrics,
  trainLengths,
  sleeveStyles,
} from "../data/galleryFilters";
import type { Dress } from "../types/dress";

import Header from "../components/common/Header";
import GalleryFilters from "../components/gallery/GalleryFilters";
import DressCard from "../components/gallery/DressCard";
import DressDetailsModal from "../components/gallery/DressDetailsModal";
import DressContextMenu from "../components/gallery/DressContextMenu";
import CreateCollectionModal from "../components/gallery/CreateCollectionModal";

export default function GalleryPage() {
  //creating state for 'create collection' feature
  const [allCollections, setAllCollections] = useState<string[]>(collections);
  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);
  //creating state for dresses for hide/show + deleting dresses feature
  const [allDresses, setAllDresses] = useState<Dress[]>(initialDresses);
  const visibleBaseDresses = isAdmin
    ? allDresses
    : allDresses.filter((dress) => dress.isVisible);
  ///////////////////////
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedNeckline, setSelectedNeckline] = useState("All");
  const [selectedSilhouette, setSelectedSilhouette] = useState("All");
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [selectedTrainLength, setSelectedTrainLength] = useState("All");
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dress: Dress | null;
  }>({ visible: false, x: 0, y: 0, dress: null });

  const handleClickOutside = () => {
    setContextMenu({ visible: false, x: 0, y: 0, dress: null });
  };

  const handleRightClick = (e: React.MouseEvent, dress: Dress) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      dress,
    });
  };
  //filtering from visibleBaseDresses instead of dresses
  const filteredDresses = visibleBaseDresses.filter((dress) => {
    if (
      selectedCollection !== "All" &&
      !dress.collections.includes(selectedCollection)
    )
      return false;
    if (selectedSize !== null && !dress.sizes.includes(selectedSize))
      return false;
    if (selectedNeckline !== "All" && dress.neckline !== selectedNeckline)
      return false;
    if (selectedSilhouette !== "All" && dress.silhouette !== selectedSilhouette)
      return false;
    if (selectedFabric !== "All" && dress.fabric !== selectedFabric)
      return false;
    if (
      selectedTrainLength !== "All" &&
      dress.trainLength !== selectedTrainLength
    )
      return false;
    if (
      selectedSleeveStyle !== "All" &&
      dress.sleeveStyle !== selectedSleeveStyle
    )
      return false;
    return true;
  });

  //2 custom functions for hide/show + deleting feature
  const toggleDressVisibility = (dressId: number) => {
    setAllDresses((prev) =>
      prev.map((dress) =>
        dress.id === dressId
          ? { ...dress, isVisible: !dress.isVisible }
          : dress,
      ),
    );
  };

  const deleteDress = (dressId: number) => {
    setAllDresses((prev) => prev.filter((dress) => dress.id !== dressId));

    if (selectedDress?.id === dressId) {
      setSelectedDress(null);
    }

    if (contextMenu.dress?.id === dressId) {
      setContextMenu({ visible: false, x: 0, y: 0, dress: null });
    }
  };
  //3 custom functions for creating collections
  const addCollection = (newCollectionName: string) => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;

    setAllCollections((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  };

  const addDressToCollection = (dressId: number, collectionName: string) => {
    setAllDresses((prev) =>
      prev.map((dress) =>
        dress.id === dressId && !dress.collections.includes(collectionName)
          ? { ...dress, collections: [...dress.collections, collectionName] }
          : dress,
      ),
    );
  };

  const createCollection = (name: string, selectedDressIds: number[]) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setAllCollections((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );

    setAllDresses((prev) =>
      prev.map((dress) =>
        selectedDressIds.includes(dress.id) &&
        !dress.collections.includes(trimmed)
          ? { ...dress, collections: [...dress.collections, trimmed] }
          : dress,
      ),
    );
  };

  const removeDressFromCollection = (
    dressId: number,
    collectionName: string,
  ) => {
    setAllDresses((prev) =>
      prev.map((dress) =>
        dress.id === dressId
          ? {
              ...dress,
              collections: dress.collections.filter(
                (name) => name !== collectionName,
              ),
            }
          : dress,
      ),
    );
  };

  const clearFilters = () => {
    setSelectedCollection("All");
    setSelectedSize(null);
    setSelectedNeckline("All");
    setSelectedSilhouette("All");
    setSelectedFabric("All");
    setSelectedTrainLength("All");
    setSelectedSleeveStyle("All");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
      onClick={handleClickOutside}
    >
      <Header subtitle="Gallery Collection" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl text-stone-800 mb-2">
              Our Collection
            </h1>
            <p className="text-stone-600">
              {filteredDresses.length} gowns available
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateCollectionModal(true)}
              className="px-4 py-2 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all"
            >
              Add a new collection
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/60 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50/50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <GalleryFilters
            showFilters={showFilters}
            selectedCollection={selectedCollection}
            selectedSize={selectedSize}
            selectedNeckline={selectedNeckline}
            selectedSilhouette={selectedSilhouette}
            selectedFabric={selectedFabric}
            selectedTrainLength={selectedTrainLength}
            selectedSleeveStyle={selectedSleeveStyle}
            collections={allCollections}
            sizes={sizes}
            necklines={necklines}
            silhouettes={silhouettes}
            fabrics={fabrics}
            trainLengths={trainLengths}
            sleeveStyles={sleeveStyles}
            onCollectionChange={setSelectedCollection}
            onSizeChange={setSelectedSize}
            onNecklineChange={setSelectedNeckline}
            onSilhouetteChange={setSelectedSilhouette}
            onFabricChange={setSelectedFabric}
            onTrainLengthChange={setSelectedTrainLength}
            onSleeveStyleChange={setSelectedSleeveStyle}
            onClearFilters={clearFilters}
          />

          <div className="lg:col-span-3">
            {filteredDresses.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-stone-200/50">
                <p className="text-stone-600 mb-4">
                  No gowns match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDresses.map((dress) => (
                  <DressCard
                    key={dress.id}
                    dress={dress}
                    onViewDetails={setSelectedDress}
                    onRightClick={handleRightClick}
                    isAdmin={isAdmin} //added for hide/show + deleting dress feature
                    onToggleVisibility={toggleDressVisibility} //added for hide/show + deleting dress feature
                    onDelete={deleteDress} //added for hide/show + deleting dress feature
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateCollectionModal && (
        <CreateCollectionModal
          dresses={allDresses}
          existingCollections={allCollections}
          onClose={() => setShowCreateCollectionModal(false)}
          onCreateCollection={createCollection}
        />
      )}
      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          onClose={() => setSelectedDress(null)}
        />
      )}

      <Link
        to="/isabella"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Sparkles className="w-7 h-7 text-stone-700" />
      </Link>

      <DressContextMenu
        contextMenu={contextMenu}
        onViewDetails={setSelectedDress}
        onClose={() =>
          setContextMenu({ visible: false, x: 0, y: 0, dress: null })
        }
      />
    </div>
  );
}
