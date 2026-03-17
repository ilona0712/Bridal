import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  RefObject,
} from "react";
import { Check, Plus, Upload, X } from "lucide-react";
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
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onCollectionToggle: (collection: string) => void;
  onPriceChange: (value: number | null) => void;
  onImageChange: (value: string) => void;
  onRemoveImage: (index: number) => void;
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
  onSubmit,
  onCancel,
  onNameChange,
  onCollectionToggle,
  onPriceChange,
  onImageChange,
  onRemoveImage,
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
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 md:p-12">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Basic Information
          </h2>

          <div className="space-y-2">
            <label className="text-sm text-stone-700">
              Dress Name <span className="text-pink-400/60">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Ethereal Grace"
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-stone-700">
              Collections <span className="text-pink-400/60">*</span>
            </label>

            <p className="text-xs text-stone-500 mb-3">
              Select all collections this dress belongs to
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {collections.map((collection) => (
                <button
                  key={collection}
                  type="button"
                  onClick={() => onCollectionToggle(collection)}
                  className={`px-4 py-3 rounded-xl border transition-all text-sm ${
                    formData.collections.includes(collection)
                      ? "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-stone-300 text-stone-800"
                      : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-100/50"
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
              <p className="text-xs text-stone-600 mt-2">
                Selected: {formData.collections.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-stone-700">
              Price <span className="text-stone-500">(Optional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.price ?? ""}
              onChange={(e) =>
                onPriceChange(e.target.value === "" ?  null : Number(e.target.value))
              }
              placeholder="e.g., 3500"
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-stone-700">
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
                  : "border-stone-200 bg-stone-50/30"
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
                <p className="text-sm text-stone-600 mb-2">
                  Drag and drop images here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors text-sm"
                >
                  Browse Files
                </button>
                <p className="text-xs text-stone-500 mt-4">
                  Upload up to 6 images. The first image will be the primary image.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={formData.image}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="Or paste a primary image URL"
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
            />

            <p className="text-xs text-stone-500">
              {formData.images.length}/6 images uploaded
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm text-stone-700">Image Preview</label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.images.map((img, index) => (
                  <div
                    key={`${img}-${index}`}
                    className="relative rounded-xl overflow-hidden border border-stone-200 bg-white"
                  >
                    <img
                      src={img}
                      alt={`Dress preview ${index + 1}`}
                      className="w-full h-44 object-cover"
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
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <X className="w-4 h-4 text-stone-700" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-stone-800">
            Available Sizes{" "}
            <span className="text-stone-500 text-sm font-normal">
              (Optional)
            </span>
          </h2>

          <p className="text-sm text-stone-600">
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
                    ? "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-stone-300 text-stone-800"
                    : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-100/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-stone-800">
            Dress Attributes{" "}
            <span className="text-stone-500 text-sm font-normal">
              (Optional)
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-stone-700">Neckline</label>
              <select
                value={formData.neckline}
                onChange={(e) => onNecklineChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
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
              <label className="text-sm text-stone-700">Silhouette</label>
              <select
                value={formData.silhouette}
                onChange={(e) => onSilhouetteChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
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
              <label className="text-sm text-stone-700">Fabric</label>
              <select
                value={formData.fabric}
                onChange={(e) => onFabricChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
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
              <label className="text-sm text-stone-700">Train Length</label>
              <select
                value={formData.trainLength}
                onChange={(e) => onTrainLengthChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
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
              <label className="text-sm text-stone-700">Sleeve Style</label>
              <select
                value={formData.sleeveStyle}
                onChange={(e) => onSleeveStyleChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
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
            className="flex-1 py-4 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            {isEditingDress ? "Update Dress" : "Add Dress to Gallery"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-stone-100/50 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}