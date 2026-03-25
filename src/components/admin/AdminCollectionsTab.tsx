import { Check, Edit2, FolderPlus, Save, Trash2, X } from "lucide-react";
import type { AdminCollection, EditingCollection } from "../../types/admin";
import type { Dress } from "../../types/dress";

type AdminCollectionsTabProps = {
  collections: AdminCollection[];
  dresses: Dress[];
  newCollectionName: string;
  editingCollection: EditingCollection | null;
  addingCollectionMode: boolean;
  selectedDressesForCollection: string[];
  selectedDressesForEditCollection: string[];
  collectionNameError: string;
  onNewCollectionNameChange: (value: string) => void;
  onToggleAddingCollectionMode: () => void;
  onAddCollection: () => void;
  onStartEditingCollection: (collection: AdminCollection) => void;
  onEditingCollectionNameChange: (value: string) => void;
  onUpdateCollection: () => void;
  onCancelEditCollection: () => void;
  onDeleteCollection: (collection: AdminCollection) => void;
  onToggleDressForCollection: (dressId: string) => void;
  onToggleDressForEditCollection: (dressId: string) => void;
};

export default function AdminCollectionsTab({
  collections,
  dresses,
  newCollectionName,
  editingCollection,
  addingCollectionMode,
  selectedDressesForCollection,
  selectedDressesForEditCollection,
  collectionNameError,
  onNewCollectionNameChange,
  onToggleAddingCollectionMode,
  onAddCollection,
  onStartEditingCollection,
  onEditingCollectionNameChange,
  onUpdateCollection,
  onCancelEditCollection,
  onDeleteCollection,
  onToggleDressForCollection,
  onToggleDressForEditCollection,
}: AdminCollectionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-6">
        <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
          <FolderPlus className="w-6 h-6" />
          Add New Collection
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => onNewCollectionNameChange(e.target.value)}
              placeholder="Enter collection name (required)..."
              className="flex-1 px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />

            <button
              type="button"
              onClick={onToggleAddingCollectionMode}
              className="px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-xl transition-all font-medium"
            >
              {addingCollectionMode ? "Cancel" : "Select Dresses"}
            </button>
          </div>

          {!editingCollection &&
            (collectionNameError ? (
              <p className="text-sm text-red-600">{collectionNameError}</p>
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Collection name is required
              </p>
            ))}

          {addingCollectionMode && (
            <div className="border-t border-stone-200 dark:border-stone-700 pt-4 mt-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
                Select dresses to add to this collection:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {dresses.map((dress) => (
                  <div
                    key={dress.id}
                    onClick={() => onToggleDressForCollection(dress.id)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedDressesForCollection.includes(dress.id)
                        ? "border-pink-300 ring-2 ring-pink-200/50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="aspect-[3/4]">
                      <img
                        src={dress.image}
                        alt={dress.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white font-medium">
                        {dress.name}
                      </p>
                    </div>

                    {selectedDressesForCollection.includes(dress.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-pink-300 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-stone-800" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedDressesForCollection.length > 0 && (
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-3">
                  {selectedDressesForCollection.length} dress(es) selected
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onAddCollection}
            disabled={!newCollectionName.trim()}
            className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Collection{" "}
            {selectedDressesForCollection.length > 0 &&
              `with ${selectedDressesForCollection.length} dress(es)`}
          </button>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-6">
        <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-100 mb-4">
          Existing Collections
        </h2>

        <div className="space-y-3">
          {collections.map((collection) => {
            const dressCount = dresses.filter((dress) =>
              dress.collections.includes(collection.name),
            ).length;

            const isEditing = editingCollection?.id === collection.id;

            return (
              <div
                key={collection.id}
                className="bg-stone-50/50 dark:bg-stone-700/50 rounded-xl border border-stone-200 dark:border-stone-600 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  {isEditing && editingCollection ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingCollection.newName}
                        onChange={(e) =>
                          onEditingCollectionNameChange(e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
                      />
                      {collectionNameError && (
                        <p className="mt-2 text-sm text-red-600">
                          {collectionNameError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-stone-800 dark:text-stone-100">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {dressCount} dress{dressCount !== 1 ? "es" : ""}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={onUpdateCollection}
                          className="px-3 py-2 bg-stone-800 dark:bg-stone-600 text-white rounded-lg hover:bg-stone-700 dark:hover:bg-stone-500 transition-colors text-sm flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={onCancelEditCollection}
                          className="px-3 py-2 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartEditingCollection(collection)}
                          className="px-3 py-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteCollection(collection)}
                          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="border-t border-stone-200 dark:border-stone-700 p-4 bg-white/30 dark:bg-stone-700/30">
                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
                      Select dresses in this collection (highlighted =
                      included):
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                      {dresses.map((dress) => {
                        const isSelected =
                          selectedDressesForEditCollection.includes(dress.id);

                        return (
                          <div
                            key={dress.id}
                            onClick={() =>
                              onToggleDressForEditCollection(dress.id)
                            }
                            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                              isSelected
                                ? "border-pink-300 ring-2 ring-pink-200/50"
                                : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className="aspect-[3/4]">
                              <img
                                src={dress.image}
                                alt={dress.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-xs text-white font-medium">
                                {dress.name}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-pink-300 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-stone-800" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {selectedDressesForEditCollection.length > 0 && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-3">
                        {selectedDressesForEditCollection.length} dress(es)
                        selected
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
