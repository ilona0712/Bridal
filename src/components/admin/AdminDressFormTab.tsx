import type { ChangeEvent, DragEvent, FormEvent, RefObject } from "react";
import { useRef, useState } from "react";
import { Check, Loader2, Plus, Upload, X } from "lucide-react";
import type { DressFormData } from "../../types/admin";

type AdminDressFormTabProps = {
  formData: DressFormData;
  collections: string[];
  dragActive: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  availableSizes: readonly number[];
  necklines: readonly string[];
  silhouettes: readonly string[];
  fabrics: readonly string[];
  trainLengths: readonly string[];
  sleeveStyles: readonly string[];
  isEditingDress: boolean;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onCollectionToggle: (collection: string) => void;
  onPriceChange: (value: number | null) => void;
  onImageChange: (value: string) => void;
  onRemoveImage: (index: number) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onSizeToggle: (size: number) => void;
  onNecklineChange: (value: string) => void;
  onSilhouetteChange: (value: string) => void;
  onFabricChange: (value: string) => void;
  onTrainLengthChange: (value: string) => void;
  onSleeveStyleChange: (value: string) => void;
  onDrag: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function ImagePreviewGrid({
  images,
  onRemove,
  onReorder,
}: {
  images: string[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <label className="text-sm text-stone-700 dark:text-stone-300">
        Image Preview{" "}
        <span className="text-xs text-stone-500 dark:text-stone-400">
          — drag to reorder, leftmost is primary
        </span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            draggable
            onDragStart={() => {
              dragIndexRef.current = index;
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndexRef.current !== null) {
                onReorder(dragIndexRef.current, index);
              }
              dragIndexRef.current = null;
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              dragIndexRef.current = null;
              setDragOverIndex(null);
            }}
            className={`relative rounded-xl overflow-hidden border bg-white dark:bg-stone-800 cursor-grab active:cursor-grabbing transition-all duration-150 ${
              dragOverIndex === index
                ? "border-pink-400 ring-2 ring-pink-200 scale-[1.02]"
                : "border-stone-200 dark:border-stone-600"
            }`}
          >
            <img
              src={img}
              alt={`Dress preview ${index + 1}`}
              className="w-full h-44 object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-stone-800/80 text-white text-xs">
                Primary
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
            >
              <X className="w-4 h-4 text-stone-700" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDressFormTab({
  formData,
  collections,
  dragActive,
  fileInputRef,
  availableSizes,
  necklines,
  silhouettes,
  fabrics,
  trainLengths,
  sleeveStyles,
  isEditingDress,
  isSubmitting,
  onSubmit,
  onCancel,
  onNameChange,
  onCollectionToggle,
  onPriceChange,
  onImageChange,
  onRemoveImage,
  onReorderImages,
  onSizeToggle,
  onNecklineChange,
  onSilhouetteChange,
  onFabricChange,
  onTrainLengthChange,
  onSleeveStyleChange,
  onDrag,
  onDrop,
  onFileInputChange,
}: AdminDressFormTabProps) {
  const isAddToGalleryDisabled =
    !formData.name.trim() ||
    (formData.images.length === 0 && !formData.image.trim());
  return (
    <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-8 md:p-12">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Basic Information
          </h2>

          <div className="space-y-2">
            <label className="text-sm text-stone-700 dark:text-stone-300">
              Dress Name{" "}
              <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Ethereal Grace"
              className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-stone-700 dark:text-stone-300">
              Collections {" "}
            </label>
            <span className="text-stone-500 dark:text-stone-400 text-sm font-normal">
              (Optional)
            </span>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              Select collections if this dress belongs to any
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {collections.map((collection) => (
                <button
                  key={collection}
                  type="button"
                  onClick={() => onCollectionToggle(collection)}
                  className={`px-4 py-3 rounded-xl border transition-all text-sm ${
                    formData.collections.includes(collection)
                      ? "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-stone-300 text-stone-800 dark:text-stone-800"
                      : "bg-stone-50/50 dark:bg-stone-700/50 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-600/50"
                  }`}
                >
                  {collection}
                  {formData.collections.includes(collection) && (
                    <Check className="w-4 h-4 inline-block ml-2" />
                  )}
                </button>
              ))}
            </div>

            {formData.collections.length > 0 && (
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">
                Selected: {formData.collections.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-stone-700 dark:text-stone-300">
              Price{" "}
              <span className="text-stone-500 dark:text-stone-400">
                (Optional)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.price ?? ""}
              onChange={(e) =>
                onPriceChange(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              placeholder="e.g., 3500"
              className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-stone-700 dark:text-stone-300">
              Dress Images <span className="text-pink-400/60">*</span>
            </label>

            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                dragActive
                  ? "border-pink-300 bg-pink-50/30"
                  : "border-stone-200 dark:border-stone-600 bg-stone-50/30 dark:bg-stone-700/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFileInputChange}
                className="hidden"
              />

              <div className="text-center">
                <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">
                  Drag and drop images here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg transition-colors text-sm"
                >
                  Browse Files
                </button>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-4">
                  Upload up to 6 images. The first image will be the primary
                  image.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={formData.image}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="Or paste a primary image URL"
              className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />

            <p className="text-xs text-stone-500 dark:text-stone-400">
              {formData.images.length}/6 images uploaded
            </p>
          </div>

          {formData.images.length > 0 && (
            <ImagePreviewGrid
              images={formData.images}
              onRemove={onRemoveImage}
              onReorder={onReorderImages}
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100">
            Available Sizes{" "}
            <span className="text-stone-500 dark:text-stone-400 text-sm font-normal">
              (Optional)
            </span>
          </h2>

          <p className="text-sm text-stone-600 dark:text-stone-300">
            Select all sizes available for this dress
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSizeToggle(size)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  formData.sizes.includes(size)
                    ? "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-stone-300 text-stone-800 dark:text-stone-800"
                    : "bg-stone-50/50 dark:bg-stone-700/50 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-600/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100">
            Dress Attributes{" "}
            <span className="text-stone-500 dark:text-stone-400 text-sm font-normal">
              (Optional)
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-stone-700 dark:text-stone-300">
                Neckline
              </label>
              <select
                value={formData.neckline}
                onChange={(e) => onNecklineChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Select neckline...</option>
                {necklines.map((neckline) => (
                  <option key={neckline} value={neckline}>
                    {neckline}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-700 dark:text-stone-300">
                Silhouette
              </label>
              <select
                value={formData.silhouette}
                onChange={(e) => onSilhouetteChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Select silhouette...</option>
                {silhouettes.map((silhouette) => (
                  <option key={silhouette} value={silhouette}>
                    {silhouette}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-700 dark:text-stone-300">
                Fabric
              </label>
              <select
                value={formData.fabric}
                onChange={(e) => onFabricChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Select fabric...</option>
                {fabrics.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-700 dark:text-stone-300">
                Train Length
              </label>
              <select
                value={formData.trainLength}
                onChange={(e) => onTrainLengthChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Select train length...</option>
                {trainLengths.map((train) => (
                  <option key={train} value={train}>
                    {train}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-stone-700 dark:text-stone-300">
                Sleeve Style
              </label>
              <select
                value={formData.sleeveStyle}
                onChange={(e) => onSleeveStyleChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
              >
                <option value="">Select sleeve style...</option>
                {sleeveStyles.map((sleeve) => (
                  <option key={sleeve} value={sleeve}>
                    {sleeve}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isAddToGalleryDisabled || isSubmitting}
            className={`flex-1 py-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
              isAddToGalleryDisabled
                ? "bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed"
                : "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting
              ? isEditingDress
                ? "Updating..."
                : "Adding..."
              : isEditingDress
                ? "Update Dress"
                : "Add Dress to Gallery"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-stone-100/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-600/50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
