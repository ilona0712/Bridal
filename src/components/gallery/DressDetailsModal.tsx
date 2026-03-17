import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../../assets/ImageWithFallback";
import type { Dress } from "../../types/dress";

type DressDetailsModalProps = {
  dress: Dress;
  onClose: () => void;
};

export default function DressDetailsModal({
  dress,
  onClose,
}: DressDetailsModalProps) {
  const images = dress.images && dress.images.length > 0 ? dress.images : [dress.image];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 px-6 py-5 border-b border-stone-200/50 flex items-center justify-between z-10">
          <h2 className="font-serif text-2xl text-stone-800">{dress.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 bg-white/60 hover:bg-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={images[currentIndex]}
                alt={`${dress.name} ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>

                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-stone-800/70 text-white text-xs rounded-full mb-4">
                  {dress.collections.join(" • ")}
                </span>
                {dress.sizes.length > 0 && (
                  <p className="text-sm text-stone-500">
                    Available in sizes {dress.sizes[0]}-
                    {dress.sizes[dress.sizes.length - 1]}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-lg text-stone-800">
                  Dress Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Neckline</p>
                    <p className="text-sm text-stone-800">{dress.neckline}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Silhouette</p>
                    <p className="text-sm text-stone-800">{dress.silhouette}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Fabric</p>
                    <p className="text-sm text-stone-800">{dress.fabric}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Train Length</p>
                    <p className="text-sm text-stone-800">{dress.trainLength}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Sleeve Style</p>
                    <p className="text-sm text-stone-800">{dress.sleeveStyle}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  type="button"
                  className="w-full py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all text-sm"
                >
                  Request to Rent
                </button>

                <Link
                  to="/isabella"
                  state={{ dress }}
                  className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Customize with Isabella
                </Link>

                <button
                  type="button"
                  className="w-full py-3 bg-stone-100/70 text-stone-700 rounded-xl hover:bg-stone-100 transition-all text-sm"
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}