import type { ActiveTab } from "../../types/admin";

type AdminTabsProps = {
  activeTab: ActiveTab;
  dressesCount: number;
  isEditingDress: boolean;
  onListClick: () => void;
  onAddClick: () => void;
  onCollectionsClick: () => void;
};

export default function AdminTabs({
  activeTab,
  dressesCount,
  isEditingDress,
  onListClick,
  onAddClick,
  onCollectionsClick,
}: AdminTabsProps) {
  return (
    <div className="flex gap-2 border-b border-stone-200">
      <button
        type="button"
        onClick={onListClick}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === "list"
            ? "text-stone-800 border-b-2 border-stone-800"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        All Dresses ({dressesCount})
      </button>

      <button
        type="button"
        onClick={onAddClick}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === "add"
            ? "text-stone-800 border-b-2 border-stone-800"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        {isEditingDress ? "Edit Dress" : "Add New Dress"}
      </button>

      <button
        type="button"
        onClick={onCollectionsClick}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === "collections"
            ? "text-stone-800 border-b-2 border-stone-800"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Manage Collections
      </button>
    </div>
  );
}