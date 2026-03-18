import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";

const LOCAL_STORAGE_KEY = "favoriteDressIds";

export function useGalleryFavorites(
  isAdmin: boolean,
  session: Session | null,
) {
  const [favoriteDressIds, setFavoriteDressIds] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const loadFavorites = async () => {
      setLoadingFavorites(true);

      if (isAdmin) {
        setFavoriteDressIds([]);
        setLoadingFavorites(false);
        return;
      }

      if (!isLoggedIn || !session?.user) {
        const savedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
        setFavoriteDressIds(savedFavorites ? JSON.parse(savedFavorites) : []);
        setLoadingFavorites(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorite_dresses")
        .select("dress_id")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error loading favorites:", error);
        setFavoriteDressIds([]);
      } else {
        setFavoriteDressIds((data || []).map((row) => row.dress_id));
      }

      setLoadingFavorites(false);
    };

    loadFavorites();
  }, [isAdmin, isLoggedIn, session]);

  const toggleFavorite = async (dressId: string) => {
    if (isAdmin) return;

    if (!isLoggedIn || !session?.user) {
      setFavoriteDressIds((prev) => {
        const updated = prev.includes(dressId)
          ? prev.filter((id) => id !== dressId)
          : [...prev, dressId];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const alreadyFavorite = favoriteDressIds.includes(dressId);

    if (alreadyFavorite) {
      const { error } = await supabase
        .from("favorite_dresses")
        .delete()
        .eq("user_id", session.user.id)
        .eq("dress_id", dressId);

      if (error) {
        console.error("Error removing favorite:", error);
        return;
      }

      setFavoriteDressIds((prev) => prev.filter((id) => id !== dressId));
    } else {
      const { error } = await supabase
        .from("favorite_dresses")
        .insert({
          user_id: session.user.id,
          dress_id: dressId,
        });

      if (error) {
        console.error("Error adding favorite:", error);
        return;
      }

      setFavoriteDressIds((prev) => [...prev, dressId]);
    }
  };

  return {
    favoriteDressIds,
    toggleFavorite,
    loadingFavorites,
  };
}