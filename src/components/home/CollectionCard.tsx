import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { Link } from "react-router-dom";

type CollectionCardProps = {
  imageSrc: string;
  imageAlt: string;
  name: string;
  style: string;
};

export default function CollectionCard({
  imageSrc,
  imageAlt,
  name,
  style,
}: CollectionCardProps) {
  return (
    <Link
  to={`/gallery?collection=${encodeURIComponent(name)}`}
  className="block space-y-3 hover:-translate-y-1 transition-transform"
>
      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-center">
        <div className="text-stone-800">{name}</div>
        <div className="text-sm text-stone-500">{style}</div>
      </div>
    </Link>
  );
}
