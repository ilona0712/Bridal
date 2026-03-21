import type { ActiveTab } from "../../types/admin";

type AdminTabsProps = {
  activeTab: ActiveTab;
  dressesCount: number;
  isEditingDress: boolean;
  onListClick: () => void;
  onAddClick: () => void;
  onCollectionsClick: () => void;
  onSettingsClick: () => void;
};

export default function AdminTabs({
  activeTab,
  dressesCount,
  isEditingDress,
  onListClick,
  onAddClick,
  onCollectionsClick,
  onSettingsClick,
}: AdminTabsProps) {
  return (
    <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700 overflow-x-auto">
      <button
        type="button"
        onClick={onListClick}
        className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
          activeTab === "list"
            ? "text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        }`}
      >
        All Dresses ({dressesCount})
      </button>

      <button
        type="button"
        onClick={onAddClick}
        className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
          activeTab === "add"
            ? "text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        }`}
      >
        {isEditingDress ? "Edit Dress" : "Add New Dress"}
      </button>

      <button
        type="button"
        onClick={onCollectionsClick}
        className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
          activeTab === "collections"
            ? "text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        }`}
      >
        Manage Collections
      </button>

      <button
        type="button"
        onClick={onSettingsClick}
        className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
          activeTab === "settings"
            ? "text-stone-800 dark:text-stone-100 border-b-2 border-stone-800 dark:border-stone-100"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        }`}
      >
        Site Settings
      </button>
    </div>
  )
}