import { Heart } from "lucide-react";
import type { MouseEvent } from "react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import type { Dress } from "../../types/dress";

type DressCardProps = {
  dress: Dress;
  onViewDetails: (dress: Dress) => void;
  onRightClick: (e: MouseEvent, dress: Dress) => void;
  isAdmin: boolean; //added for hide/show + deleting dress feature
  onToggleVisibility: (dressId: number) => void; //added for hide/show + deleting dress feature
  onDelete: (dressId: number) => void; //added for hide/show + deleting dress feature
};

export default function DressCard({
  dress,
  onViewDetails,
  onRightClick,
  isAdmin, //added for hide/show + deleting dress feature
  onToggleVisibility, //added for hide/show + deleting dress feature
  onDelete, //added for hide/show + deleting dress feature
}: DressCardProps) {
  return (
    <div
      className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 overflow-hidden hover:shadow-xl transition-shadow group"
      onContextMenu={(e) => onRightClick(e, dress)}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(dress)}
      >
        <ImageWithFallback
          src={dress.image}
          alt={dress.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-stone-600" />
        </div>
        <div className="absolute top-3 left-3 px-3 py-1 bg-stone-800/70 backdrop-blur-sm rounded-full">
          <span className="text-xs text-white">{dress.collections[0]}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-serif text-lg text-stone-800">{dress.name}</h3>
          <p className="text-sm text-stone-500">
            {dress.silhouette} • {dress.neckline}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Sizes: {dress.sizes[0]}-{dress.sizes[dress.sizes.length - 1]}
          </span>
        </div>

        <div className="flex gap-2 text-xs text-stone-600">
          <span className="px-2 py-1 bg-stone-100/70 rounded">
            {dress.fabric}
          </span>
          <span className="px-2 py-1 bg-stone-100/70 rounded">
            {dress.sleeveStyle}
          </span>
        </div>

        <button
          type="button"
          className="w-full py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-lg hover:shadow-lg transition-all text-sm"
          onClick={() => onViewDetails(dress)}
        >
          View Details
        </button>

        <button
          type="button"
          className="w-full py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-all text-sm"
        >
          Request to Rent
        </button>
        {/*added for hide/show + deleting dress feature */}
        {isAdmin && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onToggleVisibility(dress.id)}
              className="w-full py-2 bg-stone-100 text-stone-700 rounded-lg text-sm"
            >
              {dress.isVisible ? "Hide Dress" : "Show Dress"}
            </button>

            <button
              type="button"
              onClick={() => onDelete(dress.id)}
              className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm"
            >
              Delete Dress
            </button>
          </div>
        )}
        {isAdmin && !dress.isVisible && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500/80 rounded-full">
            <span className="text-xs text-white">Hidden</span>
          </div>
        )}
      </div>
    </div>
  );
}
