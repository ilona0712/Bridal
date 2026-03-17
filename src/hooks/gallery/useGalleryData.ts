import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { mapDressRowToUiDress } from "../../utils/common/mapDressRowToUiDress";
import type { Dress } from "../../types/dress";
import type { GalleryDressRow } from "../../utils/gallery/galleryDressHelper";

export function useGalleryData(initialCollections: string[]) {
  const [allCollections, setAllCollections] = useState<string[]>(initialCollections);
  const [allDresses, setAllDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDresses = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("dresses")
        .select(
          `
          id,
          name,
          silhouette,
          base_price,
          status,
          dress_images (
            image_url,
            is_primary
          ),
          dress_collections (
            collections (
              name
            )
          ),
          dress_attribute_values (
            attribute_values (
              value_key,
              label,
              attributes (
                key
              )
            )
          )
          `,
        )
        .returns<GalleryDressRow[]>();

      if (error) {
        console.error("Gallery fetch failed:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const mappedDresses = (data || []).map(mapDressRowToUiDress);

      const dbCollections = Array.from(
        new Set(
          mappedDresses.flatMap((dress) => dress.collections).filter(Boolean),
        ),
      );

      setAllCollections(["All", ...dbCollections]);
      setAllDresses(mappedDresses);
      setLoading(false);
    };

    fetchDresses();
  }, []);

  return {
    allCollections,
    allDresses,
    loading,
    error,
    setAllCollections,
    setAllDresses,
  };
}