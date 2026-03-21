import { useEffect, useState, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { useRole, useSession } from "../routes";
import { sizes } from "../data/galleryFilters";
import type { Dress } from "../types/dress";

import Header from "../components/common/Header";
import GalleryFilters from "../components/gallery/GalleryFilters";
import DressCard from "../components/gallery/DressCard";
import DressDetailsModal from "../components/gallery/DressDetailsModal";
import DressContextMenu from "../components/gallery/DressContextMenu";
import RentModal from "../components/gallery/RentModal";
import { useGalleryData } from "../hooks/gallery/useGalleryData";
import { useGalleryFavorites } from "../hooks/gallery/useGalleryFavorites";

export default function GalleryPage() {
  const [searchParams] = useSearchParams();

  const role    = useRole();
  const session = useSession();
  const isAdmin = role === "admin";

  // ── Data from custom hooks ───────────────────────────────
  const {
    allCollections,
    allDresses,
    allNecklines,
    allSilhouettes,
    allFabrics,
    allTrainLengths,
    allSleeveStyles,
    loading,
    error,
  } = useGalleryData();

  const { favoriteDressIds, toggleFavorite } = useGalleryFavorites(isAdmin, session);

  const visibleBaseDresses = isAdmin
    ? allDresses
    : allDresses.filter((d) => d.isVisible);

  // ── Selected filters ─────────────────────────────────────
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedSize,        setSelectedSize]        = useState<number | null>(null);
  const [selectedNeckline,    setSelectedNeckline]    = useState("All");
  const [selectedSilhouette,  setSelectedSilhouette]  = useState("All");
  const [selectedFabric,      setSelectedFabric]      = useState("All");
  const [selectedTrainLength, setSelectedTrainLength] = useState("All");
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState("All");
  const [showFilters,         setShowFilters]         = useState(false);

  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [rentDress, setRentDress] = useState<Dress | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean; x: number; y: number; dress: Dress | null;
  }>({ visible: false, x: 0, y: 0, dress: null });

  // ── Sync collection filter with URL params ───────────────
  useEffect(() => {
    const collectionFromUrl = searchParams.get("collection");
    if (collectionFromUrl) {
      setSelectedCollections([collectionFromUrl]);
    } else {
      setSelectedCollections([]);
    }
  }, [searchParams]);

  const toggleCollection = (collection: string) => {
    if (collection === "All") { setSelectedCollections([]); return; }
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection]
    );
  };

  // ── Filter logic ─────────────────────────────────────────
  const filteredDresses = visibleBaseDresses.filter((dress) => {
    if (selectedCollections.length > 0 &&
      !dress.collections.some((c) => selectedCollections.includes(c)))
      return false;
    if (selectedSize !== null && !dress.sizes.includes(selectedSize))
      return false;
    if (selectedNeckline !== "All" && dress.neckline && dress.neckline !== selectedNeckline)
      return false;
    if (selectedSilhouette !== "All" && dress.silhouette && dress.silhouette !== selectedSilhouette)
      return false;
    if (selectedFabric !== "All" && dress.fabric && dress.fabric !== selectedFabric)
      return false;
    if (selectedTrainLength !== "All" && dress.trainLength && dress.trainLength !== selectedTrainLength)
      return false;
    if (selectedSleeveStyle !== "All" && dress.sleeveStyle && dress.sleeveStyle !== selectedSleeveStyle)
      return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedCollections([]);
    setSelectedSize(null);
    setSelectedNeckline("All");
    setSelectedSilhouette("All");
    setSelectedFabric("All");
    setSelectedTrainLength("All");
    setSelectedSleeveStyle("All");
  };

  const handleClickOutside = () =>
    setContextMenu({ visible: false, x: 0, y: 0, dress: null });

  const handleRightClick = (e: MouseEvent, dress: Dress) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, dress });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
      onClick={handleClickOutside}
    >
      <Header subtitle="Gallery Collection" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100 mb-2">Our Collection</h1>
            <p className="text-stone-600 dark:text-stone-300">
              {loading ? "Loading gowns..." : `${filteredDresses.length} gowns available`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-50/50 dark:hover:bg-stone-700/50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <GalleryFilters
            showFilters={showFilters}
            selectedCollections={selectedCollections}
            selectedSize={selectedSize}
            selectedNeckline={selectedNeckline}
            selectedSilhouette={selectedSilhouette}
            selectedFabric={selectedFabric}
            selectedTrainLength={selectedTrainLength}
            selectedSleeveStyle={selectedSleeveStyle}
            collections={allCollections}
            sizes={sizes}
            necklines={allNecklines}
            silhouettes={allSilhouettes}
            fabrics={allFabrics}
            trainLengths={allTrainLengths}
            sleeveStyles={allSleeveStyles}
            onCollectionToggle={toggleCollection}
            onSizeChange={setSelectedSize}
            onNecklineChange={setSelectedNeckline}
            onSilhouetteChange={setSelectedSilhouette}
            onFabricChange={setSelectedFabric}
            onTrainLengthChange={setSelectedTrainLength}
            onSleeveStyleChange={setSelectedSleeveStyle}
            onClearFilters={clearFilters}
          />

          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-stone-200/50">
                <p className="text-stone-600">Loading dresses...</p>
              </div>
            ) : error ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-stone-200/50">
                <p className="text-red-600 mb-4">Error: {error}</p>
              </div>
            ) : filteredDresses.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-stone-200/50">
                <p className="text-stone-600 mb-4">No gowns match your filters</p>
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
                    isAdmin={isAdmin}
                    isFavorite={favoriteDressIds.includes(dress.id)}
                    onToggleFavorite={toggleFavorite}
                    onRequestRent={setRentDress}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDress && (
        <DressDetailsModal
          dress={selectedDress}
          onClose={() => setSelectedDress(null)}
        />
      )}

      {rentDress && (
        <RentModal
          dress={{
            id: String(rentDress.id),
            name: rentDress.name,
            sizes:
              rentDress.sizes?.length > 0
                ? `${rentDress.sizes[0]}-${rentDress.sizes[rentDress.sizes.length - 1]}`
                : undefined,
          }}
          onClose={() => setRentDress(null)}
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
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, dress: null })}
      />
    </div>
  );
}