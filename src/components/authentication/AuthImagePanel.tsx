import { ImageWithFallback } from "../../assets/ImageWithFallback";

type AuthImagePanelProps = {
  src: string;
  alt: string;
};

export default function AuthImagePanel({ src, alt }: AuthImagePanelProps) {
  return (
    <div className="hidden lg:block">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent rounded-3xl" />
        <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
          <ImageWithFallback
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
