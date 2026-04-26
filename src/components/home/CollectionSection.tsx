import CollectionCard from "./CollectionCard";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { mapDressRowToUiDress } from "../../utils/common/mapDressRowToUiDress";
import type { GalleryDressRow } from "../../utils/gallery/galleryDressHelper";

export default function CollectionSection() {
  type CollectionWithImages = { name: string; images: string[] };
  const [collections, setCollections] = useState<CollectionWithImages[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const [{ data: collectionsData, error: collectionsError }, { data: dressesData, error: dressesError }] =
        await Promise.all([
          supabase
            .from("collections")
            .select("name")
            .eq("is_active", true)
            .order("name"),
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
        ]);

      if (collectionsError || dressesError) {
        console.error("Collection section fetch failed:", collectionsError || dressesError);
        return;
      }

      if (collectionsData && dressesData) {
        const activeCollectionNames = new Set(
          collectionsData
            .map((collection) => collection.name)
            .filter((name): name is string => Boolean(name)),
        );

        const publishedDresses = dressesData.map(mapDressRowToUiDress);
        const mapped = Array.from(activeCollectionNames)
          .map((collectionName) => {
            const matchingDresses = publishedDresses.filter((dress) =>
              dress.collections.includes(collectionName),
            );

            const images = matchingDresses.flatMap((dress) => dress.images);

            return {
              name: collectionName,
              images,
            };
          })
          .filter((collection) => collection.images.length > 0);

        setCollections(mapped);
      }
    };
    fetchCollections();
  }, []);

  const firstRow = useMemo(() => {
    if (collections.length === 4) return collections.slice(0, 2);
    if (collections.length === 5) return collections.slice(0, 3);
    return collections;
  }, [collections]);

  const secondRow = useMemo(() => {
    if (collections.length === 4) return collections.slice(2);
    if (collections.length === 5) return collections.slice(3);
    return [];
  }, [collections]);

  const renderCard = (collection: CollectionWithImages, index: number) => (
    <motion.div
      key={collection.name}
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: "easeOut",
      }}
    >
      <CollectionCard
        images={collection.images}
        imageAlt={collection.name}
        name={collection.name}
        style="Collection"
      />
    </motion.div>
  );

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-3 text-center">
          <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
            Our Collections
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Explore stunning dresses designed by brides like you
          </p>
        </div>

        {collections.length <= 3 && (
          <div className="mx-auto grid max-w-5xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => renderCard(c, i))}
          </div>
        )}

        {collections.length === 4 && (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {firstRow.map((c, i) => renderCard(c, i))}
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        )}

        {collections.length === 5 && (
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {firstRow.map((c, i) => renderCard(c, i))}
            </div>
            <div className="mx-auto grid max-w-3xl gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        )}

        {collections.length >= 6 && (
          <div className="mx-auto grid max-w-6xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => renderCard(c, i))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-stone-300 dark:border-stone-600 bg-white/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 text-sm font-medium hover:bg-white dark:hover:bg-stone-800 hover:shadow-md transition-all duration-300"
          >
            Explore More Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
