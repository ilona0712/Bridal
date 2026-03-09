import { useState } from "react";
import { X } from "lucide-react";
import type { Dress } from "../../types/dress";

type CreateCollectionModalProps = {
  dresses: Dress[];
  existingCollections: string[];
  onClose: () => void;
  onCreateCollection: (name: string, selectedDressIds: string[]) => void;
};

export default function CreateCollectionModal({
  dresses,
  existingCollections,
  onClose,
  onCreateCollection,
}: CreateCollectionModalProps) {
  const [collectionName, setCollectionName] = useState("");
  const [selectedDressIds, setSelectedDressIds] = useState<string[]>([]);

  const toggleDressSelection = (dressId: string) => {
    setSelectedDressIds((prev) =>
      prev.includes(dressId)
        ? prev.filter((id) => id !== dressId)
        : [...prev, dressId]
    );
  };

  const handleSubmit = () => {
    const trimmed = collectionName.trim();
    if (!trimmed) return;

    onCreateCollection(trimmed, selectedDressIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 rounded-3xl shadow-2xl border border-stone-200/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 px-6 py-5 border-b border-stone-200/50 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-stone-800">
            Create Collection
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 bg-white/60 hover:bg-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-stone-700">Collection Name</label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g. Summer Couture"
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800"
            />
            {existingCollections.includes(collectionName.trim()) &&
              collectionName.trim() && (
                <p className="text-xs text-red-500">
                  A collection with this name already exists.
                </p>
              )}
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-lg text-stone-800">
              Add dresses from arsenal
            </h3>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {dresses.map((dress) => (
                <label
                  key={dress.id}
                  className="flex items-center gap-3 p-3 bg-stone-50/50 border border-stone-200 rounded-xl cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDressIds.includes(dress.id)}
                    onChange={() => toggleDressSelection(dress.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-stone-800">{dress.name}</p>
                    <p className="text-xs text-stone-500">
                      {dress.collections.join(", ")}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-stone-100 text-stone-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !collectionName.trim() ||
                existingCollections.includes(collectionName.trim())
              }
              className="px-5 py-3 bg-stone-800 text-white rounded-xl disabled:opacity-50"
            >
              Create Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}