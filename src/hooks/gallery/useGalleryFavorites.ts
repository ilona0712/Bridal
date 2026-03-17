import { useEffect, useState } from "react";

export function useGalleryFavorites(isAdmin: boolean) {
  const [favoriteDressIds, setFavoriteDressIds] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteDressIds");

    if (savedFavorites) {
      setFavoriteDressIds(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (dressId: string) => {
    if (isAdmin) return;

    setFavoriteDressIds((prev) => {
      const updated = prev.includes(dressId)
        ? prev.filter((id) => id !== dressId)
        : [...prev, dressId];

      localStorage.setItem("favoriteDressIds", JSON.stringify(updated));
      return updated;
    });
  };

  return {
    favoriteDressIds,
    toggleFavorite,
  };
}