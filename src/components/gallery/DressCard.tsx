import { Heart } from "lucide-react";
import type { MouseEvent } from "react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import type { Dress } from "../../types/dress";

type DressCardProps = {
  dress: Dress;
  onViewDetails: (dress: Dress) => void;
  onRightClick: (e: MouseEvent, dress: Dress) => void;
  isAdmin: boolean;
  isFavorite: boolean;
  onToggleFavorite: (dressId: string) => void;
};

export default function DressCard({
  dress,
  onViewDetails,
  onRightClick,
  isAdmin,
  isFavorite,
  onToggleFavorite,
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

        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dress.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-pink-400 text-pink-400" : "text-stone-600"
              }`}
            />
          </button>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {dress.collections.map((collection, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-stone-800/70 backdrop-blur-sm rounded-full w-fit"
            >
              <span className="text-xs text-white">{collection}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-serif text-lg text-stone-800">{dress.name}</h3>
          <p className="text-sm text-stone-500">
            {[dress.silhouette, dress.neckline].filter(Boolean).join(" • ")}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {dress.sizes.length > 0 && (
            <span className="text-xs text-stone-500">
              Sizes: {dress.sizes[0]}-{dress.sizes[dress.sizes.length - 1]}
            </span>
          )}
        </div>

        {(dress.fabric || dress.sleeveStyle) && (
          <div className="flex gap-2 text-xs text-stone-600">
            {dress.fabric && (
              <span className="px-2 py-1 bg-stone-100/70 rounded">
                {dress.fabric}
              </span>
            )}
            {dress.sleeveStyle && (
              <span className="px-2 py-1 bg-stone-100/70 rounded">
                {dress.sleeveStyle}
              </span>
            )}
          </div>
        )}

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
      </div>
    </div>
  );
}
