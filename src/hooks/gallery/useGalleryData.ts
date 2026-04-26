import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { mapDressRowToUiDress } from "../../utils/common/mapDressRowToUiDress";
import type { Dress } from "../../types/dress";
import type { GalleryDressRow } from "../../utils/gallery/galleryDressHelper";

type AttributeValueRow = {
  label: string;
  sort_order: number;
  attributes: { key: string };
};

export function useGalleryData() {
  const [allCollections,  setAllCollections]  = useState<string[]>(["All"]);
  const [allDresses,      setAllDresses]      = useState<Dress[]>([]);
  const [allNecklines,    setAllNecklines]    = useState<string[]>(["All"]);
  const [allSilhouettes,  setAllSilhouettes]  = useState<string[]>(["All"]);
  const [allFabrics,      setAllFabrics]      = useState<string[]>(["All"]);
  const [allTrainLengths, setAllTrainLengths] = useState<string[]>(["All"]);
  const [allSleeveStyles, setAllSleeveStyles] = useState<string[]>(["All"]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);

  useEffect(() => {
    const fetchDresses = async () => {
      setLoading(true);
      setError(null);

      const [
        { data: dressData, error: dressError },
        { data: attrData, error: attrError },
      ] = await Promise.all([
        supabase
          .from("dresses")
          .select(`
            id, name, base_price, status,
            dress_images ( image_url, is_primary ),
            dress_collections ( collections ( name ) ),
            dress_attribute_values (
              attribute_values ( value_key, label, attributes ( key ) )
            )
          `)
          .eq("status", "published")
          .returns<GalleryDressRow[]>(),
        supabase
          .from("attribute_values")
          .select("label, sort_order, attributes!inner(key)")
          .order("sort_order", { ascending: true })
          .returns<AttributeValueRow[]>(),
      ]);

      if (dressError) {
        console.error("Gallery fetch failed:", dressError);
        setError(dressError.message);
        setLoading(false);
        return;
      }

      if (attrError) {
        console.error("Gallery attribute values fetch failed:", attrError);
        setError(attrError.message);
        setLoading(false);
        return;
      }

      const mappedDresses = (dressData || []).map(mapDressRowToUiDress);

      setAllCollections(["All", ...Array.from(new Set(
        mappedDresses.flatMap((d) => d.collections).filter(Boolean).sort()
      ))]);

      const grouped: Record<string, string[]> = {};
      for (const row of attrData || []) {
        const key = row.attributes.key;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row.label);
      }

      setAllNecklines(["All", ...(grouped["neckline"] ?? [])]);
      setAllSilhouettes(["All", ...(grouped["silhouette"] ?? [])]);
      setAllFabrics(["All", ...(grouped["fabric"] ?? [])]);
      setAllTrainLengths(["All", ...(grouped["train_length"] ?? [])]);
      setAllSleeveStyles(["All", ...(grouped["sleeve_style"] ?? [])]);
      setAllDresses(mappedDresses);
      setLoading(false);
    };

    fetchDresses();
  }, []);

  return {
    allCollections,
    allDresses,
    allNecklines,
    allSilhouettes,
    allFabrics,
    allTrainLengths,
    allSleeveStyles,
    loading,
    error,
    setAllCollections,
    setAllDresses,
  };
}
