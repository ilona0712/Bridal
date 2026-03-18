import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { mapDressRowToUiDress } from "../../utils/common/mapDressRowToUiDress";
import type { Dress } from "../../types/dress";
import type { GalleryDressRow } from "../../utils/gallery/galleryDressHelper";

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

      const { data, error } = await supabase
        .from("dresses")
        .select(`
          id, name, silhouette, base_price, status,
          dress_images ( image_url, is_primary ),
          dress_collections ( collections ( name ) ),
          dress_attribute_values (
            attribute_values ( value_key, label, attributes ( key ) )
          )
        `)
        .returns<GalleryDressRow[]>();

      if (error) {
        console.error("Gallery fetch failed:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const mappedDresses = (data || []).map(mapDressRowToUiDress);

      // ── Build dynamic filter options from real data ────────
      const unique = (arr: string[]) =>
        ["All", ...Array.from(new Set(arr.filter(Boolean).sort()))]

      setAllCollections(["All", ...Array.from(new Set(
        mappedDresses.flatMap((d) => d.collections).filter(Boolean).sort()
      ))])
      setAllNecklines(unique(mappedDresses.map((d) => d.neckline)))
      setAllSilhouettes(unique(mappedDresses.map((d) => d.silhouette)))
      setAllFabrics(unique(mappedDresses.map((d) => d.fabric)))
      setAllTrainLengths(unique(mappedDresses.map((d) => d.trainLength)))
      setAllSleeveStyles(unique(mappedDresses.map((d) => d.sleeveStyle)))
      setAllDresses(mappedDresses)
      setLoading(false)
    }

    fetchDresses()
  }, [])

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
  }
}