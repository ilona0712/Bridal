import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useRole } from "../routes";
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

type GalleryDressRow = {
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

export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const [allCollections, setAllCollections] = useState<string[]>(collections);

  const [allDresses, setAllDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = useRole();
  const isAdmin = role === "admin";
  const visibleBaseDresses = isAdmin
    ? allDresses
    : allDresses.filter((dress) => dress.isVisible);

  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedNeckline, setSelectedNeckline] = useState("All");
  const [selectedSilhouette, setSelectedSilhouette] = useState("All");
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [selectedTrainLength, setSelectedTrainLength] = useState("All");
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [favoriteDressIds, setFavoriteDressIds] = useState<string[]>([]);

  useEffect(() => {
  const collectionFromUrl = searchParams.get("collection");

  if (collectionFromUrl) {
    setSelectedCollections([collectionFromUrl]);
  } else {
    setSelectedCollections([]);
  }
}, [searchParams]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteDressIds");

    if (savedFavorites) {
      setFavoriteDressIds(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (dressId: string) => {
    if (isAdmin) return;

    setFavoriteDressIds((prev) => {
      const updated = prev.includes(dressId)
        ? prev.filter((id) => id !== dressId)
        : [...prev, dressId];

      localStorage.setItem("favoriteDressIds", JSON.stringify(updated));
      return updated;
    });
  };

  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dress: Dress | null;
  }>({ visible: false, x: 0, y: 0, dress: null });

  const toggleCollection = (collection: string) => {
    if (collection === "All") {
      setSelectedCollections([]);
      return;
    }

    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((item) => item !== collection)
        : [...prev, collection],
    );
  };

  useEffect(() => {
    const fetchDresses = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
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
        .returns<GalleryDressRow[]>();

      if (error) {
        console.error("Gallery fetch failed:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const mappedDresses: Dress[] = (data || []).map((dress) => {
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
          attributeEntries.find(
            (value) => value?.attributes?.key === "neckline",
          )?.label ?? "";

        const fabric =
          attributeEntries.find((value) => value?.attributes?.key === "fabric")
            ?.label ?? "";

        const trainLength =
          attributeEntries.find(
            (value) => value?.attributes?.key === "train_length",
          )?.label ?? "";

        const sleeveStyle =
          attributeEntries.find(
            (value) => value?.attributes?.key === "sleeve_style",
          )?.label ?? "";

        return {
          id: String(dress.id),
          name: dress.name ?? "Unnamed Dress",
          collections:
            collectionNames.length > 0 ? collectionNames : ["Uncategorized"],
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
      });

      const dbCollections = Array.from(
        new Set(
          mappedDresses.flatMap((dress) => dress.collections).filter(Boolean),
        ),
      );

      setAllCollections(["All", ...dbCollections]);
      setAllDresses(mappedDresses);
      setLoading(false);
    };

    fetchDresses();
  }, []);

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

  const filteredDresses = visibleBaseDresses.filter((dress) => {
    if (
      selectedCollections.length > 0 &&
      !dress.collections.some((collection) =>
        selectedCollections.includes(collection),
      )
    ) {
      return false;
    }

    if (selectedSize !== null && !dress.sizes.includes(selectedSize)) {
      return false;
    }

    if (selectedNeckline !== "All" && dress.neckline !== selectedNeckline) {
      return false;
    }

    if (
      selectedSilhouette !== "All" &&
      dress.silhouette !== selectedSilhouette
    ) {
      return false;
    }

    if (selectedFabric !== "All" && dress.fabric !== selectedFabric) {
      return false;
    }

    if (
      selectedTrainLength !== "All" &&
      dress.trainLength !== selectedTrainLength
    ) {
      return false;
    }

    if (
      selectedSleeveStyle !== "All" &&
      dress.sleeveStyle !== selectedSleeveStyle
    ) {
      return false;
    }

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
              {loading
                ? "Loading gowns..."
                : `${filteredDresses.length} gowns available`}
            </p>
          </div>

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
            selectedCollections={selectedCollections}
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
                    isAdmin={isAdmin}
                    isFavorite={favoriteDressIds.includes(dress.id)}
                    onToggleFavorite={toggleFavorite}
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
