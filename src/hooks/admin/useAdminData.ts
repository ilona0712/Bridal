import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  type AdminDressRow,
} from "../../utils/admin/adminDressHelpers";
import {
  mapDressRowToUiDress
} from "../../utils/common/mapDressRowToUiDress"
import type { AdminCollection } from "../../types/admin";
import type { Dress } from "../../types/dress";

type CollectionRow = {
  id: string | number;
  name: string | null;
  is_active: boolean | null;
};

export function useAdminData() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingInitialData(true);
      setInitialDataError(null);

      const [
        { data: dressesData, error: dressesError },
        { data: collectionsData, error: collectionsError },
      ] = await Promise.all([
        supabase
          .from("dresses")
          .select(
            `
            id,
            name,
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
          .returns<AdminDressRow[]>(),
        supabase
          .from("collections")
          .select("id, name, is_active")
          .order("name", { ascending: true })
          .returns<CollectionRow[]>(),
      ]);

      if (dressesError) {
        console.error("Admin dresses fetch failed:", dressesError);
        setInitialDataError(dressesError.message);
        setLoadingInitialData(false);
        return;
      }

      if (collectionsError) {
        console.error("Admin collections fetch failed:", collectionsError);
        setInitialDataError(collectionsError.message);
        setLoadingInitialData(false);
        return;
      }

      const mappedDresses = (dressesData || []).map(mapDressRowToUiDress);
      const mappedCollections = (collectionsData || [])
        .filter((collection) => Boolean(collection.name))
        .map((collection) => ({
          id: String(collection.id),
          name: collection.name as string,
          isActive: collection.is_active ?? false,
        }));

      setDresses(mappedDresses);
      setCollections(mappedCollections);
      setLoadingInitialData(false);
    };

    fetchAdminData();
  }, []);

  return {
    dresses,
    setDresses,
    collections,
    setCollections,
    loadingInitialData,
    initialDataError,
  };
}