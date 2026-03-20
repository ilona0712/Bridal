import { Heart } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../../assets/ImageWithFallback";
import type { Dress } from "../../types/dress";

type DressCardProps = {
  dress: Dress;
  onViewDetails: (dress: Dress) => void;
  onRightClick: (e: MouseEvent, dress: Dress) => void;
  isAdmin: boolean;
  isFavorite: boolean;
  onToggleFavorite: (dressId: string) => void;
  onRequestRent: (dress: Dress) => void;
};

function CollectionCarousel({ collections }: { collections: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!collections?.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % collections.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [collections]);

  if (!collections?.length) return null;

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="rounded-full bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-600 shadow-sm backdrop-blur-sm transition-all duration-300">
        {collections[index]}
      </div>
    </div>
  );
}

export default function DressCard({
  dress,
  onViewDetails,
  onRightClick,
  isAdmin,
  isFavorite,
  onToggleFavorite,
  onRequestRent,
}: DressCardProps) {
  return (
    <div
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onContextMenu={(e) => onRightClick(e, dress)}
    >
      <div
        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-stone-100"
        onClick={() => onViewDetails(dress)}
      >
        <ImageWithFallback
          src={dress.image}
          alt={dress.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <CollectionCarousel collections={dress.collections ?? []} />

        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(String(dress.id));
            }}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-pink-400 text-pink-400" : "text-stone-600"
                }`}
            />
          </button>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-serif text-lg text-stone-800">{dress.name}</h3>
          <p className="text-sm text-stone-500">
            {[dress.silhouette, dress.neckline].filter(Boolean).join(" • ")}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {dress.sizes?.length > 0 && (
            <span className="text-xs text-stone-500">
              Sizes: {dress.sizes[0]}-{dress.sizes[dress.sizes.length - 1]}
            </span>
          )}
          {dress.price > 0 && (
            <span className="text-sm font-medium text-stone-800">
              ${dress.price.toLocaleString()}
            </span>
          )}
        </div>

        {(dress.fabric || dress.sleeveStyle) && (
          <div className="flex gap-2 text-xs text-stone-600">
            {dress.fabric && (
              <span className="rounded bg-stone-100/70 px-2 py-1">
                {dress.fabric}
              </span>
            )}
            {dress.sleeveStyle && (
              <span className="rounded bg-stone-100/70 px-2 py-1">
                {dress.sleeveStyle}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          className="w-full rounded-lg bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 py-2 text-sm text-stone-700 transition-all hover:shadow-lg"
          onClick={() => onViewDetails(dress)}
        >
          View Details
        </button>

        <button
          type="button"
          className="w-full rounded-lg bg-stone-800 py-2 text-sm text-white transition-all hover:bg-stone-700"
          onClick={() => onRequestRent(dress)}
        >
          Request to Rent
        </button>
      </div>
    </div>
  );
}