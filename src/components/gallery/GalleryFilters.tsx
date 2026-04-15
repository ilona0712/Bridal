type GalleryFiltersProps = {
  showFilters: boolean;
  selectedCollections: string[];
  minSize: number | null;
  maxSize: number | null;
  selectedNeckline: string;
  selectedSilhouette: string;
  selectedFabric: string;
  selectedTrainLength: string;
  selectedSleeveStyle: string;
  showFavoritesOnly: boolean;
  showFavoritesFilter: boolean;
  collections: string[];
  sizes: number[];
  necklines: string[];
  silhouettes: string[];
  fabrics: string[];
  trainLengths: string[];
  sleeveStyles: string[];
  onCollectionToggle: (value: string) => void;
  onMinSizeChange: (value: number | null) => void;
  onMaxSizeChange: (value: number | null) => void;
  onNecklineChange: (value: string) => void;
  onSilhouetteChange: (value: string) => void;
  onFabricChange: (value: string) => void;
  onTrainLengthChange: (value: string) => void;
  onSleeveStyleChange: (value: string) => void;
  onToggleFavoritesOnly: () => void;
  onClearFilters: () => void;
  minPrice: number | null;
  maxPrice: number | null;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  priceFilterMin: number;
  priceFilterMax: number;
  priceFilterStep: number;
};

import { X, Heart } from "lucide-react";

export default function GalleryFilters({
  showFilters,
  selectedCollections,
  minSize,
  maxSize,
  selectedNeckline,
  selectedSilhouette,
  selectedFabric,
  selectedTrainLength,
  selectedSleeveStyle,
  showFavoritesOnly,
  showFavoritesFilter,
  collections,
  sizes,
  necklines,
  silhouettes,
  fabrics,
  trainLengths,
  sleeveStyles,
  onCollectionToggle,
  onMinSizeChange,
  onMaxSizeChange,
  onNecklineChange,
  onSilhouetteChange,
  onFabricChange,
  onTrainLengthChange,
  onSleeveStyleChange,
  onToggleFavoritesOnly,
  onClearFilters,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceFilterMin,
  priceFilterMax,
  priceFilterStep,
}: GalleryFiltersProps) {
  const PRICE_MIN = priceFilterMin;
  const PRICE_MAX = priceFilterMax;
  const effectiveMin = minPrice ?? PRICE_MIN;
  const effectiveMax = maxPrice ?? PRICE_MAX;
  const minPct = (effectiveMin / PRICE_MAX) * 100;
  const maxPct = (effectiveMax / PRICE_MAX) * 100;
  return (
    <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
      <div className="sticky top-24 h-[calc(100vh-7rem)]">
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-stone-800 dark:text-stone-100">
              Filters
            </h2>
            <button
              onClick={onClearFilters}
              className="text-xs text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          </div>

          <div className="space-y-6 pb-4">
            {showFavoritesFilter && (
              <div>
                <button
                  onClick={onToggleFavoritesOnly}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                    showFavoritesOnly
                      ? "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300"
                      : "bg-stone-50/50 dark:bg-stone-700/50 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:border-pink-200 dark:hover:border-pink-700"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${showFavoritesOnly ? "fill-pink-500 text-pink-500" : ""}`}
                  />
                  My Favorites
                </button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Collection
              </label>
              <div className="space-y-2">
                {collections.map((collection) => {
                  const isAll = collection === "All";
                  const isChecked = isAll
                    ? selectedCollections.length === 0
                    : selectedCollections.includes(collection);

                  return (
                    <label
                      key={collection}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onCollectionToggle(collection)}
                        className="text-pink-300 focus:ring-pink-200/50 rounded"
                      />
                      <span className="text-sm text-stone-600">
                        {collection}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Dress Size Range
              </label>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={minSize ?? ""}
                  onChange={(e) =>
                    onMinSizeChange(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                >
                  <option value="">Min Size</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <select
                  value={maxSize ?? ""}
                  onChange={(e) =>
                    onMaxSizeChange(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
                >
                  <option value="">Max Size</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Neckline
              </label>
              <select
                value={selectedNeckline}
                onChange={(e) => onNecklineChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {necklines.map((neckline) => (
                  <option key={neckline} value={neckline}>
                    {neckline}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Silhouette
              </label>
              <select
                value={selectedSilhouette}
                onChange={(e) => onSilhouetteChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {silhouettes.map((silhouette) => (
                  <option key={silhouette} value={silhouette}>
                    {silhouette}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Fabric
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => onFabricChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {fabrics.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Train Length
              </label>
              <select
                value={selectedTrainLength}
                onChange={(e) => onTrainLengthChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {trainLengths.map((length) => (
                  <option key={length} value={length}>
                    {length}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 block">
                Sleeve Style
              </label>
              <select
                value={selectedSleeveStyle}
                onChange={(e) => onSleeveStyleChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {sleeveStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-4 block">
                Price Range
              </label>

              {/* Value labels */}
              <div className="flex justify-between mb-3">
                <span className="px-2 py-0.5 bg-stone-700 dark:bg-stone-200 text-stone-100 dark:text-stone-800 text-xs font-semibold rounded">
                  ${effectiveMin.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 bg-stone-700 dark:bg-stone-200 text-stone-100 dark:text-stone-800 text-xs font-semibold rounded">
                  ${effectiveMax.toLocaleString()}
                </span>
              </div>

              {/* Dual range slider */}
              <div className="relative h-5 mb-4">
                {/* Track background */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-stone-200 dark:bg-stone-600 rounded-full" />
                {/* Active track */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-stone-400 via-pink-300/70 to-stone-400 rounded-full"
                  style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                />
                {/* Min thumb */}
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={priceFilterStep}
                  value={effectiveMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= effectiveMax)
                      onMinPriceChange(val === PRICE_MIN ? null : val);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-stone-400 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  style={{ zIndex: 3 }}
                />
                {/* Max thumb */}
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={priceFilterStep}
                  value={effectiveMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= effectiveMin)
                      onMaxPriceChange(val === PRICE_MAX ? null : val);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-300 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pink-300 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  style={{ zIndex: 4 }}
                />
              </div>

              {/* Number inputs with $ prefix */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1 px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice ?? ""}
                    onChange={(e) =>
                      onMinPriceChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice ?? ""}
                    onChange={(e) =>
                      onMaxPriceChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
