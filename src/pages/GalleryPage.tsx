import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Sparkles,
  Heart,
  SlidersHorizontal,
  X,
  MessageCircle,
} from "lucide-react";
import Header from "../components/Header";

// Mock dress data
const dresses = [
  {
    id: 1,
    name: "Ethereal Grace",
    collection: "Classic Romance",
    price: 3850,
    image:
      "https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2hpdGUlMjB3ZWRkaW5nJTIwZHJlc3N8ZW58MXx8fHwxNzcwODk2NjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [2, 4, 6, 8, 10, 12],
    neckline: "Sweetheart",
    silhouette: "A-Line",
    fabric: "Lace",
    trainLength: "Chapel",
    sleeveStyle: "Cap Sleeve",
  },
  {
    id: 2,
    name: "Royal Elegance",
    collection: "Royal Collection",
    price: 5200,
    image:
      "https://images.unsplash.com/photo-1768586471676-6af1d219e99e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmFsbGdvd24lMjB3ZWRkaW5nJTIwZHJlc3N8ZW58MXx8fHwxNzcxOTUwMzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [0, 2, 4, 6, 8, 10],
    neckline: "Off-Shoulder",
    silhouette: "Ball Gown",
    fabric: "Satin",
    trainLength: "Cathedral",
    sleeveStyle: "Long Sleeve",
  },
  {
    id: 3,
    name: "Modern Muse",
    collection: "Contemporary",
    price: 4100,
    image:
      "https://images.unsplash.com/photo-1732950217690-dca11b6f7353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJtYWxpZCUyMHdlZGRpbmclMjBkcmVzcyUyMGZpdHRlJTIwcmV2aWV3JTIwZGV0YWlscyUyMGxhY2V8ZW58MXx8fHwxNzcxOTUwMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [4, 6, 8, 10, 12, 14],
    neckline: "V-Neck",
    silhouette: "Mermaid",
    fabric: "Crepe",
    trainLength: "Court",
    sleeveStyle: "Sleeveless",
  },
  {
    id: 4,
    name: "Bohemian Dream",
    collection: "Boho Chic",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1581357421952-cbe61a77b7a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2hlbWlhbiUyMHdlZGRpbmclMjBkcmVzcyUyMGxhY2V8ZW58MXx8fHwxNzcxOTUwMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [2, 4, 6, 8, 10],
    neckline: "Halter",
    silhouette: "Sheath",
    fabric: "Chiffon",
    trainLength: "No Train",
    sleeveStyle: "Sleeveless",
  },
  {
    id: 5,
    name: "Vintage Romance",
    collection: "Vintage Collection",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1681714552617-fe3f4cf4be47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2VkZGluZyUyMGRyZXNzJTIwYmVhZGVkfGVufDF8fHx8MTc3MTk1MDMzN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [0, 2, 4, 6, 8],
    neckline: "Sweetheart",
    silhouette: "A-Line",
    fabric: "Tulle",
    trainLength: "Chapel",
    sleeveStyle: "Cap Sleeve",
  },
  {
    id: 6,
    name: "Minimalist Bride",
    collection: "Contemporary",
    price: 3650,
    image:
      "https://images.unsplash.com/photo-1689247004420-5ac544f3cf29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWRkaW5nJTIwZHJlc3MlMjBzbGVla3xlbnwxfHx8fDE3NzE5NTAzMzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [6, 8, 10, 12, 14],
    neckline: "V-Neck",
    silhouette: "Sheath",
    fabric: "Satin",
    trainLength: "No Train",
    sleeveStyle: "Sleeveless",
  },
  {
    id: 7,
    name: "Timeless Beauty",
    collection: "Classic Romance",
    price: 4800,
    image:
      "https://images.unsplash.com/photo-1735712954543-67a25a6998c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBicmlkYWwlMjBib3V0aXF1ZXxlbnwxfHx8fDE3NzA4OTY2Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [2, 4, 6, 8, 10, 12, 14],
    neckline: "Off-Shoulder",
    silhouette: "Ball Gown",
    fabric: "Lace",
    trainLength: "Cathedral",
    sleeveStyle: "Long Sleeve",
  },
  {
    id: 8,
    name: "Garden Party",
    collection: "Boho Chic",
    price: 3400,
    image:
      "https://images.unsplash.com/photo-1766104797322-3826d7158c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZHJlc3MlMjBmaXR0aW5nJTIwYnJpZGV8ZW58MXx8fHwxNzcwODk2NjM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [4, 6, 8, 10, 12],
    neckline: "Sweetheart",
    silhouette: "A-Line",
    fabric: "Chiffon",
    trainLength: "Court",
    sleeveStyle: "Cap Sleeve",
  },
  {
    id: 9,
    name: "Regal Princess",
    collection: "Royal Collection",
    price: 5800,
    image:
      "https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBnb3duJTIwZGV0YWlscyUyMGxhY2V8ZW58MXx8fHwxNzcwODk2NjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [0, 2, 4, 6, 8, 10, 12],
    neckline: "Halter",
    silhouette: "Ball Gown",
    fabric: "Tulle",
    trainLength: "Cathedral",
    sleeveStyle: "Sleeveless",
  },
  {
    id: 10,
    name: "Sophisticated Lady",
    collection: "Contemporary",
    price: 4300,
    image:
      "https://images.unsplash.com/photo-1681490395226-36e00f9bbd2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjB2ZWlsJTIwZGVsaWNhdGV8ZW58MXx8fHwxNzcwODk2OTAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [6, 8, 10, 12, 14, 16],
    neckline: "V-Neck",
    silhouette: "Mermaid",
    fabric: "Crepe",
    trainLength: "Court",
    sleeveStyle: "Long Sleeve",
  },
  {
    id: 11,
    name: "Enchanted Evening",
    collection: "Vintage Collection",
    price: 4700,
    image:
      "https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMHNtaWxpbmclMjBoYXBweSUyMGVsZWdhbnR8ZW58MXx8fHwxNzcwODk2ODk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [2, 4, 6, 8, 10],
    neckline: "Sweetheart",
    silhouette: "Ball Gown",
    fabric: "Lace",
    trainLength: "Chapel",
    sleeveStyle: "Cap Sleeve",
  },
  {
    id: 12,
    name: "Free Spirit",
    collection: "Boho Chic",
    price: 2950,
    image:
      "https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2hpdGUlMjB3ZWRkaW5nJTIwZHJlc3N8ZW58MXx8fHwxNzcwODk2NjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    sizes: [4, 6, 8, 10, 12, 14],
    neckline: "Halter",
    silhouette: "Sheath",
    fabric: "Chiffon",
    trainLength: "No Train",
    sleeveStyle: "Sleeveless",
  },
];

const collections = [
  "All",
  "Classic Romance",
  "Royal Collection",
  "Contemporary",
  "Boho Chic",
  "Vintage Collection",
];
const sizes = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
const necklines = ["All", "Sweetheart", "V-Neck", "Off-Shoulder", "Halter"];
const silhouettes = ["All", "A-Line", "Ball Gown", "Mermaid", "Sheath"];
const fabrics = ["All", "Lace", "Satin", "Chiffon", "Crepe", "Tulle"];
const trainLengths = ["All", "No Train", "Court", "Chapel", "Cathedral"];
const sleeveStyles = ["All", "Sleeveless", "Cap Sleeve", "Long Sleeve"];

export default function GalleryPage() {
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedNeckline, setSelectedNeckline] = useState("All");
  const [selectedSilhouette, setSelectedSilhouette] = useState("All");
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [selectedTrainLength, setSelectedTrainLength] = useState("All");
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDress, setSelectedDress] = useState<
    (typeof dresses)[0] | null
  >(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dress: (typeof dresses)[0] | null;
  }>({ visible: false, x: 0, y: 0, dress: null });

  const handleClickOutside = () => {
    setContextMenu({ visible: false, x: 0, y: 0, dress: null });
  };

  const handleRightClick = (
    e: React.MouseEvent,
    dress: (typeof dresses)[0],
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      dress: dress,
    });
  };

  const filteredDresses = dresses.filter((dress) => {
    if (selectedCollection !== "All" && dress.collection !== selectedCollection)
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/60 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50/50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <div className="sticky top-24 h-[calc(100vh-7rem)]">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-stone-800">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-stone-600 hover:text-stone-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                <div className="space-y-6 pb-4">
                  {/* Collection Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Collection
                    </label>
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <label
                          key={collection}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="collection"
                            checked={selectedCollection === collection}
                            onChange={() => setSelectedCollection(collection)}
                            className="text-pink-300 focus:ring-pink-200/50"
                          />
                          <span className="text-sm text-stone-600">
                            {collection}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dress Size Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Dress Size
                    </label>
                    <select
                      value={selectedSize ?? ""}
                      onChange={(e) =>
                        setSelectedSize(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      <option value="">All Sizes</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          Size {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Neckline Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Neckline
                    </label>
                    <select
                      value={selectedNeckline}
                      onChange={(e) => setSelectedNeckline(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      {necklines.map((neckline) => (
                        <option key={neckline} value={neckline}>
                          {neckline}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Silhouette Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Silhouette
                    </label>
                    <select
                      value={selectedSilhouette}
                      onChange={(e) => setSelectedSilhouette(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      {silhouettes.map((silhouette) => (
                        <option key={silhouette} value={silhouette}>
                          {silhouette}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fabric Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Fabric
                    </label>
                    <select
                      value={selectedFabric}
                      onChange={(e) => setSelectedFabric(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      {fabrics.map((fabric) => (
                        <option key={fabric} value={fabric}>
                          {fabric}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Train Length Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Train Length
                    </label>
                    <select
                      value={selectedTrainLength}
                      onChange={(e) => setSelectedTrainLength(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      {trainLengths.map((length) => (
                        <option key={length} value={length}>
                          {length}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sleeve Style Filter */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Sleeve Style
                    </label>
                    <select
                      value={selectedSleeveStyle}
                      onChange={(e) => setSelectedSleeveStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                    >
                      {sleeveStyles.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dresses Grid */}
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
                  <div
                    key={dress.id}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 overflow-hidden hover:shadow-xl transition-shadow group"
                    onContextMenu={(e) => handleRightClick(e, dress)}
                  >
                    <div
                      className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedDress(dress)}
                    >
                      <ImageWithFallback
                        src={dress.image}
                        alt={dress.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-stone-600" />
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1 bg-stone-800/70 backdrop-blur-sm rounded-full">
                        <span className="text-xs text-white">
                          {dress.collection}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-serif text-lg text-stone-800">
                          {dress.name}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {dress.silhouette} • {dress.neckline}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500">
                          Sizes: {dress.sizes[0]}-
                          {dress.sizes[dress.sizes.length - 1]}
                        </span>
                      </div>

                      <div className="flex gap-2 text-xs text-stone-600">
                        <span className="px-2 py-1 bg-stone-100/70 rounded">
                          {dress.fabric}
                        </span>
                        <span className="px-2 py-1 bg-stone-100/70 rounded">
                          {dress.sleeveStyle}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="w-full py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-lg hover:shadow-lg transition-all text-sm"
                        onClick={() => setSelectedDress(dress)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="w-full py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-all text-sm"
                      >
                        Request to Rent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dress Detail Modal */}
      {selectedDress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 px-6 py-5 border-b border-stone-200/50 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-stone-800">
                {selectedDress.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDress(null)}
                className="w-10 h-10 bg-white/60 hover:bg-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src={selectedDress.image}
                  alt={selectedDress.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-stone-800/70 text-white text-xs rounded-full mb-4">
                    {selectedDress.collection}
                  </span>
                  <p className="text-sm text-stone-500">
                    Available in sizes {selectedDress.sizes[0]}-
                    {selectedDress.sizes[selectedDress.sizes.length - 1]}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-stone-800">
                    Dress Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">Neckline</p>
                      <p className="text-sm text-stone-800">
                        {selectedDress.neckline}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">Silhouette</p>
                      <p className="text-sm text-stone-800">
                        {selectedDress.silhouette}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">Fabric</p>
                      <p className="text-sm text-stone-800">
                        {selectedDress.fabric}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">Train Length</p>
                      <p className="text-sm text-stone-800">
                        {selectedDress.trainLength}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">Sleeve Style</p>
                      <p className="text-sm text-stone-800">
                        {selectedDress.sleeveStyle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    type="button"
                    className="w-full py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all text-sm"
                  >
                    Request to Rent
                  </button>

                  <Link
                    to="/isabella"
                    state={{ dress: selectedDress }}
                    className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Customize with Isabella
                  </Link>

                  <button
                    type="button"
                    className="w-full py-3 bg-stone-100/70 text-stone-700 rounded-xl hover:bg-stone-100 transition-all text-sm"
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Consultant Button */}
      <Link
        to="/isabella"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Sparkles className="w-7 h-7 text-stone-700" />
      </Link>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.dress && (
        <div
          className="fixed bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-stone-200/50 py-2 z-50 min-w-[280px]"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-stone-200/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={contextMenu.dress.image}
                  alt={contextMenu.dress.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-sm text-stone-800">
                  {contextMenu.dress.name}
                </h3>
                <p className="text-xs text-stone-500">
                  ${contextMenu.dress.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Collection</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.collection}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Neckline</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.neckline}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Silhouette</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.silhouette}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Fabric</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.fabric}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Train Length</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.trainLength}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Sleeve Style</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.sleeveStyle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500">Available Sizes</span>
              <span className="text-xs text-stone-800">
                {contextMenu.dress.sizes[0]}-
                {contextMenu.dress.sizes[contextMenu.dress.sizes.length - 1]}
              </span>
            </div>
          </div>

          <div className="px-2 py-2 border-t border-stone-200/50 space-y-1">
            <button
              type="button"
              onClick={() => {
                setSelectedDress(contextMenu.dress);
                setContextMenu({ visible: false, x: 0, y: 0, dress: null });
              }}
              className="w-full px-3 py-2 text-left text-xs text-stone-700 hover:bg-stone-100/50 rounded-lg transition-colors"
            >
              View Full Details
            </button>

            <button
              type="button"
              className="w-full px-3 py-2 text-left text-xs text-stone-700 hover:bg-stone-100/50 rounded-lg transition-colors"
            >
              Request to Rent
            </button>

            <Link
              to="/isabella"
              state={{ dress: contextMenu.dress }}
              className="w-full px-3 py-2 text-left text-xs text-stone-700 hover:bg-stone-100/50 rounded-lg transition-colors block"
            >
              Customize with Isabella
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
