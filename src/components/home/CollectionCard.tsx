import { ImageWithFallback } from "../../figma/ImageWithFallback";

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
    <div className="space-y-3">
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
    </div>
  );
}
