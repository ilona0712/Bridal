import { ImageWithFallback } from "../../assets/ImageWithFallback";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CollectionCardProps = {
  images: string[];
  imageAlt: string;
  name: string;
  style: string;
};

export default function CollectionCard({
  images,
  imageAlt,
  name,
  style,
}: CollectionCardProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
const [animating, setAnimating] = useState(false);

useEffect(() => {
  if (images.length <= 1) return;
  const interval = setInterval(() => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
      setAnimating(false);
    }, 600);
  }, 3000);
  return () => clearInterval(interval);
}, [images]);
  return (
    <Link
  to={`/gallery?collection=${encodeURIComponent(name)}`}
  className="block space-y-3 hover:-translate-y-1 transition-transform"
>
      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative">
  <ImageWithFallback
    src={images[currentIndex] ?? ""}
    alt={imageAlt}
    className={`w-full h-full object-cover transition-all duration-600 ${
      animating ? "opacity-0 scale-105" : "opacity-100 scale-100"
    }`}
  />

  {images.length > 1 && (
    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
      {images.map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
            i === currentIndex ? "bg-white" : "bg-white/40"
          }`}
        />
      ))}
    </div>
  )}
</div>
      <div className="text-center">
        <div className="text-stone-800">{name}</div>
        <div className="text-sm text-stone-500">{style}</div>
      </div>
    </Link>
  );
}
