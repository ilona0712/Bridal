import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../assets/ImageWithFallback";
import type { Dress } from "../../types/dress";

type DressContextMenuProps = {
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    dress: Dress | null;
  };
  onViewDetails: (dress: Dress) => void;
  onClose: () => void;
};

export default function DressContextMenu({
  contextMenu,
  onViewDetails,
  onClose,
}: DressContextMenuProps) {
  if (!contextMenu.visible || !contextMenu.dress) return null;

  const { dress, x, y } = contextMenu;

  return (
    <div
      className="fixed bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-stone-200/50 dark:border-stone-700/50 py-2 z-50 min-w-[280px]"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-stone-200/50 dark:border-stone-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={dress.image}
              alt={dress.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-serif text-sm text-stone-800 dark:text-stone-100">
              {dress.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              $
              {dress.price !== null && dress.price !== undefined
                ? dress.price.toLocaleString()
                : "Custom"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Collection
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.collections.join(" • ")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Neckline
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.neckline}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Silhouette
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.silhouette}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Fabric
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.fabric}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Train Length
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.trainLength}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Sleeve Style
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.sleeveStyle}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Available Sizes
          </span>
          <span className="text-xs text-stone-800 dark:text-stone-200">
            {dress.sizes[0]}-{dress.sizes[dress.sizes.length - 1]}
          </span>
        </div>
      </div>

      <div className="px-2 py-2 border-t border-stone-200/50 dark:border-stone-700/50 space-y-1">
        <button
          type="button"
          onClick={() => {
            onViewDetails(dress);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-700/50 rounded-lg transition-colors"
        >
          View Full Details
        </button>

        <button
          type="button"
          className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-700/50 rounded-lg transition-colors"
        >
          Request to Rent
        </button>

        <Link
          to="/isabella"
          state={{ dress }}
          className="w-full px-3 py-2 text-left text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-700/50 rounded-lg transition-colors block"
        >
          Customize with MAI
        </Link>
      </div>
    </div>
  );
}
