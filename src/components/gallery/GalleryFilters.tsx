type GalleryFiltersProps = {
  showFilters: boolean;
  selectedCollections: string[];
  selectedSize: number | null;
  selectedNeckline: string;
  selectedSilhouette: string;
  selectedFabric: string;
  selectedTrainLength: string;
  selectedSleeveStyle: string;
  collections: string[];
  sizes: number[];
  necklines: string[];
  silhouettes: string[];
  fabrics: string[];
  trainLengths: string[];
  sleeveStyles: string[];
  onCollectionToggle: (value: string) => void;
  onSizeChange: (value: number | null) => void;
  onNecklineChange: (value: string) => void;
  onSilhouetteChange: (value: string) => void;
  onFabricChange: (value: string) => void;
  onTrainLengthChange: (value: string) => void;
  onSleeveStyleChange: (value: string) => void;
  onClearFilters: () => void;
};

import { X } from "lucide-react";

export default function GalleryFilters({
  showFilters,
  selectedCollections,
  selectedSize,
  selectedNeckline,
  selectedSilhouette,
  selectedFabric,
  selectedTrainLength,
  selectedSleeveStyle,
  collections,
  sizes,
  necklines,
  silhouettes,
  fabrics,
  trainLengths,
  sleeveStyles,
  onCollectionToggle,
  onSizeChange,
  onNecklineChange,
  onSilhouetteChange,
  onFabricChange,
  onTrainLengthChange,
  onSleeveStyleChange,
  onClearFilters,
}: GalleryFiltersProps) {
  return (
    <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
      <div className="sticky top-24 h-[calc(100vh-7rem)]">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-stone-800">Filters</h2>
            <button
              onClick={onClearFilters}
              className="text-xs text-stone-600 hover:text-stone-800 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          </div>

          <div className="space-y-6 pb-4">
            <div>
  <label className="text-sm font-medium text-stone-700 mb-3 block">
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
          <span className="text-sm text-stone-600">{collection}</span>
        </label>
      );
    })}
  </div>
</div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Dress Size
              </label>
              <select
                value={selectedSize ?? ""}
                onChange={(e) =>
                  onSizeChange(e.target.value ? Number(e.target.value) : null)
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

            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Neckline
              </label>
              <select
                value={selectedNeckline}
                onChange={(e) => onNecklineChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {necklines.map((neckline) => (
                  <option key={neckline} value={neckline}>
                    {neckline}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Silhouette
              </label>
              <select
                value={selectedSilhouette}
                onChange={(e) => onSilhouetteChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {silhouettes.map((silhouette) => (
                  <option key={silhouette} value={silhouette}>
                    {silhouette}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Fabric
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => onFabricChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {fabrics.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Train Length
              </label>
              <select
                value={selectedTrainLength}
                onChange={(e) => onTrainLengthChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200/50"
              >
                {trainLengths.map((length) => (
                  <option key={length} value={length}>
                    {length}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-3 block">
                Sleeve Style
              </label>
              <select
                value={selectedSleeveStyle}
                onChange={(e) => onSleeveStyleChange(e.target.value)}
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
  );
}