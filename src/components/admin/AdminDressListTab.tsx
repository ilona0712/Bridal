import { Edit2, Eye, EyeOff, Trash2 } from "lucide-react";
import type { Dress } from "../../types/dress";

type AdminDressListTabProps = {
  dresses: Dress[];
  onAddDress: () => void;
  onToggleVisibility: (id: string) => void;
  onEdit: (dress: Dress) => void;
  onDelete: (id: string) => void;
};

export default function AdminDressListTab({
  dresses,
  onAddDress,
  onToggleVisibility,
  onEdit,
  onDelete,
}: AdminDressListTabProps) {
  if (dresses.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
        <p className="text-stone-600 dark:text-stone-300 mb-4">
          No dresses yet. Add your first dress!
        </p>

        <button
          type="button"
          onClick={onAddDress}
          className="px-6 py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all"
        >
          Add Dress
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {dresses.map((dress) => (
        <div
          key={dress.id}
          className={`bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-6 ${
            !dress.isVisible ? "opacity-60" : ""
          }`}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-64 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={dress.image}
                alt={dress.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-100">
                    {dress.name}
                  </h3>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {dress.collections.map((collection) => (
                      <span
                        key={collection}
                        className="text-xs px-2 py-1 bg-stone-800/70 text-white rounded-full"
                      >
                        {collection}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {dress.isVisible ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-stone-400" />
                  )}
                </div>
              </div>

              <div>
                <span className="text-stone-500 dark:text-stone-400 text-sm">
                  Price:
                </span>
                <span className="ml-2 text-stone-800 dark:text-stone-100 font-medium">
                  $
                  {dress.price !== null && dress.price !== undefined
                    ? dress.price.toLocaleString()
                    : "Custom"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {dress.neckline && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Neckline:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.neckline}
                    </span>
                  </div>
                )}

                {dress.silhouette && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Silhouette:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.silhouette}
                    </span>
                  </div>
                )}

                {dress.fabric && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Fabric:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.fabric}
                    </span>
                  </div>
                )}

                {dress.trainLength && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Train:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.trainLength}
                    </span>
                  </div>
                )}

                {dress.sleeveStyle && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Sleeves:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.sleeveStyle}
                    </span>
                  </div>
                )}

                {dress.sizes.length > 0 && (
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">
                      Sizes:
                    </span>
                    <span className="ml-2 text-stone-800 dark:text-stone-200">
                      {dress.sizes[0]}-{dress.sizes[dress.sizes.length - 1]}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onToggleVisibility(dress.id)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  {dress.isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {dress.isVisible ? "Hide" : "Show"}
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(dress)}
                  className="px-4 py-2 bg-stone-800 dark:bg-stone-600 hover:bg-stone-700 dark:hover:bg-stone-500 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(dress.id)}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
