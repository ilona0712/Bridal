import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { EMPTY_DRESS_FORM } from "../../utils/admin/adminDressFormConfig";
import type { DressFormData } from "../../types/admin";
import type { Dress } from "../../types/dress";

export function useAdminDressForm(onError?: (message: string) => void) {
  const [formData, setFormData] = useState<DressFormData>(EMPTY_DRESS_FORM);
  const [dragActive, setDragActive] = useState(false);
  const [imageFiles, setImageFiles] = useState<Array<File | null>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSizeToggle = (size: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size].sort((a, b) => a - b),
    }));
  };

  const handleCollectionToggle = (collection: string) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.includes(collection)
        ? prev.collections.filter((c) => c !== collection)
        : [...prev.collections, collection],
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_DRESS_FORM);
    setDragActive(false);
    setImageFiles([]);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const currentCount = formData.images.length;
    const incomingFiles = Array.from(files).slice(0, 6 - currentCount);

    if (incomingFiles.length === 0) {
      (onError ?? alert)("You can upload up to 6 images only.");
      return;
    }

    Promise.all(
      incomingFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === "string") resolve(result);
              else reject(new Error("Failed to read file"));
            };

            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((previewImages) => {
        setFormData((prev) => {
          const nextImages = [...prev.images, ...previewImages].slice(0, 6);

          return {
            ...prev,
            images: nextImages,
            image: nextImages[0] || "",
          };
        });

        setImageFiles((prev) => [...prev, ...incomingFiles].slice(0, 6));
      })
      .catch((error) => {
        console.error("Image upload error:", error);
        (onError ?? alert)("Failed to upload one or more images.");
      });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setFormData((prev) => {
      const nextImages = [...prev.images];
      const [moved] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, moved);
      return { ...prev, images: nextImages, image: nextImages[0] || "" };
    });

    setImageFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter(
        (_, index) => index !== indexToRemove,
      );

      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || "",
      };
    });

    setImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const startEditingDress = (dress: Dress) => {
    const existingImages = dress.images ?? [dress.image];

    setFormData({
      name: dress.name,
      collections: dress.collections,
      price: dress.price ?? null,
      image: dress.image,
      images: existingImages,
      sizes: dress.sizes,
      neckline: dress.neckline,
      silhouette: dress.silhouette,
      fabric: dress.fabric,
      trainLength: dress.trainLength,
      sleeveStyle: dress.sleeveStyle,
    });

    setImageFiles(existingImages.map(() => null));
  };

  return {
    formData,
    setFormData,
    dragActive,
    fileInputRef,
    imageFiles,
    handleSizeToggle,
    handleCollectionToggle,
    resetForm,
    handleDrag,
    handleDrop,
    handleFileInput,
    reorderImages,
    removeImage,
    startEditingDress,
  };
}